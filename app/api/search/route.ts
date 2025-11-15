import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import File from "@/models/File";

// Simple text embedding function (matching the one in OCR)
function generateSimpleEmbeddings(text: string): number[] {
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  const embedding = new Array(384).fill(0);
  
  words.forEach((word, index) => {
    const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const position = hash % 384;
    embedding[position] += 1 / (words.length + 1);
  });
  
  return embedding;
}

// Calculate cosine similarity between two embeddings
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export async function POST(req: NextRequest) {
  try {
    const { query, userProfile = null, filters = {} } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Generate embeddings for the search query
    const queryEmbeddings = generateSimpleEmbeddings(query);

    // Build MongoDB query with filters
    const searchCriteria: any = {
      isPublic: true, // Only search public files
    };

    if (filters.subject) {
      searchCriteria['labels.subject'] = new RegExp(filters.subject, 'i');
    }
    if (filters.class) {
      searchCriteria['labels.class'] = new RegExp(filters.class, 'i');
    }
    if (filters.semester) {
      searchCriteria['labels.semester'] = new RegExp(filters.semester, 'i');
    }
    if (filters.uploaderType) {
      searchCriteria.uploaderType = filters.uploaderType;
    }

    // First, get files that match text search or filters
    let files;
    try {
      // Text search in labels and OCR text
      const textSearchCriteria = {
        ...searchCriteria,
        $or: [
          { $text: { $search: query } },
          { 'labels.subject': new RegExp(query, 'i') },
          { 'labels.topic': new RegExp(query, 'i') },
          { 'labels.tags': { $in: [new RegExp(query, 'i')] } },
          { ocrText: new RegExp(query, 'i') },
        ]
      };
      
      files = await File.find(textSearchCriteria)
        .populate('uploaderId', 'name userType')
        .select('fileName originalName fileSize cloudflareUrl labels metadata ocrText embeddings ratings viewsCount uploaderType')
        .lean()
        .limit(50);
    } catch (textSearchError) {
      console.log("Text search failed, falling back to basic search:", textSearchError);
      // Fallback to basic search without full-text search
      files = await File.find({
        ...searchCriteria,
        $or: [
          { 'labels.subject': new RegExp(query, 'i') },
          { 'labels.topic': new RegExp(query, 'i') },
          { 'labels.tags': { $in: [new RegExp(query, 'i')] } },
        ]
      })
      .populate('uploaderId', 'name userType')
      .select('fileName originalName fileSize cloudflareUrl labels metadata ocrText embeddings ratings viewsCount uploaderType')
      .lean()
      .limit(50);
    }

    // Calculate semantic similarity scores
    const filesWithScores = files.map((file: any) => {
      let semanticScore = 0;
      let textMatchScore = 0;
      let labelMatchScore = 0;

      // Semantic similarity using embeddings
      if (file.embeddings && file.embeddings.length === 384) {
        semanticScore = cosineSimilarity(queryEmbeddings, file.embeddings);
      }

      // Text match score
      const queryWords = query.toLowerCase().split(/\W+/);
      const textContent = (file.ocrText || '').toLowerCase();
      const matchingWords = queryWords.filter(word => textContent.includes(word));
      textMatchScore = matchingWords.length / queryWords.length;

      // Label match score
      const labels = [
        file.labels?.subject || '',
        file.labels?.topic || '',
        ...(file.labels?.tags || [])
      ].join(' ').toLowerCase();
      const labelMatchingWords = queryWords.filter(word => labels.includes(word));
      labelMatchScore = labelMatchingWords.length / queryWords.length;

      // Combine scores with weights
      const combinedScore = (
        semanticScore * 0.4 +
        textMatchScore * 0.3 +
        labelMatchScore * 0.3
      );

      // Factor in ratings
      const ratingBoost = (file.ratings?.averageRating || 0) / 5 * 0.1;
      const finalScore = combinedScore + ratingBoost;

      return {
        ...file,
        searchScore: {
          semantic: semanticScore,
          textMatch: textMatchScore,
          labelMatch: labelMatchScore,
          rating: file.ratings?.averageRating || 0,
          combined: finalScore,
        }
      };
    });

    // Sort by combined score (highest first)
    filesWithScores.sort((a, b) => b.searchScore.combined - a.searchScore.combined);

    // Filter out files with very low scores
    const relevantFiles = filesWithScores.filter(file => file.searchScore.combined > 0.1);

    // Format response
    const results = relevantFiles.map((file: any) => ({
      id: file._id,
      fileName: file.originalName,
      cloudflareUrl: file.cloudflareUrl,
      labels: file.labels,
      metadata: file.metadata,
      uploaderType: file.uploaderType,
      uploader: file.uploaderId,
      ratings: file.ratings,
      viewsCount: file.viewsCount,
      searchScore: file.searchScore,
      preview: file.ocrText?.substring(0, 200) + (file.ocrText?.length > 200 ? '...' : ''),
    }));

    return NextResponse.json({
      results,
      query,
      totalResults: results.length,
      searchMetrics: {
        avgSemanticScore: results.reduce((sum, r) => sum + r.searchScore.semantic, 0) / results.length,
        avgTextMatchScore: results.reduce((sum, r) => sum + r.searchScore.textMatch, 0) / results.length,
        avgLabelMatchScore: results.reduce((sum, r) => sum + r.searchScore.labelMatch, 0) / results.length,
      }
    });

  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import File from "@/models/File";

// Simple text embedding function (matching the one in OCR)
function generateSimpleEmbeddings(text: string): number[] {
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  const embedding = new Array(384).fill(0);

  words.forEach((word) => {
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

// Types used in this file
interface SearchFilters {
  subject?: string;
  class?: string;
  semester?: string;
  uploaderType?: string;
  [key: string]: any;
}

interface FileLabels {
  subject?: string;
  topic?: string;
  tags?: string[];
  [key: string]: any;
}

interface Ratings {
  averageRating?: number;
  [key: string]: any;
}

interface Uploader {
  _id?: any;
  name?: string;
  userType?: string;
  [key: string]: any;
}

interface FileDoc {
  _id?: any;
  fileName?: string;
  originalName?: string;
  fileSize?: number;
  cloudflareUrl?: string;
  labels?: FileLabels;
  metadata?: any;
  ocrText?: string;
  embeddings?: number[];
  ratings?: Ratings;
  viewsCount?: number;
  uploaderType?: string;
  uploaderId?: Uploader | any;
  [key: string]: any;
}

interface SearchScore {
  semantic: number;
  textMatch: number;
  labelMatch: number;
  rating: number;
  combined: number;
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
    const searchCriteria: Record<string, any> = {
      isPublic: true, // Only search public files
    };

    if ((filters as SearchFilters).subject) {
      searchCriteria['labels.subject'] = new RegExp((filters as SearchFilters).subject as string, 'i');
    }
    if ((filters as SearchFilters).class) {
      searchCriteria['labels.class'] = new RegExp((filters as SearchFilters).class as string, 'i');
    }
    if ((filters as SearchFilters).semester) {
      searchCriteria['labels.semester'] = new RegExp((filters as SearchFilters).semester as string, 'i');
    }
    if ((filters as SearchFilters).uploaderType) {
      searchCriteria.uploaderType = (filters as SearchFilters).uploaderType;
    }

    // First, get files that match text search or filters
    let files: FileDoc[] = [];
    try {
      // Text search in labels and OCR text
      const textSearchCriteria: Record<string, any> = {
        ...searchCriteria,
        $or: [
          { $text: { $search: query } },
          { 'labels.subject': new RegExp(query, 'i') },
          { 'labels.topic': new RegExp(query, 'i') },
          { 'labels.tags': { $in: [new RegExp(query, 'i')] } },
          { ocrText: new RegExp(query, 'i') },
        ]
      };

      files = (await File.find(textSearchCriteria)
        .populate('uploaderId', 'name userType')
        .select('fileName originalName fileSize cloudflareUrl labels metadata ocrText embeddings ratings viewsCount uploaderType')
        .lean()
        .limit(50)) as FileDoc[];
    } catch (textSearchError) {
      console.log("Text search failed, falling back to basic search:", textSearchError);
      // Fallback to basic search without full-text search
      files = (await File.find({
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
        .limit(50)) as FileDoc[];
    }

    // Calculate semantic similarity scores
    const filesWithScores: (FileDoc & { searchScore: SearchScore })[] = files.map((file: FileDoc) => {
      let semanticScore = 0;
      let textMatchScore = 0;
      let labelMatchScore = 0;

      // Semantic similarity using embeddings
      if (file.embeddings && file.embeddings.length === 384) {
        semanticScore = cosineSimilarity(queryEmbeddings, file.embeddings);
      }

      // Text match score
      const queryWords: string[] = query.toLowerCase().split(/\W+/).filter(Boolean);
      const textContent: string = (file.ocrText || '').toLowerCase();
      const matchingWords: string[] = queryWords.filter(word => textContent.includes(word));
      textMatchScore = queryWords.length ? matchingWords.length / queryWords.length : 0;

      // Label match score
      const labels: string = [
        file.labels?.subject || '',
        file.labels?.topic || '',
        ...(file.labels?.tags || [])
      ].join(' ').toLowerCase();
      const labelMatchingWords: string[] = queryWords.filter(word => labels.includes(word));
      labelMatchScore = queryWords.length ? labelMatchingWords.length / queryWords.length : 0;

      // Combine scores with weights
      const combinedScore: number = (
        semanticScore * 0.4 +
        textMatchScore * 0.3 +
        labelMatchScore * 0.3
      );

      // Factor in ratings
      const ratingBoost: number = (file.ratings?.averageRating || 0) / 5 * 0.1;
      const finalScore: number = combinedScore + ratingBoost;

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
    const results = relevantFiles.map((file: FileDoc & { searchScore: SearchScore }) => ({
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
      preview: (file.ocrText?.substring(0, 200) ?? '') + ((file.ocrText?.length ?? 0) > 200 ? '...' : ''),
    }));

    return NextResponse.json({
      results,
      query,
      totalResults: results.length,
      searchMetrics: {
        avgSemanticScore: results.length ? results.reduce((sum, r) => sum + r.searchScore.semantic, 0) / results.length : 0,
        avgTextMatchScore: results.length ? results.reduce((sum, r) => sum + r.searchScore.textMatch, 0) / results.length : 0,
        avgLabelMatchScore: results.length ? results.reduce((sum, r) => sum + r.searchScore.labelMatch, 0) / results.length : 0,
      }
    });

  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
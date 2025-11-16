import { NextRequest, NextResponse } from "next/server";
import { File } from "@/app/models/File";
import LocalFileStorage from "@/lib/fileStorage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Enhanced text similarity function with label matching
function calculateLabelSimilarity(query: string, labels: any): number {
  const queryWords = query.toLowerCase().split(/\W+/).filter(word => word.length > 1);
  let score = 0;
  let totalChecks = 0;

  // Check each label field
  const labelFields = [
    labels?.subject,
    labels?.topic,
    labels?.class,
    labels?.semester,
    ...(Array.isArray(labels?.tags) ? labels.tags : [])
  ].filter(Boolean);

  labelFields.forEach(labelValue => {
    if (typeof labelValue === 'string') {
      totalChecks++;
      const labelWords = labelValue.toLowerCase().split(/\W+/).filter(word => word.length > 1);
      
      queryWords.forEach(queryWord => {
        labelWords.forEach(labelWord => {
          if (labelWord.includes(queryWord) || queryWord.includes(labelWord)) {
            score += 1;
          } else if (labelWord === queryWord) {
            score += 2; // Exact match bonus
          }
        });
      });
    }
  });

  return totalChecks > 0 ? score / (queryWords.length * totalChecks) : 0;
}

// Text content similarity
function calculateTextSimilarity(query: string, content: string): number {
  if (!content) return 0;
  
  const queryWords = query.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  const contentWords = content.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  
  const matches = queryWords.filter(word => 
    contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))
  );
  
  return queryWords.length > 0 ? matches.length / queryWords.length : 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, filters } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Get all files from database
    const allFiles = await (File as any).findAll();
    
    if (!allFiles || allFiles.length === 0) {
      return NextResponse.json({
        results: [],
        query,
        totalResults: 0,
        message: "No files found in database"
      });
    }

    // Calculate relevance scores for each file
    const resultsWithScores = allFiles.map((file: any) => {
      let score = 0;

      // 1. Label similarity (highest weight - 60%)
      const labelScore = calculateLabelSimilarity(query, file.labels);
      score += labelScore * 0.6;

      // 2. Text content similarity (30%)
      const textScore = calculateTextSimilarity(query, file.content || '');
      score += textScore * 0.3;

      // 3. Filename matches (10%)
      const fileName = (file.original_name || file.file_name || '').toLowerCase();
      if (fileName.includes(query.toLowerCase())) {
        score += 0.1;
      }

      // Apply filters
      if (filters && Object.keys(filters).length > 0) {
        let filterMatch = true;
        
        if (filters.subject && file.labels?.subject !== filters.subject) {
          filterMatch = false;
        }
        if (filters.class && file.labels?.class !== filters.class) {
          filterMatch = false;
        }
        if (filters.semester && file.labels?.semester !== filters.semester) {
          filterMatch = false;
        }
        if (filters.uploaderType && file.labels?.uploaderType !== filters.uploaderType) {
          filterMatch = false;
        }
        
        if (!filterMatch) {
          score = 0; // Exclude files that don't match filters
        }
      }

      return {
        ...file,
        searchScore: score,
        fileUrl: LocalFileStorage.getFileUrl(file.file_name)
      };
    });

    // Filter out files with zero score and sort by relevance
    const filteredResults = resultsWithScores
      .filter((file: any) => file.searchScore > 0)
      .sort((a: any, b: any) => b.searchScore - a.searchScore);

    // Format results to match the frontend interface
    const results = filteredResults.map((file: any) => ({
      id: file.id,
      fileName: file.original_name || file.file_name,
      cloudflareUrl: `/file/${file.id}`, // Link to file view page
      labels: {
        subject: file.labels?.subject || "General",
        topic: file.labels?.topic || "General", 
        class: file.labels?.class,
        semester: file.labels?.semester,
        tags: file.labels?.tags || []
      },
      metadata: {
        pageCount: file.metadata?.pageCount,
        extractedAt: file.created_at || new Date().toISOString()
      },
      uploaderType: file.labels?.uploaderType || "student",
      uploader: {
        name: file.labels?.uploaderName || "Anonymous User",
        userType: file.labels?.uploaderType || "student"
      },
      ratings: {
        averageRating: file.labels?.averageRating || 0,
        totalRatings: file.labels?.totalRatings || 0
      },
      viewsCount: file.labels?.viewsCount || 0,
      searchScore: {
        semantic: calculateLabelSimilarity(query, file.labels),
        textMatch: calculateTextSimilarity(query, file.content || ''),
        labelMatch: calculateLabelSimilarity(query, file.labels),
        rating: file.labels?.averageRating || 0,
        combined: file.searchScore
      },
      preview: file.content?.substring(0, 200) + (file.content?.length > 200 ? '...' : '') || 'No preview available'
    }));

    return NextResponse.json({
      results: results.slice(0, 50), // Limit to 50 results
      query,
      totalResults: results.length,
      searchMetrics: {
        avgScore: results.length ? results.reduce((sum: number, r: any) => sum + r.searchScore.combined, 0) / results.length : 0,
        maxScore: results.length ? Math.max(...results.map((r: any) => r.searchScore.combined)) : 0,
      }
    });

  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed", detail: error.message },
      { status: 500 }
    );
  }
}

// Keep GET method for backward compatibility
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: "Please use POST method for search",
    endpoint: "/api/search",
    method: "POST",
    body: {
      query: "your search terms",
      filters: {
        subject: "optional",
        class: "optional", 
        semester: "optional",
        uploaderType: "optional"
      }
    }
  });
}
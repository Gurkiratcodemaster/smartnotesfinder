import { NextRequest, NextResponse } from "next/server";
import File from "@/app/models/File";
import LocalFileStorage from "@/lib/fileStorage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Simple text similarity function
function calculateTextSimilarity(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  const contentWords = content.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  
  const matches = queryWords.filter(word => 
    contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))
  );
  
  return queryWords.length > 0 ? matches.length / queryWords.length : 0;
}

// Types for search
interface SearchFilters {
  subject?: string;
  topic?: string;
  tags?: string;
  fileType?: string;
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const tags = searchParams.get('tags');
    const fileType = searchParams.get('fileType');

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    let files;
    
    if (query.trim()) {
      // Search files by content
      files = await File.search(query);
    } else {
      // Get all files
      files = await File.findAll();
    }

    // Apply additional filters
    let filteredFiles = files;

    if (subject) {
      filteredFiles = filteredFiles.filter(file => 
        file.labels?.subject?.toLowerCase().includes(subject.toLowerCase())
      );
    }

    if (topic) {
      filteredFiles = filteredFiles.filter(file => 
        file.labels?.topic?.toLowerCase().includes(topic.toLowerCase())
      );
    }

    if (tags) {
      filteredFiles = filteredFiles.filter(file => 
        file.labels?.tags?.some((tag: string) => 
          tag.toLowerCase().includes(tags.toLowerCase())
        )
      );
    }

    if (fileType) {
      filteredFiles = filteredFiles.filter(file => 
        file.mime_type?.includes(fileType)
      );
    }

    // Calculate relevance scores
    const resultsWithScores = filteredFiles.map(file => {
      let score = 0;
      const fileContent = [
        file.file_name,
        file.original_name,
        file.content || '',
        JSON.stringify(file.labels || {}),
      ].join(' ');

      // Text similarity score
      score += calculateTextSimilarity(query, fileContent) * 0.6;

      // Exact matches boost
      if (file.file_name.toLowerCase().includes(query.toLowerCase())) {
        score += 0.3;
      }
      if (file.original_name.toLowerCase().includes(query.toLowerCase())) {
        score += 0.2;
      }

      // Recent files boost
      const daysSinceUpload = file.upload_date ? 
        (Date.now() - new Date(file.upload_date).getTime()) / (1000 * 60 * 60 * 24) : 0;
      const recencyBoost = Math.max(0, 1 - daysSinceUpload / 30) * 0.1;
      score += recencyBoost;

      return {
        ...file,
        score,
        fileUrl: LocalFileStorage.getFileUrl(file.file_name)
      };
    });

    // Sort by relevance score
    resultsWithScores.sort((a, b) => b.score - a.score);

    // Format results
    const results = resultsWithScores.map(file => ({
      id: file.id,
      fileName: file.file_name,
      originalName: file.original_name,
      fileSize: file.file_size,
      mimeType: file.mime_type,
      fileUrl: file.fileUrl,
      uploadDate: file.upload_date,
      labels: file.labels,
      metadata: file.metadata,
      score: file.score,
      preview: file.content?.substring(0, 200) + (file.content?.length > 200 ? '...' : '') || ''
    }));

    return NextResponse.json({
      results: results.slice(0, 50), // Limit to 50 results
      query,
      totalResults: results.length,
      searchMetrics: {
        avgScore: results.length ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0,
        maxScore: results.length ? Math.max(...results.map(r => r.score)) : 0,
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
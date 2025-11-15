import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import File from "@/app/models/File";
import User from "@/app/models/User";
import LocalFileStorage from "@/lib/fileStorage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Types for suggestions
interface SuggestionFile {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  labels: {
    subject?: string;
    topic?: string;
    class?: string;
    semester?: string;
    tags?: string[];
  };
  metadata: any;
  fileSize: number;
  mimeType: string;
  preview: string;
  suggestionScore: number;
  reason: string;
}

export async function GET(req: NextRequest) {
  try {
    let user = null;
    let userProfile = null;

    // Check if user is authenticated
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        user = await User.findById(decoded.userId);
        if (user) {
          userProfile = {
            id: user.id,
            username: user.username,
            email: user.email,
            userType: user.userType,
            profile: user.profile,
          };
        }
      } catch (error) {
        console.log("Invalid token, proceeding without user context");
      }
    }

    // Get all files and create suggestions
    const allFiles = await File.findAll();
    
    // Simple suggestion algorithm
    const suggestions: SuggestionFile[] = allFiles
      .slice(0, 10) // Limit to 10 suggestions
      .map(file => ({
        id: file.id,
        fileName: file.file_name,
        originalName: file.original_name,
        fileUrl: LocalFileStorage.getFileUrl(file.file_name),
        labels: file.labels || {},
        metadata: file.metadata || {},
        fileSize: file.file_size || 0,
        mimeType: file.mime_type || '',
        preview: (file.content?.substring(0, 200) || '') + ((file.content?.length || 0) > 200 ? '...' : ''),
        suggestionScore: Math.random() * 0.8 + 0.2, // Random score between 0.2 and 1.0
        reason: user ? "Based on your interests" : "Popular file"
      }))
      .sort((a, b) => b.suggestionScore - a.suggestionScore);

    return NextResponse.json({
      suggestions,
      userProfile,
      message: user ? "Personalized suggestions" : "Popular suggestions"
    });

  } catch (error: any) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 });
  }
}
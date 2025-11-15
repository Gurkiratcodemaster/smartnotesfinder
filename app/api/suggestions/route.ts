import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import File from "@/models/File";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Types for suggestions
interface SuggestionFile {
  id: string;
  fileName: string;
  cloudflareUrl: string;
  labels: {
    subject?: string;
    topic?: string;
    class?: string;
    semester?: string;
    tags?: string[];
  };
  metadata: any;
  uploaderType: string;
  uploader: any;
  ratings: {
    averageRating?: number;
    totalRatings?: number;
  };
  viewsCount: number;
  preview: string;
  suggestionScore: number;
  reason: string;
}

interface UserInterests {
  subjects: string[];
  topics: string[];
  class: string | null;
  semester: string | null;
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

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    let user = null;
    let userProfile = null;

    // Check if user is authenticated
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        user = await User.findById(decoded.userId).select("-password");
        if (user) {
          userProfile = {
            id: user._id,
            name: user.name,
            userType: user.userType,
            profile: user.profile,
          };
        }
      } catch (error) {
        console.log("Invalid token, proceeding without user context");
      }
    }

    let suggestions = [];

    if (user) {
      // Personalized suggestions for logged-in users
      suggestions = await getPersonalizedSuggestions(user);
    } else {
      // General popular suggestions for guests
      suggestions = await getPopularSuggestions();
    }

    return NextResponse.json({
      suggestions,
      userProfile,
      message: user ? "Personalized suggestions" : "Popular suggestions"
    });

  } catch (error: any) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ error: "Failed to load suggestions" }, { status: 500 });
  }
}

async function getPersonalizedSuggestions(user: any): Promise<SuggestionFile[]> {
  const suggestions: SuggestionFile[] = [];

  try {
    // Get files uploaded by user to understand their interests
    const userFiles = await File.find({ uploaderId: user._id })
      .select("labels embeddings ocrText")
      .lean();

    // Build interest profile based on user's uploads and profile
    const interests: UserInterests = {
      subjects: [],
      topics: [],
      class: user.profile?.class || null,
      semester: user.profile?.semester || null,
    };

    if (user.profile?.subject) interests.subjects.push(user.profile.subject);
    
    userFiles.forEach(file => {
      if (file.labels?.subject) interests.subjects.push(file.labels.subject);
      if (file.labels?.topic) interests.topics.push(file.labels.topic);
    });

    // Get files that match user interests
    const matchCriteria: any = {
      isPublic: true,
      uploaderId: { $ne: user._id }, // Exclude user's own files
    };

    // Add interest-based filters
    if (interests.subjects.length > 0) {
      matchCriteria.$or = [
        { 'labels.subject': { $in: interests.subjects } },
        { 'labels.topic': { $in: interests.topics } },
      ];
    }

    if (interests.class) {
      matchCriteria['labels.class'] = new RegExp(interests.class, 'i');
    }

    const candidateFiles = await File.find(matchCriteria)
      .populate('uploaderId', 'name userType')
      .sort({ 'ratings.averageRating': -1, viewsCount: -1 })
      .limit(20)
      .lean();

    // Score and rank suggestions
    candidateFiles.forEach((file: any) => {
      let score = 0;
      let reasons = [];

      // Subject/topic match score
      if (interests.subjects.includes(file.labels?.subject)) {
        score += 0.4;
        reasons.push(`matches your interest in ${file.labels.subject}`);
      }

      if (interests.topics.includes(file.labels?.topic)) {
        score += 0.3;
        reasons.push(`related to ${file.labels.topic}`);
      }

      // Class/semester match
      if (interests.class && file.labels?.class?.toLowerCase().includes(interests.class.toLowerCase())) {
        score += 0.2;
        reasons.push(`suitable for ${interests.class}`);
      }

      // Rating boost
      const ratingBoost = (file.ratings?.averageRating || 0) / 5 * 0.1;
      score += ratingBoost;
      if (file.ratings?.averageRating >= 4) {
        reasons.push(`highly rated (${file.ratings.averageRating.toFixed(1)} stars)`);
      }

      // Popularity boost
      if (file.viewsCount > 100) {
        score += 0.05;
        reasons.push("popular content");
      }

      if (score > 0.3) {
        suggestions.push({
          ...formatFileForSuggestion(file),
          suggestionScore: score,
          reason: reasons.length > 0 
            ? `Suggested because it ${reasons.join(", ")}`
            : "Recommended based on your profile"
        });
      }
    });

    // Sort by score and limit
    suggestions.sort((a, b) => b.suggestionScore - a.suggestionScore);
    return suggestions.slice(0, 10);

  } catch (error) {
    console.error("Error getting personalized suggestions:", error);
    return [];
  }
}

async function getPopularSuggestions(): Promise<SuggestionFile[]> {
  try {
    const popularFiles = await File.find({
      isPublic: true,
      'ratings.totalRatings': { $gte: 1 },
    })
    .populate('uploaderId', 'name userType')
    .sort({ 
      'ratings.averageRating': -1, 
      'ratings.totalRatings': -1,
      viewsCount: -1 
    })
    .limit(10)
    .lean();

    return popularFiles.map(file => ({
      ...formatFileForSuggestion(file),
      suggestionScore: (file.ratings?.averageRating || 0) / 5,
      reason: `Popular content with ${file.ratings?.averageRating.toFixed(1)} star rating and ${file.viewsCount} views`
    }));

  } catch (error) {
    console.error("Error getting popular suggestions:", error);
    return [];
  }
}

function formatFileForSuggestion(file: any): Omit<SuggestionFile, 'suggestionScore' | 'reason'> {
  return {
    id: file._id,
    fileName: file.originalName,
    cloudflareUrl: file.cloudflareUrl,
    labels: file.labels,
    metadata: file.metadata,
    uploaderType: file.uploaderType,
    uploader: file.uploaderId,
    ratings: file.ratings,
    viewsCount: file.viewsCount,
    preview: file.ocrText?.substring(0, 200) + (file.ocrText?.length > 200 ? '...' : ''),
  };
}
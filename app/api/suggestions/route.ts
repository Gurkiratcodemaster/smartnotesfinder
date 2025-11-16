import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Database from "@/lib/database";
import { User } from "@/app/models/User";
import { File } from "@/app/models/File";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(req: NextRequest) {
  try {
    let user = null;
    let userProfile = null;
    let isLoggedIn = false;

    // Check if user is authenticated
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        user = await User.findById(decoded.userId);
        if (user) {
          isLoggedIn = true;
          userProfile = {
            id: user.id,
            name: user.username,
            email: user.email,
            userType: user.user_type,
            profile: user.profile,
          };
        }
      } catch (error) {
        console.log("Invalid token, proceeding as guest user");
      }
    }

    // Get all public files from database
    let allFiles: any[] = [];
    try {
      const allFilesRaw = await (File as any).findAll();
      console.log(`Total files in database: ${allFilesRaw?.length || 0}`);
      
      // All files are returned - we'll treat all of them as available for suggestions
      allFiles = (allFilesRaw || []);
      
      console.log(`Files to process: ${allFiles.length}`);
    } catch (error) {
      console.error("Error fetching files:", error);
      // Return mock data for testing
      console.log("Error fetching database files, returning mock suggestions");
    }

    // Format files for processing
    const formattedFiles = allFiles.map((file: any) => ({
      id: file.id,
      fileName: file.original_name || file.original_filename || file.file_name || "Untitled",
      cloudflareUrl: `/file/${file.id}`, // Link to README page instead of direct file
      labels: {
        subject: file.labels?.subject || "General",
        topic: file.labels?.topic || "General",
        class: file.labels?.class,
        semester: file.labels?.semester,
        tags: file.labels?.tags || [],
      },
      metadata: {
        pageCount: file.metadata?.pageCount,
        extractedAt: file.created_at || new Date().toISOString(),
      },
      uploaderType: file.labels?.uploaderType || "student",
      uploader: {
        name: file.labels?.uploaderName || "Anonymous User",
        userType: file.labels?.uploaderType || "student",
      },
      ratings: {
        averageRating: file.labels?.averageRating || 0,
        totalRatings: file.labels?.totalRatings || 0,
      },
      viewsCount: file.labels?.viewsCount || 0,
      created_at: file.created_at,
      average_rating: file.labels?.averageRating || 0,
      view_count: file.labels?.viewsCount || 0,
    }));

    // If no database files, return empty
    let suggestedFiles: any[] = [];
    
    if (formattedFiles.length === 0) {
      console.log("No files in database");
      suggestedFiles = [];
    } else if (!isLoggedIn) {
      // GUEST USER: Show random recommendations
      console.log("Guest user - showing random recommendations");
      const randomFiles = shuffleArray(formattedFiles).slice(0, 20);
      
      suggestedFiles = randomFiles.map((file: any) => ({
        ...file,
        suggestionScore: Math.random() * 0.5 + 0.5,
        reason: "Popular in community",
        preview: "Sample preview text",
      }));
    } else {
      // LOGGED-IN USER: Show personalized recommendations
      console.log("Logged-in user - showing personalized recommendations");
      
      suggestedFiles = formattedFiles.map((file: any) => {
        let score = 0;
        let reasons: string[] = [];

        const fileDate = new Date(file.created_at);
        const daysOld = (Date.now() - fileDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld < 7) {
          score += 0.3;
          reasons.push("Recently uploaded");
        }

        if (file.average_rating) {
          score += (file.average_rating / 5) * 0.25;
        }

        if (file.view_count > 0) {
          const popularityScore = Math.min(file.view_count / 50, 1) * 0.2;
          score += popularityScore;
          if (file.view_count > 10) {
            reasons.push("Popular content");
          }
        }

        if (userProfile && userProfile.profile) {
          const userProf = userProfile.profile as any;
          
          if (userProf.subject && file.labels.subject?.toLowerCase() === userProf.subject.toLowerCase()) {
            score += 0.15;
            reasons.push("Matches your subject");
          }

          if (userProf.class && file.labels.class?.toLowerCase() === userProf.class.toLowerCase()) {
            score += 0.1;
            reasons.push("Matches your class");
          }

          if ((file.uploaderType === "teacher" || file.uploaderType === "college") && userProf.userType === "student") {
            score += 0.05;
            reasons.push("From verified educator");
          }
        }

        if (reasons.length === 0) {
          if (file.average_rating && file.average_rating >= 4) {
            reasons.push("Highly rated content");
          } else {
            reasons.push("Popular in community");
          }
        }

        return {
          ...file,
          suggestionScore: Math.min(Math.max(score, 0), 1),
          reason: reasons[0],
          preview: "Sample preview",
        };
      });

      suggestedFiles = suggestedFiles
        .sort((a: any, b: any) => b.suggestionScore - a.suggestionScore)
        .slice(0, 20);
    }

    console.log(`Returning ${suggestedFiles.length} suggestions`);

    return NextResponse.json({
      suggestions: suggestedFiles,
      userProfile: isLoggedIn ? userProfile : null,
      type: isLoggedIn ? "personalized" : "random",
    });

  } catch (error: any) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ 
      error: "Failed to get suggestions",
      suggestions: [],
    }, { status: 500 });
  }
}
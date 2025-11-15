import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import File from "@/app/models/File";
import Rating from "@/app/models/Rating";
import Database from "@/lib/database";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { fileId, rating, review } = await req.json();

    if (!fileId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid fileId and rating (1-5) required" }, { status: 400 });
    }

    // Check if file exists
    const file = await File.findById(fileId);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Create or update rating
    const savedRating = await Rating.create({
      file_id: fileId,
      user_id: decoded.userId,
      rating: rating,
      review: review || "",
    });

    // Get updated average rating
    const ratingStats = await Rating.getAverageRating(fileId);
    const allRatings = await Rating.findByFileId(fileId);
    
    const ratingsBreakdown = {
      1: allRatings.filter(r => r.rating === 1).length,
      2: allRatings.filter(r => r.rating === 2).length,
      3: allRatings.filter(r => r.rating === 3).length,
      4: allRatings.filter(r => r.rating === 4).length,
      5: allRatings.filter(r => r.rating === 5).length,
    };

    return NextResponse.json({
      message: "Rating saved successfully",
      rating: savedRating,
      fileRatings: {
        averageRating: ratingStats.average,
        totalRatings: ratingStats.count,
        ratingsBreakdown,
      }
    });

  } catch (error: any) {
    console.error("Rating API error:", error);
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "fileId parameter required" }, { status: 400 });
    }

    // Get all ratings for the file
    const ratings = await Rating.findByFileId(fileId);

    return NextResponse.json({
      ratings: ratings.map(rating => ({
        id: rating.id,
        rating: rating.rating,
        review: rating.review,
        userId: rating.user_id,
        createdAt: rating.created_at,
      }))
    });

  } catch (error: any) {
    console.error("Get ratings error:", error);
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}
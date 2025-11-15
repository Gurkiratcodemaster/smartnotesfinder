import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import File from "@/models/File";
import Rating from "@/models/Rating";

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

    await connectToDatabase();

    // Check if file exists
    const file = await File.findById(fileId);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if user already rated this file
    const existingRating = await Rating.findOne({
      fileId: fileId,
      userId: decoded.userId,
    });

    let savedRating;

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      if (review) existingRating.review = review;
      savedRating = await existingRating.save();
    } else {
      // Create new rating
      const newRating = new Rating({
        fileId: fileId,
        userId: decoded.userId,
        rating: rating,
        review: review || "",
      });
      savedRating = await newRating.save();
    }

    // Recalculate file ratings
    const allRatings = await Rating.find({ fileId: fileId });
    const totalRatings = allRatings.length;
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    
    const ratingsBreakdown = {
      1: allRatings.filter(r => r.rating === 1).length,
      2: allRatings.filter(r => r.rating === 2).length,
      3: allRatings.filter(r => r.rating === 3).length,
      4: allRatings.filter(r => r.rating === 4).length,
      5: allRatings.filter(r => r.rating === 5).length,
    };

    // Update file ratings
    await File.findByIdAndUpdate(fileId, {
      'ratings.averageRating': averageRating,
      'ratings.totalRatings': totalRatings,
      'ratings.ratingsBreakdown': ratingsBreakdown,
    });

    return NextResponse.json({
      message: existingRating ? "Rating updated successfully" : "Rating added successfully",
      rating: savedRating,
      fileRatings: {
        averageRating,
        totalRatings,
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

    await connectToDatabase();

    // Get all ratings for the file
    const ratings = await Rating.find({ fileId })
      .populate('userId', 'name userType')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      ratings: ratings.map(rating => ({
        id: rating._id,
        rating: rating.rating,
        review: rating.review,
        user: rating.userId,
        createdAt: rating.createdAt,
      }))
    });

  } catch (error: any) {
    console.error("Get ratings error:", error);
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}
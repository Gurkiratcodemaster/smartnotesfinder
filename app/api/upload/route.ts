// (This is your upload.ts route updated and renamed to Next.js app router pattern)
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import File from "@/models/File";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileSize, mimeType, labels } = body;

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    // Support both CF_R2_* and older R2_* env names
    const bucket = process.env.CF_R2_BUCKET || process.env.R2_BUCKET_NAME;
    const endpoint = process.env.CF_R2_ENDPOINT || process.env.R2_ENDPOINT;
    const accessKey = process.env.CF_R2_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID;
    const secret = process.env.CF_R2_SECRET || process.env.R2_SECRET_ACCESS_KEY;

    // Save metadata to database and return its ObjectId for later updates by OCR backend
    let fileId = null;

    try {
      await connectToDatabase();

      const newFile = new File({
        fileName,
        fileSize,
        mimeType,
        cloudflareUrl: bucket ? `${bucket}/${fileName}` : `development-mode/${fileName}`,
        labels: labels || {},
        uploadDate: new Date(),
        ocrText: "", // Will be filled by OCR processing
        embeddings: [], // Will be filled by embedding generation
      });

      const saved = await newFile.save();
      fileId = saved._id.toString();
    } catch (dbError) {
      console.error("Database save failed:", dbError);
      // continue — we'll still return development-mode and fileId may be null
    }

    // If Cloudflare R2 not configured, return development mode and the DB id (if available)
    if (!bucket || !endpoint || !accessKey || !secret) {
      console.log("Using development mode - no Cloudflare R2 configuration found");

      return NextResponse.json({
        uploadUrl: "development-mode",
        fileId: fileId || "",
        message: "Development mode: Files will be processed directly"
      });
    }

    // TODO: Implement presigned URL generation for Cloudflare R2 and return uploadUrl + fileId
    // For now, return development-mode even if credentials exist until presign is implemented
    return NextResponse.json({
      uploadUrl: "development-mode",
      fileId: fileId || "",
      message: "Development mode active"
    });

  } catch (err: any) {
    console.error("Error in upload URL handler:", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL", detail: err.message },
      { status: 500 }
    );
  }
}
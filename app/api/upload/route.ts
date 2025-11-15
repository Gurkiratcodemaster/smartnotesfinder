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

    // Check if Cloudflare R2 is configured
    const bucket = process.env.CF_R2_BUCKET;
    const endpoint = process.env.CF_R2_ENDPOINT;
    const accessKey = process.env.CF_R2_ACCESS_KEY;
    const secret = process.env.CF_R2_SECRET;

    const fileId = Math.random().toString(36).substring(7);

    // For now, use development mode (direct file processing)
    if (!bucket || !endpoint || !accessKey || !secret) {
      console.log("Using development mode - no Cloudflare R2 configuration found");
      
      // Try to save metadata to database anyway
      try {
        await connectToDatabase();
        
        const newFile = new File({
          fileName,
          fileSize,
          mimeType,
          cloudflareUrl: `development-mode/${fileId}/${fileName}`,
          labels: labels || {},
          uploadDate: new Date(),
          ocrText: "", // Will be filled by OCR processing
          embeddings: [], // Will be filled by embedding generation
        });

        await newFile.save();
        console.log("File metadata saved to database");
      } catch (dbError) {
        console.log("Database save failed:", dbError);
      }

      return NextResponse.json({ 
        uploadUrl: "development-mode",
        fileId,
        message: "Development mode: Files will be processed directly" 
      });
    }

    // TODO: Implement Cloudflare R2 presigned URL generation here
    // For now, return development mode even if credentials exist
    return NextResponse.json({ 
      uploadUrl: "development-mode",
      fileId,
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
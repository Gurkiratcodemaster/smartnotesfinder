import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import connectToDatabase from "@/lib/mongodb";
import File from "@/models/File";
import { v4 as uuidv4 } from 'uuid';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileSize, mimeType, labels } = body ?? {};

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    if (!labels || !labels.subject || !labels.topic) {
      return NextResponse.json({ error: "Subject and topic are required" }, { status: 400 });
    }

    // Environment variables check
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      console.error("Missing R2 configuration:", {
        accountIdExists: !!accountId,
        accessKeyExists: !!accessKeyId,
        secretKeyExists: !!secretAccessKey,
        bucketExists: !!bucket,
      });
      return NextResponse.json({ error: "R2 configuration is incomplete" }, { status: 500 });
    }

    // Generate unique file name for Cloudflare R2
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const cloudflareUrl = `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${uniqueFileName}`;

    // Connect to MongoDB and create file record
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn('MongoDB not available, proceeding without database storage:', dbError.message);
      // Return a simple upload URL without database storage
      return NextResponse.json({ 
        uploadUrl: `https://httpbin.org/post`, // Mock endpoint for testing
        fileId: "temp_" + uuidv4(),
        message: "Upload URL generated (database not available)",
        warning: "File metadata will not be stored - MongoDB not connected"
      });
    }
    
    const fileRecord = new File({
      fileName: uniqueFileName,
      originalName: fileName,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/pdf',
      cloudflareUrl,
      // uploaderId will be set when user logs in
      uploaderType: "student", // TODO: Get from user session
      labels: {
        class: labels.class,
        subject: labels.subject,
        topic: labels.topic,
        section: labels.section,
        semester: labels.semester,
        tags: labels.tags || [],
      },
      metadata: {
        extractedAt: new Date(),
      },
      ocrText: "", // Will be filled by OCR endpoint
      embeddings: [], // Will be filled by OCR endpoint
      isPublic: labels.isPublic !== false,
    });

    const savedFile = await fileRecord.save();

    // Create S3 client for Cloudflare R2
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: uniqueFileName,
      ContentType: mimeType || "application/pdf",
    });

    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({ 
      uploadUrl: signedUrl,
      fileId: savedFile._id.toString(),
      message: "Upload URL generated successfully"
    });
  } catch (err) {
    console.error("Error in upload URL handler:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
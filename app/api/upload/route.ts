import { NextRequest, NextResponse } from "next/server";
import File from "@/app/models/File";
import LocalFileStorage from "@/lib/fileStorage";
import jwt from "jsonwebtoken";

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const labels = formData.get('labels') as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!LocalFileStorage.isValidFileType(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Generate unique filename
    const fileName = LocalFileStorage.generateFileName(file.name, file.type);
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Save file to local storage
    const filePath = await LocalFileStorage.saveFile(fileBuffer, fileName, file.name);

    // Parse labels if provided
    let parsedLabels = {};
    try {
      if (labels) {
        parsedLabels = JSON.parse(labels);
      }
    } catch (error) {
      console.error('Failed to parse labels:', error);
    }

    // Save file metadata to database
    const fileRecord = await File.create({
      file_name: fileName,
      original_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      file_path: filePath,
      content: '', // Will be populated by text extraction if needed
      labels: parsedLabels,
      metadata: {
        uploadedBy: decoded.userId,
        uploadDate: new Date().toISOString()
      }
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      fileId: fileRecord.id,
      fileName: fileName,
      fileUrl: LocalFileStorage.getFileUrl(fileName),
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", detail: error.message },
      { status: 500 }
    );
  }
}
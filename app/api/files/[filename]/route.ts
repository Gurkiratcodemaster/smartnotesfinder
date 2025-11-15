import { NextRequest, NextResponse } from "next/server";
import LocalFileStorage from "@/lib/fileStorage";
import jwt from "jsonwebtoken";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
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

    const filename = params.filename;
    if (!filename) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 });
    }

    // Check if file exists
    const exists = await LocalFileStorage.fileExists(filename);
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file buffer
    const fileBuffer = await LocalFileStorage.getFile(filename);
    
    // Get file extension to set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    contentType = mimeTypes[ext] || contentType;

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error: any) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Failed to serve file", detail: error.message },
      { status: 500 }
    );
  }
}
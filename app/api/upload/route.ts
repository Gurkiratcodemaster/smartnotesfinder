import { NextRequest, NextResponse } from "next/server";
import FileModel from "@/app/models/File";
import LocalFileStorage from "@/lib/fileStorage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    console.log("Upload request received");

    // Optional JWT Authentication
    const authHeader = req.headers.get("authorization");
    let userId = "anonymous";

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded?.userId ?? "anonymous";
      } catch {
        console.warn("Invalid JWT – using anonymous");
      }
    }

    // Read Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const labelsString = formData.get("labels") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const fileName = LocalFileStorage.generateFileName(file.name, file.type);
    const filePath = await LocalFileStorage.saveFile(
      fileBuffer,
      fileName,
      file.name
    );

    let labels = {};
    try {
      labels = labelsString ? JSON.parse(labelsString) : {};
    } catch {
      labels = {};
    }

    // -----------------------------------
    // 🔥 TEXT EXTRACTION (Local)
    // -----------------------------------
    let extractedText = "";

    if (file.type === "application/pdf") {
      console.log("Extracting PDF text...");
      try {
        // Using require for Node.js compatibility
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text || "";
      } catch (error) {
        console.error("PDF extraction error:", error);
        extractedText = ""; // Fallback to empty string
      }
    }
    else if (file.type === "text/plain") {
      extractedText = fileBuffer.toString("utf8");
    }
    // Note: Image OCR was removed as cloud dependencies were removed
    // Can be added back with local libraries if needed

    // Save entry in MongoDB
    const fileRecord = await FileModel.create({
      file_name: fileName,
      original_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      file_path: filePath,
      labels,
      content: extractedText,
      metadata: {
        uploadedBy: userId,
        uploadDate: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      message: "File uploaded & text extracted successfully!",
      fileId: fileRecord.id,
      fileName,
      extractedText,
      originalName: file.name,
      size: file.size,
      type: file.type,
      fileUrl: LocalFileStorage.getFileUrl(fileName),
    });
  } catch (err: any) {
    console.error("ERROR IN UPLOAD:", err);
    return NextResponse.json(
      { error: "Upload failed", detail: err.message },
      { status: 500 }
    );
  }
}

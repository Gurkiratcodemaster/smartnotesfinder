import { NextRequest, NextResponse } from "next/server";
import FileModel from "@/app/models/File";
import LocalFileStorage from "@/lib/fileStorage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    console.log("Upload request received");

    // Optional Auth
    const authHeader = req.headers.get("authorization");
    let userId = "anonymous";

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded?.userId ?? "anonymous";
      } catch {
        console.warn("Invalid JWT token, using anonymous");
      }
    }

    // Read form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const labelsString = formData.get("labels") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Save file locally
    const fileName = LocalFileStorage.generateFileName(file.name, file.type);
    const filePath = await LocalFileStorage.saveFile(
      fileBuffer,
      fileName,
      file.name
    );

    // Parse labels JSON
    let labels = {};
    try {
      labels = labelsString ? JSON.parse(labelsString) : {};
    } catch {
      labels = {};
    }

    // -----------------------------
    // 🔥 OCR SPACE (PDF + IMAGE)
    // -----------------------------
    // -----------------------------
// 🔥 PYTHON OCR SERVER CALL
// -----------------------------

console.log("Sending file to Python OCR server...");

const pythonForm = new FormData();
pythonForm.append("file", new Blob([arrayBuffer], { type: file.type }));

const pythonRes = await fetch("http://127.0.0.1:8000/extract", {
  method: "POST",
  body: pythonForm,
});

if (!pythonRes.ok)
  throw new Error("Python OCR server failed");

const pythonData = await pythonRes.json();

const extractedText = pythonData?.text || "No text extracted.";


    // Save to DB
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
      message: "Uploaded & OCR completed!",
      fileId: fileRecord.id,
      extractedText,
      fileUrl: LocalFileStorage.getFileUrl(fileName),
    });

  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed", detail: err.message },
      { status: 500 }
    );
  }
}

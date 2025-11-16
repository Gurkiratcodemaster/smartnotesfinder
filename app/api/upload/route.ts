import { NextRequest, NextResponse } from "next/server";
import FileModel from "@/app/models/File";
import LocalFileStorage from "@/lib/fileStorage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Function to generate README content for uploaded files
function generateReadme(fileRecord: any, labels: any, userId: string | null): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `# ${fileRecord.original_name}

## Document Information

| Property | Value |
|----------|-------|
| **File Name** | ${fileRecord.original_name} |
| **File ID** | ${fileRecord.id} |
| **Upload Date** | ${timestamp} |
| **File Size** | ${(fileRecord.file_size / 1024).toFixed(2)} KB |
| **Uploaded By** | ${userId ? 'Registered User' : 'Anonymous'} |

## Metadata

### Subject
${labels?.subject || 'Not specified'}

### Topic
${labels?.topic || 'Not specified'}

### Class Level
${labels?.class || 'Not specified'}

### Semester
${labels?.semester || 'Not specified'}

### Tags
${labels?.tags && Array.isArray(labels.tags) ? labels.tags.join(', ') : 'No tags'}

## Description

This is an educational resource document. You can use this README file to share information about the document with others.

## Sharing

You can share this document using the following link:
\`\`\`
${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/file/${fileRecord.id}/readme
\`\`\`

## Access Information

- This is a **public README file** that can be shared with anyone
- The link allows users to view document metadata and information
- Only authorized users can download or access the full document

---

*This README was automatically generated on ${timestamp}*
`;
}

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

    // -----------------------------
    // 🔥 OCR SPACE EXTRACTION
    // -----------------------------
    console.log("Sending file to OCR.Space...");

    const ocrForm = new FormData();
    ocrForm.append("file", new Blob([fileBuffer], { type: file.type }));
    ocrForm.append("OCREngine", "2");

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrForm,
      headers: {
        apikey: "helloworld",
      },
    });

    const ocrResult = await ocrResponse.json();
    let extractedText = "";

    if (ocrResult?.ParsedResults?.[0]?.ParsedText) {
      extractedText = ocrResult.ParsedResults[0].ParsedText;
    }

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

    // Generate README file for this upload
    const readmeContent = generateReadme(fileRecord, labels, userId);
    const readmeFileName = `${fileName}.README.md`;
    const readmeBuffer = Buffer.from(readmeContent, 'utf-8');
    const readmePath = await LocalFileStorage.saveFile(readmeBuffer, readmeFileName, readmeFileName);

    // Update file record with README path
    await FileModel.updateById(fileRecord.id, {
      metadata: {
        ...fileRecord.metadata,
        readmePath,
      }
    });

    // Generate shareable link
    const shareLink = `/file/${fileRecord.id}/readme`;

    return NextResponse.json({
      message: "Upload & OCR completed.",
      fileId: fileRecord.id,
      shareLink: shareLink,
      readmeUrl: shareLink,
      fileName: fileName,
      fileUrl: LocalFileStorage.getFileUrl(fileName),
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (err: any) {
    console.error("ERROR IN UPLOAD:", err);
    return NextResponse.json(
      { error: "Upload failed", detail: err.message },
      { status: 500 }
    );
  }
}

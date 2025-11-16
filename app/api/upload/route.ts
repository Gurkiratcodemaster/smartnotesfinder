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
    // Log request details for debugging
    console.log('Upload request received');
    console.log('Content-Type:', req.headers.get('content-type'));
    console.log('Method:', req.method);
    
    // Check authentication (optional for uploads)
    const authHeader = req.headers.get("authorization");
    let decoded = null;
    let userId = null;
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (error) {
        // Token is invalid, but we'll allow anonymous upload
        console.log("Invalid token provided, proceeding with anonymous upload");
      }
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
    const fileRecord = await FileModel.create({
      file_name: fileName,
      original_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      file_path: filePath,
      content: '', // Will be populated by text extraction if needed
      labels: parsedLabels,
      metadata: {
        uploadedBy: userId || 'anonymous',
        uploadDate: new Date().toISOString(),
        isAnonymous: !userId
      }
    });

    // Generate README file for this upload
    const readmeContent = generateReadme(fileRecord, parsedLabels, userId);
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
      message: "File uploaded successfully",
      fileId: fileRecord.id,
      shareLink: shareLink,
      readmeUrl: shareLink,
      fileName: fileName,
      fileUrl: LocalFileStorage.getFileUrl(fileName),
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: userId || 'anonymous',
      isAuthenticated: !!userId
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", detail: error.message },
      { status: 500 }
    );
  }
}
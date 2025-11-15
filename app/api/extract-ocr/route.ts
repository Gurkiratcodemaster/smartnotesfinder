import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileId = formData.get("fileId") as string | null;
    const labelsStr = formData.get("labels") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded under field 'file'." }, { status: 400 });
    }

    // Create new FormData to send to Python backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    
    if (fileId) {
      backendFormData.append("file_id", fileId);
    }
    
    if (labelsStr) {
      backendFormData.append("labels", labelsStr);
    }

    // Call Python backend for OCR processing
    const backendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
    
    try {
      const response = await fetch(`${backendUrl}/extract-ocr`, {
        method: "POST",
        body: backendFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Python backend processing failed");
      }

      const result = await response.json();
      
      return NextResponse.json({
        success: true,
        extractedText: result.extracted_text,
        embeddings: result.embeddings,
        metadata: result.metadata,
        fileId: result.file_id,
        message: "OCR processing completed successfully"
      });

    } catch (backendError: any) {
      console.error("Python backend error:", backendError);
      
      // Fallback error response
      return NextResponse.json({
        error: "OCR processing failed",
        detail: backendError.message,
        suggestion: "Make sure the Python backend is running on port 8000"
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error("Error in OCR endpoint:", err);
    return NextResponse.json({ 
      error: "Internal server error",
      detail: err.message 
    }, { status: 500 });
  }
}
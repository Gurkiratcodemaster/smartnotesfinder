// (Updated extract_ocr.ts - forwards file to Python backend and returns a consistent JSON to the frontend)
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get the form data from the incoming request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileId = (formData.get("fileId") as string | null) || (formData.get("file_id") as string | null);
    const labelsStr = formData.get("labels") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded under field 'file'." }, { status: 400 });
    }

    // Create new FormData to send to Python backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    // Python backend expects 'file_id' Form field (main.py)
    if (fileId) {
      backendFormData.append("file_id", fileId);
      // also add camelCase just in case
      backendFormData.append("fileId", fileId);
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

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errMsg = result?.detail || result?.message || JSON.stringify(result) || "Python backend processing failed";
        throw new Error(errMsg);
      }

      // Normalize response shape to: { success, text, embeddings, metadata, fileId }
      const normalized = {
        success: result.success ?? true,
        text: result.text ?? result?.extracted_text ?? "",
        embeddings: result.embeddings ?? result?.embeddings ?? [],
        metadata: result.metadata ?? result?.metadata ?? {},
        fileId: result.file_id ?? result.fileId ?? fileId ?? "",
      };

      return NextResponse.json({
        ...normalized,
        message: "OCR processing completed successfully",
      });

    } catch (backendError: any) {
      console.error("Python backend error:", backendError);

      // Fallback error response
      return NextResponse.json({
        error: "OCR processing failed",
        detail: backendError.message,
        suggestion: "Make sure the Python backend is running and reachable at the configured PYTHON_BACKEND_URL"
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
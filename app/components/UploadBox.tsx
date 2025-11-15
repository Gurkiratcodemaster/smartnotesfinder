"use client";

import { useState } from "react";
import UploadLabelsForm, { UploadLabels } from "./UploadLabelsForm";

export default function UploadBox() {
  const [message, setMessage] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLabelsForm, setShowLabelsForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const processFileUpload = async (file: File, labels: UploadLabels) => {
    try {
      setIsUploading(true);
      setShowLabelsForm(false);
      setMessage("Requesting upload URL...");
      setOcrText("");

      // 1. Ask backend for presigned upload URL (Cloudflare R2) or development-mode response
      const res = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          labels,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Upload URL request failed: ${res.status} ${text}`);
      }
      if (!text) {
        throw new Error("Upload endpoint returned an empty response");
      }

      let data: { uploadUrl?: string; fileId?: string; message?: string };
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Upload endpoint returned invalid JSON");
      }

      const uploadUrl = data.uploadUrl;
      const fileId = data.fileId;

      if (!fileId) {
        throw new Error("fileId missing in upload endpoint response");
      }

      // Prepare form data for OCR endpoint
      const formData = new FormData();
      formData.append("file", file);
      // Pass both keys; server code forwards file_id to python
      formData.append("fileId", fileId);
      formData.append("labels", JSON.stringify(labels || {}));

      // 2. If presigned URL is development-mode -> skip PUT and run OCR immediately
      if (!uploadUrl || uploadUrl === "development-mode") {
        setMessage("Development mode: processing file directly...");
        const ocrRes = await fetch("/api/extract-ocr", {
          method: "POST",
          body: formData,
        });

        const ocrData = await ocrRes.json();
        if (!ocrRes.ok) {
          const serverErr = ocrData?.error || ocrData?.detail || JSON.stringify(ocrData);
          setMessage("OCR failed: " + serverErr);
          setOcrText("");
          return;
        }

        setOcrText(ocrData.text || "No text found.");
        setMessage("File processed successfully! Ready for search.");
        return;
      }

      // 3. Otherwise upload file to presigned URL (Cloudflare R2)
      setMessage("Uploading to Cloudflare R2...");
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text();
        throw new Error("Failed to upload to Cloudflare R2: " + text);
      }

      setMessage("File uploaded successfully! Processing file and extracting text...");

      // 4. Tell local Next backend to run OCR and save metadata
      const ocrRes = await fetch("/api/extract-ocr", {
        method: "POST",
        body: formData,
      });

      const ocrData = await ocrRes.json();
      if (!ocrRes.ok) {
        const serverErr = ocrData?.error || ocrData?.detail || JSON.stringify(ocrData);
        setMessage("OCR failed: " + serverErr);
        setOcrText("");
        return;
      }

      setOcrText(ocrData.text || "No text found.");
      setMessage("File processed successfully! Ready for search.");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err?.message ?? String(err)));
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setMessage("File too large. Maximum size is 10MB.");
      return;
    }
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setMessage("Only PDF files are supported.");
      return;
    }
    setSelectedFile(file);
    setShowLabelsForm(true);
    setMessage("");
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleLabelsSubmit = (labels: UploadLabels) => {
    if (selectedFile) {
      processFileUpload(selectedFile, labels);
    }
  };

  const handleLabelsCancel = () => {
    setShowLabelsForm(false);
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* File Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-primary bg-primary/10 scale-105' 
            : 'border-gray-300 hover:border-primary hover:bg-primary/10'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && document.getElementById('fileInput')?.click()}
      >
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isUploading ? "Processing..." : "Drop your PDF here"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Or click to browse files (Max 10MB)
            </p>
          </div>
          
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            onChange={handleSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Progress Message */}
      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          message.includes('successfully') ? 'bg-green-50 border border-green-200 text-green-800' :
          message.includes('failed') || message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {/* Loading Spinner */}
      {isUploading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* OCR Results */}
      {ocrText && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-gray-800 mb-2">Extracted Text:</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {ocrText}
          </div>
        </div>
      )}

      {/* Labels Form Modal */}
      {showLabelsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <UploadLabelsForm
              onSubmit={handleLabelsSubmit}
              onCancel={handleLabelsCancel}
              fileName={selectedFile?.name || ""}
              fileSize={selectedFile?.size ?? 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
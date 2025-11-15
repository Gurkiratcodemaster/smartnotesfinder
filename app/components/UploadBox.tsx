







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

      // 1. Ask backend for presigned upload URL (Cloudflare R2)
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

      // Handle response safely
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Upload URL request failed: ${res.status} ${text}`);
      }
      if (!text) {
        throw new Error("Upload endpoint returned an empty response");
      }

      let data: { uploadUrl?: string; fileId?: string };
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Upload endpoint returned invalid JSON");
      }

      const uploadUrl = data.uploadUrl;
      if (!uploadUrl) {
        throw new Error("uploadUrl missing in upload endpoint response");
      }

      // 2. Upload file to Cloudflare R2
      setMessage("Uploading to Cloudflare R2...");
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT", 
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text();
        throw new Error("Failed to upload to Cloudflare R2: " + text);
      }

      setMessage("File uploaded successfully!");

      // 3. Run OCR and save metadata
      setMessage("Processing file and extracting text...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileId", data.fileId || "");
      formData.append("labels", JSON.stringify(labels));

      const ocrRes = await fetch("/api/extract-ocr", {
        method: "POST",
        body: formData,
      });

      // Check for errors and show them to the user
      const ocrData = await ocrRes.json();
      if (!ocrRes.ok) {
        const serverErr = ocrData?.error || JSON.stringify(ocrData);
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
    
    if (!file.type.includes('pdf')) {
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
    <>
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Upload Your Educational Content
            </h2>
            <p className="text-lg text-text-light">
              Share your study materials, research papers, or educational resources with the community
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div
              className={`relative border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-primary-green bg-primary-green/5 scale-105"
                  : "border-gray-300 hover:border-primary-green hover:bg-primary-green/5"
              } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <label
                htmlFor="fileInput"
                className="cursor-pointer block"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="loading-spinner"></div>
                    <span className="text-primary-green font-medium">Processing your file...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl text-primary-green animate-bounce-gentle">📁</div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-dark mb-2">
                        Drop your files here or click to browse
                      </h3>
                      <p className="text-text-light">
                        Support for PDF files • Max file size: 10MB
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <span className="px-6 py-3 bg-primary-green text-white rounded-full font-medium hover:bg-primary-green-dark transform hover:-translate-y-1 transition-all duration-300">
                        Choose File
                      </span>
                    </div>
                  </div>
                )}
              </label>

              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleSelect}
                accept=".pdf"
                disabled={isUploading}
              />
            </div>

            {/* Status Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg animate-fade-in ${
                message.includes('Error') || message.includes('failed') 
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : message.includes('successfully') 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}>
                <p className="font-medium text-center">{message}</p>
              </div>
            )}

            {/* OCR Results */}
            {ocrText && (
              <div className="mt-8 animate-slide-up">
                <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  Extracted Text Content
                </h3>
                <div className="max-h-96 p-6 border rounded-xl bg-gray-50 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-text-dark leading-relaxed">{ocrText}</p>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-text-light text-sm">
                    ✅ File is now searchable and available in the platform
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Labels Form Modal */}
      {showLabelsForm && selectedFile && (
        <UploadLabelsForm
          onSubmit={handleLabelsSubmit}
          onCancel={handleLabelsCancel}
          fileName={selectedFile.name}
          fileSize={selectedFile.size}
        />
      )}
    </>
  );
}
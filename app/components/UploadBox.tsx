







"use client";

import React, { useState } from "react";
import FileLabelsForm from "./FileLabelsForm";


export interface UploadLabels {
  class?: string;
  subject?: string;
  topic?: string;
  section?: string;
  semester?: string;
  tags?: string[];
}

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

      // 1. Get upload URL from backend
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

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload URL request failed: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      const { uploadUrl, fileId } = data;

      if (!uploadUrl) {
        throw new Error("No upload URL received from server");
      }

      // 2. Handle different upload modes
      if (uploadUrl === "development-mode") {
        // Development mode: Skip file upload, go directly to OCR
        setMessage("Development mode: Processing file directly...");
        await processFileWithOCR(file, fileId, labels);
      } else {
        // Production mode: Upload to Cloudflare R2
        setMessage("Uploading to Cloudflare R2...");
        
        try {
          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT", 
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("Cloudflare R2 upload error:", errorText);
            
            // Fallback: Try direct OCR processing instead
            setMessage("Upload failed, processing file directly...");
            await processFileWithOCR(file, fileId, labels);
            return;
          }

          setMessage("File uploaded successfully! Starting OCR processing...");
          
          // 3. Process uploaded file with OCR
          await processFileWithOCR(file, fileId, labels);
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          
          // Fallback: Process file directly
          setMessage("Upload failed, processing file directly...");
          await processFileWithOCR(file, fileId, labels);
        }
      }

    } catch (err: any) {
      console.error("Upload process error:", err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const processFileWithOCR = async (file: File, fileId: string, labels: UploadLabels) => {
    try {
      setMessage("Processing with OCR...");

      // Send file to OCR processing endpoint
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileId", fileId);
      formData.append("labels", JSON.stringify(labels));

      const ocrResponse = await fetch("/api/extract-ocr", {
        method: "POST",
        body: formData,
      });

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        throw new Error(`OCR processing failed: ${ocrResponse.status} ${errorText}`);
      }

      const ocrResult = await ocrResponse.json();
      
      if (ocrResult.text) {
        setOcrText(ocrResult.text);
        setMessage("✅ File processed successfully! OCR text extracted.");
      } else {
        setMessage("⚠️ File processed but no text was extracted.");
      }

    } catch (ocrError: any) {
      console.error("OCR processing error:", ocrError);
      setMessage(`OCR processing failed: ${ocrError.message}`);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setMessage("File size must be less than 10MB");
      return;
    }
    
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setMessage("Please select a PDF or image file");
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

      {/* Progress Message */}
      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' :
          message.includes('⚠️') ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
          message.includes('failed') || message.includes('error') ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {/* Loading Spinner */}
      {isUploading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
            <FileLabelsForm
              onSubmit={handleLabelsSubmit}
              onCancel={handleLabelsCancel}
              fileName={selectedFile?.name || ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
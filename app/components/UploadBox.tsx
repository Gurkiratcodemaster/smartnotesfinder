"use client";

import { useState } from "react";
import UploadLabelsForm, { UploadLabels } from "./UploadLabelsForm";
import TextDisplay from "./TextDisplay";

export default function UploadBox() {
  const [message, setMessage] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLabelsForm, setShowLabelsForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --------------------------------------
  // 🔥 MAIN UPLOAD HANDLER
  // --------------------------------------
  const processFileUpload = async (file: File, labels: UploadLabels) => {
    try {
      setIsUploading(true);
      setMessage("Uploading...");
      setOcrText("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("labels", JSON.stringify(labels || {}));

      const token = localStorage.getItem("userToken");
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // Send to backend
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers,
      });

      const result = await response.json();
<<<<<<< HEAD
=======

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }
>>>>>>> ee889f61250afbab32d99e72ff948e03fdf25355

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setMessage("✓ Successfully Uploaded!");
      setOcrText(result.extractedText || "No text extracted.");
<<<<<<< HEAD
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
=======
>>>>>>> ee889f61250afbab32d99e72ff948e03fdf25355

    } catch (err: any) {
      console.error(err);
      setMessage("✗ Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  // --------------------------------------
  // File Validation
  // --------------------------------------
  const handleFileSelection = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setMessage("File too large. Max 10MB.");
      return;
    }

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "text/plain",
    ];

    const isValid =
      allowed.includes(file.type) ||
      /\.(pdf|jpg|jpeg|png|txt)$/i.test(file.name);

    if (!isValid) {
      setMessage("Invalid file type");
      return;
    }

    setSelectedFile(file);
    setShowLabelsForm(true);
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

  return (
<<<<<<< HEAD
    <div className="w-full bg-white">
      {/* Main Container */}
      <div className="w-full px-6 py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-12 text-[#4A7766] hover:text-[#d4e6e1] transition-colors duration-300 cursor-pointer">
            Upload Your Notes Here
          </h2>
          
          {/* Upload Box */}
          <div
            className={`border-2 border-dashed p-12 rounded-lg text-center transition-all duration-300 ${
              isDragOver 
                ? "bg-[#d4e6e1] border-[#4A7766]" 
                : "border-gray-400 hover:bg-[#f0f7f5] hover:border-[#4A7766]"
            } cursor-pointer`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              id="fileInput"
              type="file"
              hidden
              onChange={handleSelect}
              accept=".pdf,.jpg,.jpeg,.png,.txt"
            />
=======
    <div className="w-full max-w-2xl mx-auto p-6">
      
      {/* Upload Box */}
      <div
        className={`border-2 border-dashed p-8 rounded-lg text-center ${
          isDragOver ? "bg-blue-100 border-blue-500" : "border-gray-400"
        } cursor-pointer`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input
          id="fileInput"
          type="file"
          hidden
          onChange={handleSelect}
          accept=".pdf,.jpg,.jpeg,.png,.txt"
        />
>>>>>>> ee889f61250afbab32d99e72ff948e03fdf25355

            <div className="text-5xl mb-4">📤</div>
            <p className="text-lg font-medium text-text-dark">Drop your file here</p>
            <p className="text-sm text-text-light">OR click to select</p>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg font-semibold transition-all duration-300 ${
              message.includes("Successfully") 
                ? "bg-[#d4e6e1] text-[#2d5a47] border-l-4 border-[#4A7766]" 
                : "bg-red-100 text-red-700 border-l-4 border-red-500"
            }`}>
              {message}
            </div>
          )}

          {isUploading && <div className="mt-3">Uploading...</div>}

          {/* Extracted Text Viewer */}
          {ocrText && <TextDisplay text={ocrText} />}
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* Status Message */}
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded border">
          {message}
        </div>
      )}

      {isUploading && <div className="mt-3">Uploading...</div>}

      {/* Extracted Text Viewer */}
      {ocrText && <TextDisplay text={ocrText} />}

>>>>>>> ee889f61250afbab32d99e72ff948e03fdf25355
      {/* Labels form modal */}
      {showLabelsForm && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <UploadLabelsForm
              fileName={selectedFile.name}
              fileSize={selectedFile.size}
              onSubmit={(labels) => {
                setShowLabelsForm(false);
                processFileUpload(selectedFile, labels);
              }}
              onCancel={() => {
                setShowLabelsForm(false);
                setSelectedFile(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

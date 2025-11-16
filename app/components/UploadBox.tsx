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

  // -------------------------------
  // Upload handler → Calls /api/upload
  // -------------------------------
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

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");

      setMessage("File uploaded & text extracted!");
      setOcrText(result.extractedText || "No text extracted.");
    } catch (err: any) {
      console.error(err);
      setMessage("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  // -------------------------------
  // File Validation
  // -------------------------------
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
      file.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png|txt)$/);

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
    <div className="w-full max-w-2xl mx-auto p-6">
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

        <p className="text-lg font-medium">Drop your file here</p>
        <p className="text-sm text-gray-500">OR click to select</p>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded border">{message}</div>
      )}

      {isUploading && <div className="mt-3">Uploading...</div>}

      {ocrText && <TextDisplay text={ocrText} />}

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

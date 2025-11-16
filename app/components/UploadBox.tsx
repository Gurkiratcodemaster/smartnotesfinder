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
      setMessage("Uploading file...");
      setOcrText("");

      // Prepare form data for direct file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("labels", JSON.stringify(labels || {}));

      // Get authentication token if available
      const token = localStorage.getItem('userToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      // Note: Don't set Content-Type - let browser set it automatically for FormData

      // Upload file directly to our upload endpoint
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResult.error || uploadResult.detail || 'Unknown error'}`);
      }

      setMessage(`File uploaded successfully! ${uploadResult.isAuthenticated ? 'Saved to your account.' : 'Uploaded anonymously.'}`);
      
      // For now, we'll skip OCR since it was removed from the system
      // If you want to add text extraction later, you can implement it here
      setOcrText("Text extraction feature not available in local mode.");

    } catch (error: any) {
      console.error("Upload error:", error);
      setMessage("Upload failed: " + (error.message || error.toString()));
      setOcrText("");
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
    
    // Accept more file types now that we're not limited to OCR
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const isValidType = allowedTypes.includes(file.type) || 
                       file.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png|txt|doc|docx)$/);
    
    if (!isValidType) {
      setMessage("Supported file types: PDF, Images (JPG, PNG), Text files, Word documents");
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
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isUploading ? "Uploading..." : "Drop your files here"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Or click to browse files (Max 10MB)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports: PDF, Images, Text files, Word documents
            </p>
          </div>
          
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
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
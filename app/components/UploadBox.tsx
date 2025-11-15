"use client";

import { useState } from "react";

export default function UploadBox() {
  const [message, setMessage] = useState("");
  const [ocrText, setOcrText] = useState("");

  const uploadFile = async (file: File) => {
    try {
      setMessage("Requesting upload URL...");
      setOcrText("");

      // 1. Ask backend for presigned upload URL (Cloudflare R2)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!data.uploadUrl) throw new Error("uploadUrl missing");
      const uploadUrl = data.uploadUrl;

      // 2. Upload file to Cloudflare R2
      setMessage("Uploading to Cloudflare R2...");
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text();
        throw new Error("Failed to upload to Cloudflare R2: " + text);
      }

      setMessage("File uploaded successfully!");

      // 3. Run Tesseract OCR backend
      setMessage("Running OCR...");
      const formData = new FormData();
      formData.append("file", file);

      const ocrRes = await fetch("/api/extract-ocr", {
        method: "POST",
        body: formData, // send as FormData
      });

      // Check for errors and show them to the user
      const ocrData = await ocrRes.json();
      if (!ocrRes.ok) {
        // Prefer explicit server error message if present
        const serverErr = ocrData?.error || JSON.stringify(ocrData);
        setMessage("OCR failed: " + serverErr);
        setOcrText("");
        return;
      }

      setOcrText(ocrData.text || "No text found.");
      setMessage("OCR Completed!");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err?.message ?? String(err)));
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <label
        htmlFor="fileInput"
        className="w-72 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center rounded cursor-pointer hover:bg-gray-100 transition"
      >
        <span className="text-gray-600">Click to upload a file</span>
      </label>

      <input
        id="fileInput"
        type="file"
        className="hidden"
        onChange={handleSelect}
      />

      {message && <p className="mt-4 text-blue-600 font-medium">{message}</p>}

      {ocrText && (
        <div className="mt-6 w-3/4 max-h-96 p-4 border rounded bg-gray-50 overflow-y-scroll">
          <h3 className="font-bold mb-2">Extracted Text:</h3>
          <p className="whitespace-pre-wrap text-gray-800">{ocrText}</p>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";

export default function UploadBox() {
  const [message, setMessage] = useState("");
  const [ocrText, setOcrText] = useState("");

  const uploadFile = async (file: File) => {
    try {
      setMessage("Uploading...");
      setOcrText("");

      // 1. Get R2 presigned upload URL
      const res = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      const uploadUrl = data.uploadUrl;

      if (!uploadUrl) throw new Error("uploadUrl missing");

      // 2. Upload file to R2
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

      setMessage("File uploaded successfully!");

      // 3. If PDF → send file to OCR API
      if (file.type === "application/pdf") {
        setMessage("Running OCR on PDF...");

        const ocrRes = await fetch("/api/extract-ocr", {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        const ocrData = await ocrRes.json();
        setOcrText(ocrData.text || "No text found");
        setMessage("OCR Completed!");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Upload failed: " + err.message);
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

      {message && (
        <p className="mt-4 text-green-600 font-medium">{message}</p>
      )}

      {ocrText && (
        <div className="mt-6 w-3/4 max-h-96 p-4 border rounded bg-gray-50 overflow-y-scroll">
          <h3 className="font-bold mb-2">Extracted Text:</h3>
          <p className="whitespace-pre-wrap text-gray-800">{ocrText}</p>
        </div>
      )}
    </div>
  );
}

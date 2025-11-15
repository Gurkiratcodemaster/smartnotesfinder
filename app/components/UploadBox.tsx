"use client";

import { useState } from "react";

export default function UploadBox() {
  const [message, setMessage] = useState("");

  const uploadFile = async (file: File) => {
    try {
      setMessage("Uploading...");

      // 1. ask backend for presigned upload URL
      const res = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name }),
        headers: { "Content-Type": "application/json" },
      });

      // handle non-OK or empty/non-JSON responses safely
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Upload URL request failed: ${res.status} ${text}`);
      }
      if (!text) {
        throw new Error("Upload endpoint returned an empty response");
      }

      let data: { uploadUrl?: string };
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Upload endpoint returned invalid JSON");
      }

      const uploadUrl = data.uploadUrl;
      if (!uploadUrl) {
        throw new Error("uploadUrl missing in upload endpoint response");
      }

      // 2. upload file to Cloudflare R2 using presigned URL
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

      setMessage("File uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage("Upload failed. " + (err?.message ?? "Try again."));
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
    </div>
  );
}

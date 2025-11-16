"use client";

import { useState } from "react";

interface TextDisplayProps {
  text: string;
  onClose?: () => void;
}

export default function TextDisplay({ text, onClose }: TextDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadText = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted_text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const highlightText = (t: string, s: string) => {
    if (!s) return t;
    const regex = new RegExp(`(${s})`, "gi");
    const parts = t.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-300 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col shadow-2xl">
          
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Extracted Text</h2>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border rounded"
              />
              <button onClick={handleCopyText} className="px-3 py-1 bg-blue-500 text-white rounded">Copy</button>
              <button onClick={handleDownloadText} className="px-3 py-1 bg-green-500 text-white rounded">Download</button>
              <button onClick={() => setIsExpanded(false)} className="px-3 py-1 bg-gray-500 text-white rounded">Close</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {highlightText(text, searchTerm)}
            </pre>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">Extracted Text</h3>
        <button
          onClick={() => setIsExpanded(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Expand
        </button>
      </div>

      <div className="bg-white rounded border p-4 max-h-64 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm font-mono">
          {text.length > 1000 ? text.slice(0, 1000) + "..." : text}
        </pre>
      </div>
    </div>
  );
}

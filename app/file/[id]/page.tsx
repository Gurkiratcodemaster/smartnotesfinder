"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";

export default function FileViewPage() {
  const params = useParams();
  const fileId = params.id as string;
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFileDetails();
  }, [fileId]);

  const loadFileDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/file/${fileId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      const data = await response.json();
      setFile(data);
    } catch (error) {
      console.error("Error loading file:", error);
      setFile({
        id: fileId,
        name: "Document",
        subject: "Not available",
        topic: "Not available",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-text-light">Loading file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* File Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-4">
            {file?.name || "Document"}
          </h1>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-4 py-2 bg-[#4A7766] text-white rounded-full text-sm font-medium">
              {file?.subject}
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              {file?.topic}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-text-light mb-4">
              File ID: <code className="bg-gray-100 px-2 py-1 rounded">{fileId}</code>
            </p>
            <a
              href={`/file/${fileId}/view-readme`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A7766] text-white rounded-lg hover:bg-[#3C6757] transition-colors font-medium"
            >
              <span>📖</span>
              <span>View Full README</span>
            </a>
          </div>
        </div>

        {/* README Content */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-text-dark mb-6">📄 README FILE</h2>
          
          <div className="space-y-8">
            {/* About Section */}
            <div className="bg-blue-50 border-l-4 border-[#4A7766] p-6 rounded">
              <h3 className="text-2xl font-bold text-text-dark mb-3">About This Document</h3>
              <p className="text-text-dark text-lg leading-relaxed">
                This README file is automatically generated when a document is uploaded to SmartNotesFinder. 
                It provides complete information about the educational resource, including all metadata and a shareable link.
              </p>
            </div>

            {/* Document Information Section */}
            <div>
              <h3 className="text-2xl font-bold text-text-dark mb-4">Document Information</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4 border-2 border-gray-200">
                <div className="flex justify-between items-start pb-4 border-b">
                  <span className="font-bold text-text-dark">📁 File ID:</span>
                  <code className="bg-white px-3 py-1 rounded text-[#4A7766] font-mono">{fileId}</code>
                </div>
                <div className="flex justify-between items-start pb-4 border-b">
                  <span className="font-bold text-text-dark">📚 Subject:</span>
                  <span className="text-text-dark">{file?.subject || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-start pb-4 border-b">
                  <span className="font-bold text-text-dark">🎯 Topic:</span>
                  <span className="text-text-dark">{file?.topic || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-text-dark">📅 Created:</span>
                  <span className="text-text-dark">{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div>
              <h3 className="text-2xl font-bold text-text-dark mb-4">Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#4A7766] font-bold mr-3">✓</span>
                  <span className="text-text-dark">Auto-generated README for every uploaded document</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4A7766] font-bold mr-3">✓</span>
                  <span className="text-text-dark">Complete document metadata and information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4A7766] font-bold mr-3">✓</span>
                  <span className="text-text-dark">Unique shareable link for easy distribution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4A7766] font-bold mr-3">✓</span>
                  <span className="text-text-dark">Share educational resources with anyone</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4A7766] font-bold mr-3">✓</span>
                  <span className="text-text-dark">Permanent link that never expires</span>
                </li>
              </ul>
            </div>

            {/* How to Share Section */}
            <div>
              <h3 className="text-2xl font-bold text-text-dark mb-4">How to Share This Document</h3>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="font-bold text-[#4A7766] mr-3">1.</span>
                  <span className="text-text-dark">Click the "Copy Link" button below</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-[#4A7766] mr-3">2.</span>
                  <span className="text-text-dark">Share the link via email, chat, or social media</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-[#4A7766] mr-3">3.</span>
                  <span className="text-text-dark">Anyone with the link can view this README</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-[#4A7766] mr-3">4.</span>
                  <span className="text-text-dark">Perfect for sharing educational resources</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-text-dark mb-4">🔗 Share This README</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border-2 border-[#4A7766]">
            <p className="text-sm text-text-light mb-3 font-semibold">Share this link:</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white border border-gray-300 p-3 rounded text-text-dark overflow-x-auto text-sm font-mono">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </code>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("✅ Link copied to clipboard!");
              }}
              className="px-6 py-3 bg-[#4A7766] text-white rounded-lg hover:bg-[#3C6757] transform hover:-translate-y-1 transition-all duration-300 font-semibold"
            >
              📋 Copy Link
            </button>
          </div>

          <p className="text-text-light text-sm mt-4 pt-4 border-t">
            💡 <strong>Tip:</strong> Share this link to let others view the document information without downloading the file.
          </p>
        </div>
      </div>
    </div>
  );
}

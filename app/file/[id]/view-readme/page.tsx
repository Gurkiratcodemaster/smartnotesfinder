"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";

export default function ReadmeViewerPage() {
  const params = useParams();
  const fileId = params.id as string;
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReadmeContent();
  }, [fileId]);

  const loadReadmeContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/file/${fileId}/readme`);
      if (!response.ok) {
        throw new Error(`Failed to fetch README: ${response.status}`);
      }
      const data = await response.json();
      setReadmeContent(data.content);
    } catch (err: any) {
      console.error("Error loading README:", err);
      setError(err.message || "Failed to load README file");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-text-light">Loading README...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading README</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Simple markdown to HTML conversion
  const formatMarkdown = (markdown: string) => {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-2xl font-bold text-text-dark mb-3 mt-5">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-3xl font-bold text-text-dark mb-4 mt-6 border-b-2 border-[#4A7766] pb-2">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-4xl font-bold text-text-dark mb-6 mt-8">$1</h1>');
    
    // Code blocks (match triple backticks)
    html = html.replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```/g, '');
      return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto mb-6"><code class="text-text-dark font-mono">${code}</code></pre>`;
    });
    
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-[#4A7766] font-mono">$1</code>');
    
    // Tables
    html = html.replace(/\|\s*Property\s*\|\s*Value\s*\|/g, '<table class="min-w-full border-collapse border border-gray-300 mb-6"><thead><tr><th class="bg-[#4A7766] text-white border border-gray-300 px-4 py-2 text-left font-bold">Property</th><th class="bg-[#4A7766] text-white border border-gray-300 px-4 py-2 text-left font-bold">Value</th></tr></thead><tbody>');
    html = html.replace(/\|---+\|---+\|/g, '');
    html = html.replace(/\|\s*\*\*(.*?)\*\*\s*\|\s*(.*?)\s*\|/g, '<tr><td class="border border-gray-300 px-4 py-2 font-bold text-text-dark">$1</td><td class="border border-gray-300 px-4 py-2 text-text-dark">$2</td></tr>');
    html = html.replace(/<\/tbody>/g, '</tbody></table>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Line breaks and paragraphs
    html = html.split('\n\n').map(para => {
      if (para.trim().startsWith('<')) return para;
      return `<p class="text-text-dark mb-4 leading-relaxed">${para.trim()}</p>`;
    }).join('');
    
    return html;
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(readmeContent) }}
          />
        </div>
      </div>
    </div>
  );
}

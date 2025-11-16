"use client";

import { useState } from "react";

interface UploadLabelsFormProps {
  onSubmit: (labels: UploadLabels) => void;
  onCancel: () => void;
  fileName: string;
  fileSize: number;
}

export interface UploadLabels {
  class?: string;
  subject: string;
  topic: string;
  section?: string;
  semester?: string;
  tags: string[];
  isPublic: boolean;
}

export default function UploadLabelsForm({ onSubmit, onCancel, fileName, fileSize }: UploadLabelsFormProps) {
  const [labels, setLabels] = useState<UploadLabels>({
    subject: "",
    topic: "",
    tags: [],
    isPublic: true,
  });
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !labels.tags.includes(tagInput.trim())) {
      setLabels(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setLabels(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (labels.subject && labels.topic) {
      onSubmit(labels);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-text-dark mb-6">Add File Information</h2>
        
        {/* File Info */}
        <div className="bg-primary-bg rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-primary-green mb-2">File Details</h3>
          <p className="text-text-dark"><strong>Name:</strong> {fileName}</p>
          <p className="text-text-light"><strong>Size:</strong> {(fileSize / 1024 / 1024).toFixed(2)} MB</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-dark font-medium mb-2">Class</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-300"
                value={labels.class || ""}
                onChange={(e) => setLabels(prev => ({ ...prev, class: e.target.value }))}
                placeholder="e.g., 12th Grade, Graduate"
              />
            </div>
            
            <div>
              <label className="block text-text-dark font-medium mb-2">Semester</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-300"
                value={labels.semester || ""}
                onChange={(e) => setLabels(prev => ({ ...prev, semester: e.target.value }))}
                placeholder="e.g., Fall 2024, Semester 1"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-dark font-medium mb-2">Subject *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-300"
              value={labels.subject}
              onChange={(e) => setLabels(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Mathematics, Physics, Computer Science"
            />
          </div>

          <div>
            <label className="block text-text-dark font-medium mb-2">Topic *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-300"
              value={labels.topic}
              onChange={(e) => setLabels(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g., Linear Algebra, Quantum Physics, Data Structures"
            />
          </div>

          <div>
            <label className="block text-text-dark font-medium mb-2">Section</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-300"
              value={labels.section || ""}
              onChange={(e) => setLabels(prev => ({ ...prev, section: e.target.value }))}
              placeholder="e.g., Chapter 5, Unit 3"
            />
          </div>

          <div>
            <label className="block text-text-dark font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-300"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                aria-label="Add tag"
                className="px-3 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green-dark transition-colors duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {labels.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary-green/10 text-primary-green rounded-full text-sm"
                >
                  <span className="mr-2">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="ml-1 text-primary-green hover:text-red-500 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={labels.isPublic}
              onChange={(e) => setLabels(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="w-4 h-4 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green"
            />
            <label htmlFor="isPublic" className="text-text-dark font-medium">
              Make this file public for everyone to search
            </label>
          </div>

          <div className="pt-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-white flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border-2 border-[#4A7766] text-[#4A7766] rounded-lg hover:bg-[#4A7766] hover:text-white transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!labels.subject || !labels.topic}
                className="flex-1 px-6 py-3 bg-[#4A7766] text-white rounded-lg hover:bg-[#3C6757] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Save & Upload
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
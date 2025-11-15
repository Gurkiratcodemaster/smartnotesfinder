"use client";

import React, { useState } from "react";
import { UploadLabels } from "./UploadBox";

interface FileLabelsFormProps {
  onSubmit: (labels: UploadLabels) => void;
  onCancel: () => void;
  fileName: string;
}

export default function FileLabelsForm({ onSubmit, onCancel, fileName }: FileLabelsFormProps) {
  const [labels, setLabels] = useState<UploadLabels>({
    class: "",
    subject: "",
    topic: "",
    section: "",
    semester: "",
    tags: [],
  });

  const [currentTag, setCurrentTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(labels);
  };

  const addTag = () => {
    if (currentTag.trim() && !labels.tags?.includes(currentTag.trim())) {
      setLabels(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setLabels(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Add File Labels</h2>
        <p className="text-sm text-gray-600 mt-1">File: {fileName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <input
            type="text"
            value={labels.class || ""}
            onChange={(e) => setLabels(prev => ({ ...prev, class: e.target.value }))}
            placeholder="e.g., 10th, 12th, BSc"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            required
            value={labels.subject || ""}
            onChange={(e) => setLabels(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g., Mathematics, Physics, Chemistry"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic *
          </label>
          <input
            type="text"
            required
            value={labels.topic || ""}
            onChange={(e) => setLabels(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="e.g., Calculus, Mechanics, Organic Chemistry"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <input
            type="text"
            value={labels.section || ""}
            onChange={(e) => setLabels(prev => ({ ...prev, section: e.target.value }))}
            placeholder="e.g., A, B, Section 1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
          <select
            value={labels.semester || ""}
            onChange={(e) => setLabels(prev => ({ ...prev, semester: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Semester</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">3rd Semester</option>
            <option value="4">4th Semester</option>
            <option value="5">5th Semester</option>
            <option value="6">6th Semester</option>
            <option value="7">7th Semester</option>
            <option value="8">8th Semester</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add tags (press Enter)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          {/* Display Tags */}
          {labels.tags && labels.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {labels.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload & Process
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

interface SuggestedFile {
  id: string;
  fileName: string;
  cloudflareUrl: string;
  labels: {
    subject: string;
    topic: string;
    class?: string;
    semester?: string;
    tags?: string[];
  };
  metadata: {
    pageCount?: number;
    extractedAt: string;
  };
  uploaderType: string;
  uploader: {
    name: string;
    userType: string;
  };
  ratings: {
    averageRating: number;
    totalRatings: number;
  };
  viewsCount: number;
  suggestionScore: number;
  reason: string;
  preview: string;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<SuggestedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      // Check if user is logged in
      const token = localStorage.getItem("userToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/suggestions", {
        method: "GET",
        headers,
      });

      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.suggestions);
        setUserProfile(data.userProfile);
      } else {
        console.error("Failed to load suggestions:", data.error);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const getSuggestionIcon = (reason: string) => {
    if (reason.includes("profile")) return "👤";
    if (reason.includes("rating")) return "⭐";
    if (reason.includes("popular")) return "🔥";
    if (reason.includes("recent")) return "🆕";
    return "💡";
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-4">
            Personalized Suggestions
          </h1>
          <p className="text-lg text-text-light">
            {userProfile 
              ? `Curated content based on your profile and interests` 
              : `Discover popular educational content from our community`}
          </p>
        </div>

        {/* User Profile Info */}
        {userProfile && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-text-dark mb-4">Your Profile</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-text-light">Type:</span>
                <p className="font-medium capitalize">{userProfile.userType}</p>
              </div>
              {userProfile.profile?.class && (
                <div>
                  <span className="text-sm text-text-light">Class:</span>
                  <p className="font-medium">{userProfile.profile.class}</p>
                </div>
              )}
              {userProfile.profile?.subject && (
                <div>
                  <span className="text-sm text-text-light">Subject:</span>
                  <p className="font-medium">{userProfile.profile.subject}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-text-light">Loading personalized suggestions...</p>
          </div>
        )}

        {/* Suggestions List */}
        {!isLoading && suggestions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-dark">
              Recommended for You ({suggestions.length})
            </h2>
            
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 animate-fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{getSuggestionIcon(suggestion.reason)}</span>
                      <h3 className="text-xl font-bold text-text-dark">
                        {suggestion.fileName}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary-green text-white rounded-full text-sm">
                        {suggestion.labels.subject}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                        {suggestion.labels.topic}
                      </span>
                      {suggestion.labels.class && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                          {suggestion.labels.class}
                        </span>
                      )}
                      {suggestion.labels.semester && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                          {suggestion.labels.semester}
                        </span>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-primary-green font-medium mb-1">
                        Why this suggestion:
                      </p>
                      <p className="text-sm text-text-dark">{suggestion.reason}</p>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="flex items-center mb-1">
                      {renderStars(suggestion.ratings.averageRating)}
                      <span className="ml-2 text-sm text-text-light">
                        ({suggestion.ratings.totalRatings})
                      </span>
                    </div>
                    <p className="text-sm text-text-light">
                      {suggestion.viewsCount} views • {suggestion.uploaderType}
                    </p>
                    <div className="mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {(suggestion.suggestionScore * 100).toFixed(0)}% match
                    </div>
                  </div>
                </div>

                <p className="text-text-light mb-4">{suggestion.preview}</p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-text-light">
                    {suggestion.metadata.pageCount && (
                      <span>{suggestion.metadata.pageCount} pages</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => window.open(suggestion.cloudflareUrl, '_blank')}
                    className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green-dark transform hover:-translate-y-1 transition-all duration-300"
                  >
                    View File
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Suggestions */}
        {!isLoading && suggestions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-text-light mb-4">💡</div>
            <h3 className="text-xl font-semibold text-text-dark mb-2">
              No suggestions available yet
            </h3>
            <p className="text-text-light mb-6">
              {userProfile 
                ? "Complete your profile or upload some files to get personalized suggestions" 
                : "Sign in to get personalized suggestions based on your interests"}
            </p>
            {!userProfile && (
              <button
                onClick={() => window.location.href = '/login'}
                className="px-8 py-3 bg-[#4A7766] text-white rounded-xl font-semibold hover:bg-[#3C6757] hover:shadow-[0_8px_30px_rgba(74,119,102,0.25)] transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
              >
                Sign In for Suggestions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
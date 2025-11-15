"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

interface SearchResult {
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
  searchScore: {
    semantic: number;
    textMatch: number;
    labelMatch: number;
    rating: number;
    combined: number;
  };
  preview: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    subject: "",
    class: "",
    semester: "",
    uploaderType: "",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== "")
          ),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data.results);
      } else {
        console.error("Search failed:", data.error);
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
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

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-4">
            Search Educational Content
          </h1>
          <p className="text-lg text-text-light">
            Find study materials, research papers, and educational resources using AI-powered search
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for topics, subjects, or content..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-8 py-3 bg-primary-green text-white rounded-lg font-semibold hover:bg-primary-green-dark disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-300"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-4 gap-4">
              <select
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Biology">Biology</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
              </select>

              <select
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="">All Classes</option>
                <option value="9th Grade">9th Grade</option>
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
              </select>

              <select
                value={filters.semester}
                onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Fall 2024">Fall 2024</option>
                <option value="Spring 2024">Spring 2024</option>
              </select>

              <select
                value={filters.uploaderType}
                onChange={(e) => setFilters(prev => ({ ...prev, uploaderType: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="">All Uploaders</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="college">Colleges</option>
              </select>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-text-dark">
              Search Results ({results.length})
            </h2>
            
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 animate-fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-dark mb-2">
                      {result.fileName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary-green text-white rounded-full text-sm">
                        {result.labels.subject}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                        {result.labels.topic}
                      </span>
                      {result.labels.class && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                          {result.labels.class}
                        </span>
                      )}
                      {result.labels.semester && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                          {result.labels.semester}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      {renderStars(result.ratings.averageRating)}
                      <span className="ml-2 text-sm text-text-light">
                        ({result.ratings.totalRatings} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-text-light">
                      {result.viewsCount} views • {result.uploaderType}
                    </p>
                  </div>
                </div>

                <p className="text-text-light mb-4">{result.preview}</p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-text-light">
                    <span>Match Score: {(result.searchScore.combined * 100).toFixed(1)}%</span>
                    {result.metadata.pageCount && (
                      <span className="ml-4">{result.metadata.pageCount} pages</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => window.open(result.cloudflareUrl, '_blank')}
                    className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green-dark transform hover:-translate-y-1 transition-all duration-300"
                  >
                    View File
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {results.length === 0 && searchQuery && !isSearching && (
          <div className="text-center py-12">
            <div className="text-6xl text-text-light mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-text-dark mb-2">No results found</h3>
            <p className="text-text-light">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {/* Search Placeholder */}
        {!searchQuery && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-primary-green mb-4">📚</div>
            <h3 className="text-xl font-semibold text-text-dark mb-2">
              Start your search
            </h3>
            <p className="text-text-light">
              Enter keywords to find relevant educational content
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
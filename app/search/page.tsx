"use client";

import { useState, useEffect } from "react";
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

interface AvailableLabels {
  subjects: string[];
  classes: string[];
  semesters: string[];
  uploaderTypes: string[];
  topics: string[];
  tags: string[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<AvailableLabels>({
    subjects: [],
    classes: [],
    semesters: [],
    uploaderTypes: [],
    topics: [],
    tags: []
  });
  const [filters, setFilters] = useState({
    subject: "",
    class: "",
    semester: "",
    uploaderType: "",
  });

  // Load available labels on component mount
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await fetch("/api/search/labels");
        if (response.ok) {
          const labels = await response.json();
          setAvailableLabels(labels);
        }
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      }
    };

    fetchLabels();
  }, []);

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
        setResults(data.results || []);
        if (data.results?.length === 0) {
          console.log("No matching results found");
        }
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
                {availableLabels.subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              <select
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="">All Classes</option>
                {availableLabels.classes.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>

              <select
                value={filters.semester}
                onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="">All Semesters</option>
                {availableLabels.semesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>

              <select
                value={filters.uploaderType}
                onChange={(e) => setFilters(prev => ({ ...prev, uploaderType: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              >
                <option value="">All Uploaders</option>
                {availableLabels.uploaderTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text-dark">
                Search Results ({results.length})
              </h2>
              <div className="text-sm text-text-light">
                Sorted by relevance • Best matches first
              </div>
            </div>
            
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
                      <span className="px-3 py-1 bg-primary-green text-white rounded-full text-sm font-medium">
                        {result.labels.subject}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {result.labels.topic}
                      </span>
                      {result.labels.class && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                          {result.labels.class}
                        </span>
                      )}
                      {result.labels.semester && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                          {result.labels.semester}
                        </span>
                      )}
                      {result.labels.tags && result.labels.tags.length > 0 && (
                        result.labels.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            #{tag}
                          </span>
                        ))
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
                    <div className="text-xs text-green-600 font-medium mt-1">
                      Match: {(result.searchScore.combined * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <p className="text-text-light mb-4">{result.preview}</p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-text-light">
                    <div className="flex gap-4">
                      <span>Label Match: {(result.searchScore.labelMatch * 100).toFixed(0)}%</span>
                      <span>Text Match: {(result.searchScore.textMatch * 100).toFixed(0)}%</span>
                      {result.metadata.pageCount && (
                        <span>{result.metadata.pageCount} pages</span>
                      )}
                    </div>
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
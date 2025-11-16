"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-lg border-b-2 border-primary-green/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-primary-green rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <span className="text-white font-bold">📚</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#4A7766]">SmartNotes</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-text-dark hover:text-primary-green hover:underline transition-colors duration-300 font-bold">
            Home
          </Link>
          <Link href="/search" className="text-text-dark hover:text-primary-green hover:underline transition-colors duration-300 font-bold">
            Search
          </Link>
          <Link href="/suggestions" className="text-text-dark hover:text-primary-green hover:underline transition-colors duration-300 font-bold">
            Suggestions
          </Link>
          <Link href="/about" className="text-text-dark hover:text-primary-green hover:underline transition-colors duration-300 font-bold">
            About
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {!isLoading && (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  {/* User Profile Button */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#4A7766] text-white rounded-full hover:bg-[#3C6757] transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-[#4A7766] font-bold text-sm">
                        {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="font-medium">{user.username || user.email}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/search"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Search Files
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/search"
                    className="px-6 py-2 bg-[#4A7766] text-white border-2 border-[#4A7766] rounded-full hover:bg-[#3C6757] focus-visible:ring-2 focus-visible:ring-[#4A7766] transform hover:-translate-y-1 transition-all duration-300 font-medium"
                  >
                    Search Files
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-2 bg-[#4A7766] text-white border-2 border-[#4A7766] rounded-full hover:bg-[#3C6757] focus-visible:ring-2 focus-visible:ring-[#4A7766] transform hover:-translate-y-1 transition-all duration-300 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2 bg-[#4A7766] text-white border-2 border-[#4A7766] rounded-full hover:bg-[#3C6757] focus-visible:ring-2 focus-visible:ring-[#4A7766] transform hover:-translate-y-1 transition-all duration-300 font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-primary-green"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-primary-green/20">
          <div className="flex flex-col space-y-3 pt-4">
            <Link 
              href="/" 
              className="text-text-dark hover:text-primary-green transition-colors px-4 py-2 font-bold"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/search" 
              className="text-text-dark hover:text-primary-green transition-colors px-4 py-2 font-bold"
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </Link>
            <Link 
              href="/suggestions" 
              className="text-text-dark hover:text-primary-green transition-colors px-4 py-2 font-bold"
              onClick={() => setIsMenuOpen(false)}
            >
              Suggestions
            </Link>
            <Link 
              href="/about" 
              className="text-text-dark hover:text-primary-green transition-colors px-4 py-2 font-bold"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {/* Mobile auth section */}
            <div className="flex flex-col space-y-2 px-4 pt-2">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <div className="px-4 py-2 bg-gray-100 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="text-center px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="text-center px-4 py-2 bg-[#4A7766] text-white rounded-full hover:bg-[#3C6757]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link 
                        href="/signup" 
                        className="text-center px-4 py-2 bg-[#4A7766] text-white border-2 border-[#4A7766] rounded-full hover:bg-[#3C6757] focus-visible:ring-2 focus-visible:ring-[#4A7766]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

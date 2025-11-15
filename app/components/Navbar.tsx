"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-lg border-b-2 border-primary-green/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-primary-green rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <span className="text-white font-bold">📚</span>
          </div>
          <span className="text-2xl font-bold text-primary-green">SmartNotes</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-text-dark hover:text-primary-green transition-colors duration-300 font-medium">
            Home
          </Link>
          <Link href="/search" className="text-text-dark hover:text-primary-green transition-colors duration-300 font-medium">
            Search
          </Link>
          <Link href="/suggestions" className="text-text-dark hover:text-primary-green transition-colors duration-300 font-medium">
            Suggestions
          </Link>
          <Link href="/about" className="text-text-dark hover:text-primary-green transition-colors duration-300 font-medium">
            About
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="px-6 py-2 text-primary-green border-2 border-primary-green rounded-full hover:bg-primary-green hover:text-white transform hover:-translate-y-1 transition-all duration-300 font-medium">
            Search Files
          </button>
          <Link
            href="/login"
            className="px-6 py-2 text-white bg-primary-green rounded-full hover:bg-primary-green-dark transform hover:-translate-y-1 transition-all duration-300 font-medium"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 text-primary-green border-2 border-primary-green rounded-full hover:bg-primary-green hover:text-white transform hover:-translate-y-1 transition-all duration-300 font-medium"
          >
            Sign Up
          </Link>
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
            <Link href="/" className="text-text-dark hover:text-primary-green transition-colors px-4 py-2">Home</Link>
            <Link href="/search" className="text-text-dark hover:text-primary-green transition-colors px-4 py-2">Search</Link>
            <Link href="/suggestions" className="text-text-dark hover:text-primary-green transition-colors px-4 py-2">Suggestions</Link>
            <Link href="/about" className="text-text-dark hover:text-primary-green transition-colors px-4 py-2">About</Link>
            <div className="flex flex-col space-y-2 px-4 pt-2">
              <Link href="/login" className="text-center px-4 py-2 bg-primary-green text-white rounded-full">Login</Link>
              <Link href="/signup" className="text-center px-4 py-2 border-2 border-primary-green text-primary-green rounded-full">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

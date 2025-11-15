"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full px-6 py-4 bg-black text-white flex items-center justify-between">
      
      {/* Left side */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold">MyApp</Link>
        <Link href="/" className="hover:text-gray-300">Home</Link>
        <Link href="/about" className="hover:text-gray-300">About Us</Link>
        <Link href="/contact" className="hover:text-gray-300">Contact Us</Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="px-3 py-2 border border-white rounded hover:bg-white hover:text-black transition">
          Search
        </button>
        <Link
          href="/login"
          className="px-3 py-2 bg-white text-black rounded hover:opacity-90"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-3 py-2 bg-white text-black rounded hover:opacity-90"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

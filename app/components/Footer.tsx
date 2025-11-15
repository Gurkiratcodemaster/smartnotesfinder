"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#4A7766] border-t border-[#3C6757] border-opacity-20 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:items-start lg:justify-between">
          {/* Branding */}
          <div className="flex-1 lg:flex-[0.9]">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-primary-green rounded-md flex items-center justify-center text-white text-lg font-semibold transform group-hover:rotate-12 transition-transform duration-300">
                📚
              </div>
              <div>
                <div className="text-xl font-semibold text-white">SmartNotes</div>
                <div className="text-sm text-white/90 mt-1">Smart notes & resources for every student</div>
              </div>
            </Link>

            <p className="text-sm text-white/90 mt-6 max-w-md">
              SmartNotes is a student-first platform to discover, upload, and share study notes — powered by a community of learners and AI search.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center space-x-3">
              <a className="inline-flex items-center justify-center text-white hover:bg-white hover:text-[#4A7766] transition-all duration-200 transform hover:scale-110 p-2 rounded-full" href="https://www.instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
                {/* Instagram */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              <a className="inline-flex items-center justify-center text-white hover:bg-white hover:text-[#4A7766] transition-all duration-200 transform hover:scale-110 p-2 rounded-full" href="https://www.linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                {/* LinkedIn */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6h-4V8h4v2a4 4 0 0 1 4-2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="8" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              <a className="inline-flex items-center justify-center text-white hover:bg-white hover:text-[#4A7766] transition-all duration-200 transform hover:scale-110 p-2 rounded-full" href="https://github.com/Gurkiratcodemaster/smartnotesfinder" aria-label="GitHub" target="_blank" rel="noreferrer">
                {/* GitHub */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19c-4.418 1.25-4.418-2.2-6-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2a10 10 0 0 0-3 19.5c.5.1.7-.2.7-.5v-1.8c-3 .6-3.6-1.5-3.6-1.5-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1 .1 1.6 1 1.6 1 .9 1.6 2.6 1.1 3.2.9.1-.7.4-1.1.7-1.4-2.4-.3-5-1.2-5-5.5 0-1.2.4-2.2 1-3-.1-.3-.4-1.4.1-2.9 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5.1 0c2-.1 2.8-1 2.8-1 .4 1.5.1 2.6 0 2.9.6.8 1 1.8 1 3 0 4.4-2.6 5.2-5 5.5.4.3.7.8.7 1.6v2.4c0 .3.2.6.7.5A10 10 0 0 0 12 2z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              <a className="inline-flex items-center justify-center text-white hover:bg-white hover:text-[#4A7766] transition-all duration-200 transform hover:scale-110 p-2 rounded-full" href="https://www.youtube.com" aria-label="YouTube" target="_blank" rel="noreferrer">
                {/* YouTube */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 8s-.2-1.8-.9-2.5C20 4.2 18.6 4 17.9 4H6.1C5.4 4 4 4.2 2.9 5.5 2.2 6.2 2 8 2 8s-.2 1.8.9 2.5C4 12 5.4 12.2 6.1 12.2h11.8c.7 0 2.1-.2 3.2-1.5.7-.7.9-2.5.9-2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9l4 2-4 2V9z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              <a className="inline-flex items-center justify-center text-white hover:bg-white hover:text-[#4A7766] transition-all duration-200 transform hover:scale-110 p-2 rounded-full" href="https://www.facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                {/* Facebook */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v7h4v-7h3l1-4h-4V6a1 1 0 0 1 1-1h3V2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 lg:gap-16">
            <div>
              <h4 className="text-sm font-semibold text-white">Support & Help</h4>
              <ul className="mt-4 space-y-3 text-sm text-white/90">
                <li><Link href="/faq" className="hover:underline hover:text-white">FAQ</Link></li>
                <li><Link href="/help" className="hover:underline hover:text-white">Help Center</Link></li>
                <li><Link href="/upload" className="hover:underline hover:text-white">How to Upload</Link></li>
                <li><Link href="/report" className="hover:underline hover:text-white">Report a Problem</Link></li>
                <li><Link href="/terms" className="hover:underline hover:text-white">Terms &amp; Conditions</Link></li>
                <li><Link href="/privacy" className="hover:underline hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Legal & Policies</h4>
              <ul className="mt-4 space-y-3 text-sm text-white/90">
                <li><Link href="/copyright-policy" className="hover:underline hover:text-white">Copyright Policy</Link></li>
                <li><Link href="/content-guidelines" className="hover:underline hover:text-white">Content Guidelines</Link></li>
                <li><Link href="/data-usage" className="hover:underline hover:text-white">Data Usage Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#3C6757] border-opacity-10 text-center text-sm">
          <div className="text-white">© {year} SmartNotes — All Rights Reserved.</div>
          <div className="mt-2 text-xs text-white/80">SmartNotes — An educational resources platform. Use responsibly; see our policies for more information.</div>
        </div>
      </div>
    </footer>
  );
}

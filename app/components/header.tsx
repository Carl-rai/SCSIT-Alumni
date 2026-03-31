"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-blue-700/40 bg-blue-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/nah.png"
            alt="Alumni Logo"
            className="h-10 w-9 object-contain"
          />
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-yellow-400">Alumni</span>
          </span>
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-9">
          <Link href="/directory" className="hover:text-yellow-400 transition-colors">
            Directory
          </Link>
          <Link href="/events" className="hover:text-yellow-400 transition-colors">
            Events
          </Link>
          <Link href="/jobs" className="hover:text-yellow-400 transition-colors">
            Career
          </Link>
        </div>

        {/* Buttons
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border border-blue-400/60 hover:border-yellow-400/70 hover:text-yellow-300 transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/registration"
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-semibold rounded-full transition-colors shadow-md shadow-yellow-700/20"
          >
            Join Now
          </Link>
        </div> */}
      </div>
    </nav>
  );
}

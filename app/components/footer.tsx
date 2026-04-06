"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuthState = () => setIsLoggedIn(!!localStorage.getItem("accessToken"));
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  return (
    <footer className="relative bg-blue-950 border-t border-blue-800/50 pt-12 pb-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-10 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/nah.png" alt="Logo" className="h-9 w-8 object-contain" />
              <span className="text-xl font-bold text-yellow-400">SCSIT Alumni</span>
            </div>
            <p className="text-blue-300 text-sm leading-relaxed">
              Connecting graduates, celebrating milestones, and building a stronger alumni community.
            </p>
          </div>
          <div>
            <p className="text-yellow-400 font-semibold mb-4">Quick Links</p>
            <ul className="space-y-2 text-sm text-blue-300">
              <li><Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link></li>
              <li><Link href="/events" className="hover:text-yellow-400 transition-colors">Events</Link></li>
              <li><Link href="/career" className="hover:text-yellow-400 transition-colors">Career</Link></li>
              <li><Link href="/directory" className="hover:text-yellow-400 transition-colors">Directory</Link></li>
              <li><Link href="/about" className="hover:text-yellow-400 transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-yellow-400 font-semibold mb-4">Account</p>
            <ul className="space-y-2 text-sm text-blue-300">
              {isLoggedIn ? (
                <>
                  <li><Link href="/profile" className="hover:text-yellow-400 transition-colors">My Profile</Link></li>
                  <li><Link href="/report" className="hover:text-yellow-400 transition-colors">Report</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="hover:text-yellow-400 transition-colors">Sign In</Link></li>
                  <li><Link href="/registration" className="hover:text-yellow-400 transition-colors">Register</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-800/50 pt-6 text-center text-blue-400 text-sm">
          <p>© {new Date().getFullYear()} Salazar Colleges of Science and Institute of Technology Alumni Association</p>
          <p className="mt-1 text-blue-500">Made with pride by SCSIT, for alumni.</p>
        </div>
      </div>
    </footer>
  );
}

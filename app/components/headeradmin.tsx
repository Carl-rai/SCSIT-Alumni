"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import LogoutConfirmModal from "./logout-confirm-modal";
import { useToast } from "@/app/components/toast-provider";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  useEffect(() => {
    checkLoginStatus();
  }, [pathname]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("userToken");
    setIsLoggedIn(!!token);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    window.dispatchEvent(new Event("storage"));
    showToast("You have been logged out.", "success");
    router.push("/");
  };

  return (
    <nav className="border-b border-blue-700/40 bg-blue-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/admin-dashboard" className="flex items-center gap-3">
          <img
            src="/nah.png"
            alt="Alumni Logo"
            className="h-10 w-9 object-contain"
          />
          <span className="text-2xl font-bold tracking-tight text-yellow-400">
            Admin Dashboard
          </span>
        </Link>

        {/* Logout Button */}
        {isLoggedIn && (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-950 px-6 py-2 rounded-lg font-semibold transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        )}
      </div>
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </nav>
  );
}

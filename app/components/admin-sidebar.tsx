"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Calendar, Search, Shield, FileText, LogOut, LayoutDashboard, BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import LogoutConfirmModal from "./logout-confirm-modal";
import { useToast } from "@/app/components/toast-provider";

const navItems = [
  { href: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-dashboard/user-manage", label: "Alumni Management", icon: Users },
  { href: "/admin-dashboard/staff-manage", label: "Staff Accounts", icon: Shield },
  { href: "/admin-dashboard/view-eventadmin", label: "Events", icon: Calendar },
  { href: "/admin-dashboard/view-jobadmin", label: "Career & Jobs", icon: Search },
  { href: "/admin-dashboard/alumni-recordsadmin", label: "Alumni Records", icon: BookOpen },
  { href: "/admin-dashboard/adminreports-view", label: "Reports", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setShowLogoutConfirm(false);
    window.dispatchEvent(new Event("storage"));
    showToast("You have been logged out.", "success");
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-blue-800/50">
        <div className="flex items-center gap-3">
          <img src="/nah.png" alt="Logo" className="h-9 w-8 object-contain" />
          <div>
            <p className="text-yellow-400 font-bold text-base leading-tight">SCSIT Alumni</p>
            <p className="text-blue-400 text-xs">Admin Panel</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-blue-300 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin-dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-yellow-500 text-blue-950 shadow-lg shadow-yellow-500/20"
                  : "text-blue-200 hover:bg-blue-800/60 hover:text-white"
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-blue-800/50">
        <button onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-blue-950 border-b border-blue-800/50 shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/nah.png" alt="Logo" className="h-8 w-7 object-contain" />
          <div>
            <p className="text-yellow-400 font-bold text-sm leading-tight">SCSIT Alumni</p>
            <p className="text-blue-400 text-xs">Admin Panel</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 text-blue-200 hover:text-white transition-colors">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-blue-950 border-r border-blue-800/50 z-50 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-blue-950 border-r border-blue-800/50 flex-col z-40 shadow-2xl">
        <SidebarContent />
      </aside>
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

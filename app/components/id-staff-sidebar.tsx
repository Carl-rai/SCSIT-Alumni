"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, IdCard, LogOut, Menu, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import LogoutConfirmModal from "./logout-confirm-modal";
import { useToast } from "@/app/components/toast-provider";

const navItems = [
  { href: "/id-staff-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/id-staff-dashboard/id-requests", label: "ID Requests", icon: IdCard },
];

type SidebarContentProps = {
  pathname: string;
  userName: string;
  onClose: () => void;
  onRequestLogout: () => void;
};

function SidebarContent({ pathname, userName, onClose, onRequestLogout }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-blue-800/50 px-6 py-5">
        <div className="flex items-center gap-3">
          <img src="/nah.png" alt="Logo" className="h-9 w-8 object-contain" />
          <div>
            <p className="text-base font-bold leading-tight text-yellow-400">SCSIT Alumni</p>
            <p className="text-xs text-blue-400">ID Staff Panel</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-blue-300 hover:text-white lg:hidden">
          <X size={20} />
        </button>
      </div>

      <div className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-blue-700/40 bg-blue-800/40 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/20">
          <Users size={18} className="text-yellow-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{userName}</p>
          <p className="text-xs text-blue-400">ID Staff</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/id-staff-dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-yellow-500 text-blue-950 shadow-lg shadow-yellow-500/20"
                  : "text-blue-200 hover:bg-blue-800/60 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-blue-800/50 px-3 py-4">
        <button
          onClick={onRequestLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function IdStaffSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userName = useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof window === "undefined") return "ID Staff";
      return localStorage.getItem("userName") || "ID Staff";
    },
    () => "ID Staff"
  );
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

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-blue-800/50 bg-blue-950 px-4 py-3 shadow-lg lg:hidden">
        <div className="flex items-center gap-3">
          <img src="/nah.png" alt="Logo" className="h-8 w-7 object-contain" />
          <div>
            <p className="text-sm font-bold leading-tight text-yellow-400">SCSIT Alumni</p>
            <p className="text-xs text-blue-400">ID Staff Panel</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 text-blue-200 transition-colors hover:text-white">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed left-0 top-0 z-50 h-full w-72 border-r border-blue-800/50 bg-blue-950 shadow-2xl transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent
          pathname={pathname}
          userName={userName}
          onClose={() => setOpen(false)}
          onRequestLogout={() => setShowLogoutConfirm(true)}
        />
      </aside>

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-blue-800/50 bg-blue-950 shadow-2xl lg:flex">
        <SidebarContent
          pathname={pathname}
          userName={userName}
          onClose={() => setOpen(false)}
          onRequestLogout={() => setShowLogoutConfirm(true)}
        />
      </aside>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, GraduationCap, Bell, Calendar, Briefcase, Clock, CheckCheck, Trash2, MessageCircle } from "lucide-react";
import { apiUrl } from "@/lib/api";
import LogoutConfirmModal from "./logout-confirm-modal";
import { useToast } from "@/app/components/toast-provider";

const STORAGE_KEY = "user_notif_state";
function loadState(): { readIds: string[]; deletedIds: string[] } {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return { readIds: [], deletedIds: [] }; }
}
function saveState(s: { readIds: string[]; deletedIds: string[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [newEvents, setNewEvents] = useState<any[]>([]);
  const [newJobs, setNewJobs] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [unreadReplies, setUnreadReplies] = useState(0);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("accessToken");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    setIsLoggedIn(!!token);
    setUserName(name || "Profile");
    setUserEmail(email || "");
    if (token && role === "user") {
      const saved = loadState();
      setReadIds(new Set(saved.readIds || []));
      setDeletedIds(new Set(saved.deletedIds || []));
      fetchUserNotifications(email || "");
      fetchUnreadReplies(email || "");
    }
  };

  const fetchUserNotifications = async (email: string) => {
    try {
      const res = await fetch(apiUrl(`/api/user-notifications/?email=${encodeURIComponent(email)}`));
      const data = await res.json();
      setNewEvents(data.new_events || []);
      setNewJobs(data.new_jobs || []);
      setReminders(data.upcoming_reminders || []);
    } catch {}
  };

  const fetchUnreadReplies = async (email: string) => {
    if (!email) return;
    try {
      const res = await fetch(apiUrl(`/api/reports/unread-replies/?email=${encodeURIComponent(email)}`));
      const data = await res.json();
      setUnreadReplies(data.unread_count || 0);
    } catch {}
  };

  const nKey = (type: string, id: number) => `${type}_${id}`;

  const markRead = (key: string) => {
    setReadIds(prev => {
      const next = new Set(prev).add(key);
      const saved = loadState();
      saveState({ readIds: [...next], deletedIds: saved.deletedIds || [] });
      return next;
    });
  };

  const deleteNotif = (key: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDeletedIds(prev => {
      const next = new Set(prev).add(key);
      const saved = loadState();
      saveState({ readIds: saved.readIds || [], deletedIds: [...next] });
      return next;
    });
  };

  const markAllRead = () => {
    const allKeys = [
      ...newEvents.map(e => nKey("event", e.id)),
      ...newJobs.map(j => nKey("job", j.id)),
      ...reminders.map(r => nKey("reminder", r.id)),
    ];
    const next = new Set([...readIds, ...allKeys]);
    setReadIds(next);
    saveState({ readIds: [...next], deletedIds: [...deletedIds] });
  };

  const deleteAll = () => {
    const allKeys = [
      ...newEvents.map(e => nKey("event", e.id)),
      ...newJobs.map(j => nKey("job", j.id)),
      ...reminders.map(r => nKey("reminder", r.id)),
    ];
    const next = new Set([...deletedIds, ...allKeys]);
    setDeletedIds(next);
    saveState({ readIds: [...readIds], deletedIds: [...next] });
  };

  const visibleEvents = newEvents.filter(e => !deletedIds.has(nKey("event", e.id)));
  const visibleJobs = newJobs.filter(j => !deletedIds.has(nKey("job", j.id)));
  const visibleReminders = reminders.filter(r => !deletedIds.has(nKey("reminder", r.id)));
  const totalVisible = visibleEvents.length + visibleJobs.length + visibleReminders.length + unreadReplies;
  const unreadCount = [
    ...visibleEvents.filter(e => !readIds.has(nKey("event", e.id))),
    ...visibleJobs.filter(j => !readIds.has(nKey("job", j.id))),
    ...visibleReminders.filter(r => !readIds.has(nKey("reminder", r.id))),
  ].length + unreadReplies;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    ["accessToken","refreshToken","userRole","userName","userEmail"].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    setIsLoggedIn(false);
    setShowDropdown(false);
    setMobileOpen(false);
    setShowLogoutConfirm(false);
    window.dispatchEvent(new Event("storage"));
    showToast("You have been logged out.", "success");
    router.push("/");
  };

  const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/events", label: "Events" },
    { href: "/career", label: "Career" },
    { href: "/about", label: "About Us" },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-blue-950/95 backdrop-blur-xl shadow-lg shadow-blue-950/50 border-b border-blue-800/60"
        : "bg-blue-950/80 backdrop-blur-md border-b border-blue-800/30"
    }`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md group-hover:bg-yellow-400/30 transition-all" />
            <img src="/nah.png" alt="Logo" className="relative h-10 w-9 object-contain" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-yellow-400">SCSIT</span>
              <span className="text-white"> Alumni</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === href
                  ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                  : "text-blue-200 hover:text-white hover:bg-blue-800/50"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotif(v => !v)}
                  className="relative p-2 bg-blue-800/40 hover:bg-blue-700/60 border border-blue-700/40 rounded-xl transition-all">
                  <Bell size={17} className={unreadCount > 0 ? "text-yellow-400" : "text-blue-400"} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 top-11 w-80 bg-[#0a1628] border border-blue-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-blue-800/50">
                      <span className="text-white font-bold text-sm">Notifications {totalVisible > 0 && <span className="text-blue-400 font-normal">({totalVisible})</span>}</span>
                      <button onClick={() => setShowNotif(false)}><X size={14} className="text-gray-400 hover:text-white" /></button>
                    </div>

                    {totalVisible > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/60 border-b border-blue-900/40">
                        <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-white transition-colors">
                          <CheckCheck size={12} /> Mark all read
                        </button>
                        <span className="text-blue-800">|</span>
                        <button onClick={deleteAll} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 size={12} /> Delete all
                        </button>
                      </div>
                    )}

                    <div className="max-h-80 overflow-y-auto">
                      {totalVisible === 0 && (
                        <p className="text-blue-400 text-xs text-center py-6">No new notifications</p>
                      )}

                      {/* Report Replies */}
                      {unreadReplies > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-purple-900/30 flex items-center gap-2">
                            <MessageCircle size={12} className="text-purple-400" />
                            <span className="text-purple-400 text-xs font-semibold">Report Replies ({unreadReplies})</span>
                          </div>
                          <Link href="/report"
                            onClick={() => { setUnreadReplies(0); setShowNotif(false); }}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-blue-900/30 transition-colors border-b border-blue-900/30 group/item">
                            <div className="relative w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <MessageCircle size={13} className="text-purple-400" />
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-400 rounded-full" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white text-xs font-medium">You have {unreadReplies} new {unreadReplies === 1 ? "reply" : "replies"}</p>
                              <p className="text-blue-400 text-[11px]">Click to view your reports</p>
                            </div>
                          </Link>
                        </div>
                      )}

                      {/* Reminders */}
                      {visibleReminders.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-orange-900/30 flex items-center gap-2">
                            <Clock size={12} className="text-orange-400" />
                            <span className="text-orange-400 text-xs font-semibold">Event Reminders ({visibleReminders.length})</span>
                          </div>
                          {visibleReminders.map((r) => {
                            const key = nKey("reminder", r.id);
                            const isRead = readIds.has(key);
                            return (
                              <Link key={r.id} href="/events"
                                onClick={() => { markRead(key); setShowNotif(false); }}
                                className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-900/30 transition-colors border-b border-blue-900/30 group/item ${isRead ? "opacity-50" : ""}`}>
                                <div className="relative w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                  <Clock size={13} className="text-orange-400" />
                                  {!isRead && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-orange-300 text-xs font-semibold">Tomorrow's Event!</p>
                                  <p className="text-white text-xs font-medium truncate">{r.title}</p>
                                  <p className="text-blue-400 text-[11px]">{r.start_time} Â· {r.location}</p>
                                </div>
                                <button onClick={(e) => deleteNotif(key, e)} className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all shrink-0">
                                  <X size={11} className="text-red-400" />
                                </button>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* New Events */}
                      {visibleEvents.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-blue-900/30 flex items-center gap-2">
                            <Calendar size={12} className="text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-semibold">New Events ({visibleEvents.length})</span>
                          </div>
                          {visibleEvents.map((ev) => {
                            const key = nKey("event", ev.id);
                            const isRead = readIds.has(key);
                            return (
                              <Link key={ev.id} href="/events"
                                onClick={() => { markRead(key); setShowNotif(false); }}
                                className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-900/30 transition-colors border-b border-blue-900/30 group/item ${isRead ? "opacity-50" : ""}`}>
                                <div className="relative w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                  <Calendar size={13} className="text-emerald-400" />
                                  {!isRead && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-white text-xs font-medium truncate">{ev.title}</p>
                                  <p className="text-blue-400 text-[11px]">{ev.date ? new Date(ev.date).toLocaleDateString() : ""} Â· {ev.location}</p>
                                </div>
                                <button onClick={(e) => deleteNotif(key, e)} className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all shrink-0">
                                  <X size={11} className="text-red-400" />
                                </button>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* New Jobs */}
                      {visibleJobs.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-blue-900/30 flex items-center gap-2">
                            <Briefcase size={12} className="text-yellow-400" />
                            <span className="text-yellow-400 text-xs font-semibold">New Job Postings ({visibleJobs.length})</span>
                          </div>
                          {visibleJobs.map((j) => {
                            const key = nKey("job", j.id);
                            const isRead = readIds.has(key);
                            return (
                              <Link key={j.id} href="/career"
                                onClick={() => { markRead(key); setShowNotif(false); }}
                                className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-900/30 transition-colors border-b border-blue-900/30 group/item ${isRead ? "opacity-50" : ""}`}>
                                <div className="relative w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                  <Briefcase size={13} className="text-yellow-400" />
                                  {!isRead && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-white text-xs font-medium truncate">{j.job_title}</p>
                                  <p className="text-blue-400 text-[11px] truncate">{j.company_name} Â· {j.employment_type?.replace("_", " ")}</p>
                                </div>
                                <button onClick={(e) => deleteNotif(key, e)} className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all shrink-0">
                                  <X size={11} className="text-red-400" />
                                </button>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2 border-t border-blue-800/50 text-center">
                      <span className="text-blue-500 text-[11px]">Events & jobs from last 7 days</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-800/50 hover:bg-blue-700/60 border border-blue-700/40 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center">
                    <GraduationCap size={14} className="text-blue-950" />
                  </div>
                  <span className="text-sm text-white max-w-[100px] truncate">{userName}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-blue-900 border border-blue-700/50 rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-blue-700/40">
                      <p className="text-yellow-400 font-semibold text-sm truncate">{userName}</p>
                      <p className="text-blue-400 text-xs truncate">{userEmail}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-3 text-sm hover:bg-blue-800 transition-colors" onClick={() => setShowDropdown(false)}>
                      My Profile
                    </Link>
                    <Link href="/report" className="block px-4 py-3 text-sm hover:bg-blue-800 transition-colors" onClick={() => setShowDropdown(false)}>
                      My Reports
                    </Link>
                    <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-blue-800 transition-colors">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm rounded-lg border border-blue-600/60 text-blue-200 hover:border-yellow-500/50 hover:text-yellow-300 transition-all">
                Sign In
              </Link>
              <Link href="/registration" className="px-5 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold rounded-lg transition-all shadow-md shadow-yellow-500/20">
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-blue-200 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-blue-950/98 border-t border-blue-800/40 px-5 py-4 space-y-2">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === href ? "bg-yellow-500/15 text-yellow-400" : "text-blue-200 hover:bg-blue-800/50"
              }`}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-blue-800/40 flex gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm bg-blue-800/50 rounded-lg text-white">Profile</Link>
                <Link href="/report" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm bg-blue-800/50 rounded-lg text-white">Reports</Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="flex-1 py-2 text-sm bg-red-500/20 rounded-lg text-red-400">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm border border-blue-600/60 rounded-lg text-blue-200">Sign In</Link>
                <Link href="/registration" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm bg-yellow-500 rounded-lg text-blue-950 font-bold">Join Now</Link>
              </>
            )}
          </div>
        </div>
      )}
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </nav>
  );
}


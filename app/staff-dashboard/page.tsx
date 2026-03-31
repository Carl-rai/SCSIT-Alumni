"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Users, Calendar, Search, FileText, BookOpen, Zap, Activity, UserCircle, Bell, UserPlus, CalendarCheck, X, CheckCheck, Trash2 } from "lucide-react";
import StaffSidebar from "../components/staff-sidebar";
import { apiUrl } from "@/lib/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const STORAGE_KEY = "staff_notif_state";

function loadNotifState(): { readIds: string[]; deletedIds: string[] } {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return { readIds: [], deletedIds: [] }; }
}
function saveNotifState(state: { readIds: string[]; deletedIds: string[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function StaffDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [totalJobs, setTotalJobs] = useState<number | null>(null);
  const [now, setNow] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [newEventRegs, setNewEventRegs] = useState<any[]>([]);
  const [newReports, setNewReports] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    if (role !== "staff") { router.push("/"); return; }
    setUserName(name || "Staff");
    const saved = loadNotifState();
    setReadIds(new Set(saved.readIds || []));
    setDeletedIds(new Set(saved.deletedIds || []));
    fetchCounts();
    fetchNotifications();
    const interval = setInterval(fetchCounts, 10000);
    const notifInterval = setInterval(fetchNotifications, 30000);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(notifInterval); clearInterval(clock); };
  }, [router]);

  const fetchCounts = async () => {
    try {
      const [usersRes, eventsRes, jobsRes] = await Promise.all([
        fetch(apiUrl("/api/users/")),
        fetch(apiUrl("/api/events/")),
        fetch(apiUrl("/api/jobs/")),
      ]);
      const [users, events, jobs] = await Promise.all([
        usersRes.json(), eventsRes.json(), jobsRes.json(),
      ]);
      setTotalUsers(users.length);
      setTotalEvents(events.length);
      setTotalJobs(jobs.length);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(apiUrl("/api/notifications/"));
      const data = await res.json();
      setNewUsers(data.new_users || []);
      setNewEventRegs(data.new_event_regs || []);
      setNewReports(data.new_reports || []);
    } catch {}
  };

  const notifKey = (type: string, id: number) => `${type}_${id}`;

  const markRead = (key: string) => {
    setReadIds(prev => {
      const next = new Set(prev).add(key);
      saveNotifState({ readIds: [...next], deletedIds: [...deletedIds] });
      return next;
    });
  };

  const deleteNotif = (key: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDeletedIds(prev => {
      const next = new Set(prev).add(key);
      saveNotifState({ readIds: [...readIds], deletedIds: [...next] });
      return next;
    });
  };

  const markAllRead = () => {
    const allKeys = [
      ...newUsers.map(u => notifKey("user", u.id)),
      ...newEventRegs.map(r => notifKey("event", r.id)),
      ...newReports.map(r => notifKey("report", r.id)),
    ];
    const next = new Set([...readIds, ...allKeys]);
    setReadIds(next);
    saveNotifState({ readIds: [...next], deletedIds: [...deletedIds] });
  };

  const deleteAll = () => {
    const allKeys = [
      ...newUsers.map(u => notifKey("user", u.id)),
      ...newEventRegs.map(r => notifKey("event", r.id)),
      ...newReports.map(r => notifKey("report", r.id)),
    ];
    const next = new Set([...deletedIds, ...allKeys]);
    setDeletedIds(next);
    saveNotifState({ readIds: [...readIds], deletedIds: [...next] });
  };

  const visibleUsers = newUsers.filter(u => !deletedIds.has(notifKey("user", u.id)));
  const visibleEventRegs = newEventRegs.filter(r => !deletedIds.has(notifKey("event", r.id)));
  const visibleReports = newReports.filter(r => !deletedIds.has(notifKey("report", r.id)));
  const unreadCount = [
    ...visibleUsers.filter(u => !readIds.has(notifKey("user", u.id))),
    ...visibleEventRegs.filter(r => !readIds.has(notifKey("event", r.id))),
    ...visibleReports.filter(r => !readIds.has(notifKey("report", r.id))),
  ].length;
  const totalVisible = visibleUsers.length + visibleEventRegs.length + visibleReports.length;

  const handleBellClick = () => setShowNotif(v => !v);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const stats = [
    { label: "Total Alumni", value: totalUsers, icon: Users, href: "/staff-dashboard/staff-usermanage", gradient: "from-blue-500/20 via-blue-600/10 to-transparent", border: "border-blue-500/30", iconBg: "bg-blue-500/15", iconColor: "text-blue-400", glow: "shadow-blue-500/10" },
    { label: "Total Events", value: totalEvents, icon: Calendar, href: "/staff-dashboard/view-eventstaff", gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent", border: "border-emerald-500/30", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", glow: "shadow-emerald-500/10" },
    { label: "Job Postings", value: totalJobs, icon: Search, href: "/staff-dashboard/view-jobstaff", gradient: "from-yellow-500/20 via-yellow-600/10 to-transparent", border: "border-yellow-500/30", iconBg: "bg-yellow-500/15", iconColor: "text-yellow-400", glow: "shadow-yellow-500/10" },
  ];

  const quickLinks = [
    { href: "/staff-dashboard/staff-usermanage", label: "Alumni Management", icon: Users, desc: "View and manage alumni records", accent: "blue" },
    { href: "/staff-dashboard/view-eventstaff", label: "Events", icon: Calendar, desc: "Manage events and activities", accent: "emerald" },
    { href: "/staff-dashboard/view-jobstaff", label: "Career & Jobs", icon: Search, desc: "Manage job postings", accent: "yellow" },
    { href: "/staff-dashboard/alumni-records", label: "Alumni Records", icon: BookOpen, desc: "Manage alumni student records", accent: "cyan" },
    { href: "/staff-dashboard/staffreport-view", label: "Rejected Reports", icon: FileText, desc: "View rejected alumni accounts", accent: "red" },
    { href: "/staff-dashboard/staff-profile", label: "My Profile", icon: UserCircle, desc: "View and update your profile", accent: "purple" },
  ];

  const accentMap: Record<string, string> = {
    blue: "group-hover:border-blue-500/40 group-hover:bg-blue-900/20",
    emerald: "group-hover:border-emerald-500/40 group-hover:bg-emerald-900/20",
    yellow: "group-hover:border-yellow-500/40 group-hover:bg-yellow-900/20",
    cyan: "group-hover:border-cyan-500/40 group-hover:bg-cyan-900/20",
    red: "group-hover:border-red-500/40 group-hover:bg-red-900/20",
    purple: "group-hover:border-purple-500/40 group-hover:bg-purple-900/20",
  };
  const iconAccentMap: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20 group-hover:bg-yellow-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:bg-cyan-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20",
  };

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 flex">
      <StaffSidebar />

      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-14 lg:top-0 z-30 bg-[#020d1f]/90 backdrop-blur-md border-b border-blue-800/40 px-4 lg:px-8 py-4 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <h1 className="text-xl font-bold text-white">Staff Dashboard</h1>
            <p className="text-blue-400 text-sm">{getGreeting()}, <span className="text-yellow-400 font-medium">{userName}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white text-sm font-mono font-bold">{now.toLocaleTimeString()}</p>
              <p className="text-blue-400 text-xs">{now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={handleBellClick}
                className="relative p-2.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/40 rounded-xl transition-all">
                <Bell size={18} className={unreadCount > 0 ? "text-yellow-400" : "text-blue-400"} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-12 w-80 bg-[#0a1628] border border-blue-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-blue-800/50">
                    <span className="text-white font-bold text-sm">Notifications {totalVisible > 0 && <span className="text-blue-400 font-normal">({totalVisible})</span>}</span>
                    <button onClick={() => setShowNotif(false)}><X size={14} className="text-gray-400 hover:text-white" /></button>
                  </div>

                  {/* Action bar */}
                  {totalVisible > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/60 border-b border-blue-900/40">
                      <button onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-white transition-colors">
                        <CheckCheck size={12} /> Mark all read
                      </button>
                      <span className="text-blue-800">|</span>
                      <button onClick={deleteAll}
                        className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={12} /> Delete all
                      </button>
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto">
                    {totalVisible === 0 && (
                      <p className="text-blue-400 text-xs text-center py-6">No notifications</p>
                    )}

                    {visibleUsers.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-blue-900/30 flex items-center gap-2">
                          <UserPlus size={13} className="text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-semibold">New Registrations ({visibleUsers.length})</span>
                        </div>
                        {visibleUsers.map((u) => {
                          const key = notifKey("user", u.id);
                          const isRead = readIds.has(key);
                          return (
                            <Link key={u.id} href="/staff-dashboard/staff-usermanage"
                              onClick={() => { markRead(key); setShowNotif(false); }}
                              className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-900/30 transition-colors border-b border-blue-900/30 group/item ${
                                isRead ? "opacity-50" : ""
                              }`}>
                              <div className="relative w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <UserPlus size={13} className="text-yellow-400" />
                                {!isRead && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-medium truncate">{u.first_name} {u.last_name}</p>
                                <p className="text-blue-400 text-[11px] truncate">{u.email}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">{new Date(u.created_at).toLocaleString()}</p>
                              </div>
                              <button onClick={(e) => deleteNotif(key, e)}
                                className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all shrink-0">
                                <X size={11} className="text-red-400" />
                              </button>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {visibleEventRegs.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-blue-900/30 flex items-center gap-2">
                          <CalendarCheck size={13} className="text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-semibold">New Event Sign-ups ({visibleEventRegs.length})</span>
                        </div>
                        {visibleEventRegs.map((r) => {
                          const key = notifKey("event", r.id);
                          const isRead = readIds.has(key);
                          return (
                            <Link key={r.id} href="/staff-dashboard/view-eventstaff"
                              onClick={() => { markRead(key); setShowNotif(false); }}
                              className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-900/30 transition-colors border-b border-blue-900/30 group/item ${
                                isRead ? "opacity-50" : ""
                              }`}>
                              <div className="relative w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <CalendarCheck size={13} className="text-emerald-400" />
                                {!isRead && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-medium truncate">{r.user__first_name} {r.user__last_name}</p>
                                <p className="text-blue-400 text-[11px] truncate">Joined: {r.event__title}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">{new Date(r.registration_date).toLocaleString()}</p>
                              </div>
                              <button onClick={(e) => deleteNotif(key, e)}
                                className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all shrink-0">
                                <X size={11} className="text-red-400" />
                              </button>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                    {visibleReports.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-blue-900/30 flex items-center gap-2">
                          <FileText size={13} className="text-red-400" />
                          <span className="text-red-400 text-xs font-semibold">New Reports ({visibleReports.length})</span>
                        </div>
                        {visibleReports.map((r) => {
                          const key = notifKey("report", r.id);
                          const isRead = readIds.has(key);
                          return (
                            <Link key={r.id} href="/staff-dashboard/staffreport-view"
                              onClick={() => { markRead(key); setShowNotif(false); }}
                              className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-900/30 transition-colors border-b border-blue-900/30 group/item ${
                                isRead ? "opacity-50" : ""
                              }`}>
                              <div className="relative w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <FileText size={13} className="text-red-400" />
                                {!isRead && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-medium truncate">{r.name}</p>
                                <p className="text-blue-400 text-[11px] truncate">{r.email}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5 truncate">{r.message}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">{new Date(r.created_at).toLocaleString()}</p>
                              </div>
                              <button onClick={(e) => deleteNotif(key, e)}
                                className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all shrink-0">
                                <X size={11} className="text-red-400" />
                              </button>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    <div className="px-4 py-2 border-t border-blue-800/50 text-center">
                      <span className="text-blue-500 text-[11px]">Last 24 hours only</span>
                    </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {/* Hero greeting */}
          <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-blue-900/20 to-transparent border border-blue-500/15 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.06),transparent_60%)]" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium mb-1 flex items-center gap-2">
                  <Zap size={14} /> SCSIT Alumni â€” Staff Panel
                </p>
                <h2 className="text-2xl font-bold text-white">Welcome back, {userName}!</h2>
                <p className="text-blue-300 text-sm mt-1">Manage alumni records, events, and job postings from here.</p>
              </div>
              <Activity size={48} className="text-blue-400/20" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {stats.map(({ label, value, icon: Icon, href, gradient, border, iconBg, iconColor, glow }) => (
              <Link key={href} href={href}
                className={`relative bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-6 hover:-translate-y-1.5 transition-all group overflow-hidden shadow-lg ${glow}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                <div className={`inline-flex p-2.5 rounded-xl ${iconBg} mb-4 ${iconColor} border border-white/10`}>
                  <Icon size={22} />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1 tabular-nums">
                  {value !== null ? value.toLocaleString() : <span className="text-gray-600">â€”</span>}
                </div>
                <div className="text-sm text-blue-300">{label}</div>
                <div className="absolute bottom-3 right-4 text-xs text-white/20 font-medium">â†’</div>
              </Link>
            ))}
          </div>

          {/* Quick Access */}
          <div>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-yellow-400 rounded-full inline-block" />
              Quick Access
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quickLinks.map(({ href, label, icon: Icon, desc, accent }) => (
                <Link key={href} href={href}
                  className={`group bg-blue-900/20 border border-blue-800/40 rounded-2xl p-6 transition-all hover:-translate-y-1 ${accentMap[accent]}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border transition-colors ${iconAccentMap[accent]}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{label}</h3>
                      <p className="text-blue-400 text-sm">{desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


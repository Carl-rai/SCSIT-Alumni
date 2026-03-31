"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import { FileText, Clock, CheckCircle, MessageCircle, ChevronRight, Inbox, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";

type ReportType = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  has_reply: boolean;
  reply: string | null;
  replied_at: string | null;
  is_read_by_user: boolean;
};

export default function ReportPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReportType | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("accessToken");
    if (!token || !email) { router.push("/login"); return; }
    setUserEmail(email);
    fetchReports(email);
  }, [router]);

  const fetchReports = async (email: string) => {
    try {
      const res = await fetch(apiUrl(`/api/reports/by-email/?email=${encodeURIComponent(email)}`));
      const data = await res.json();
      setReports(data);
    } catch {
      console.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const openReport = async (report: ReportType) => {
    setSelected(report);
    if (report.has_reply && !report.is_read_by_user) {
      try {
        await fetch(apiUrl(`/api/reports/${report.id}/mark-read/`), { method: "POST" });
        setReports(prev => prev.map(r => r.id === report.id ? { ...r, is_read_by_user: true } : r));
        setSelected({ ...report, is_read_by_user: true });
      } catch {}
    }
  };

  const unreadCount = reports.filter(r => r.has_reply && !r.is_read_by_user).length;
  const repliedCount = reports.filter(r => r.has_reply).length;
  const pendingCount = reports.filter(r => !r.has_reply).length;

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 relative overflow-x-hidden">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-yellow-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-purple-600/6 rounded-full blur-[90px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* â”€â”€ Hero Header â”€â”€ */}
        <div className="relative mb-10 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#0a1628] to-[#060f1e]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.10),transparent_55%)]" />

          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/15 border border-yellow-500/25 rounded-full text-yellow-400 text-xs font-semibold">
                  <Sparkles size={11} /> My Reports
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Submitted<br />
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">Reports & Inquiries</span>
              </h1>
              <p className="text-blue-400 text-sm mt-2">Track your messages and replies from our team.</p>
            </div>

            {/* Stats pills */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <CheckCircle size={14} className="text-emerald-400" />
                <div>
                  <p className="text-emerald-400 font-bold text-lg leading-none">{repliedCount}</p>
                  <p className="text-emerald-500/70 text-[10px] leading-none mt-0.5">Replied</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <Clock size={14} className="text-blue-400" />
                <div>
                  <p className="text-blue-400 font-bold text-lg leading-none">{pendingCount}</p>
                  <p className="text-blue-500/70 text-[10px] leading-none mt-0.5">Pending</p>
                </div>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/15 border border-yellow-500/30 rounded-2xl animate-pulse">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <div>
                    <p className="text-yellow-400 font-bold text-lg leading-none">{unreadCount}</p>
                    <p className="text-yellow-500/70 text-[10px] leading-none mt-0.5">New</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* â”€â”€ Content â”€â”€ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-yellow-400 animate-spin" />
            </div>
            <p className="text-blue-400 text-sm animate-pulse">Loading your reportsâ€¦</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-900/30 border border-blue-800/40 flex items-center justify-center mb-2">
              <Inbox size={36} className="text-blue-600 opacity-60" />
            </div>
            <p className="text-white font-semibold text-lg">No reports yet</p>
            <p className="text-blue-400 text-sm max-w-xs">Use the chat button at the bottom right to send a report or inquiry.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-yellow-500/30 via-blue-500/20 to-transparent" />

            <div className="space-y-4 pl-14">
              {reports.map((report, idx) => {
                const isUnread = report.has_reply && !report.is_read_by_user;
                return (
                  <div key={report.id} className="relative group">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[2.35rem] top-5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                      ${isUnread
                        ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_10px_rgba(234,179,8,0.4)]"
                        : report.has_reply
                          ? "border-emerald-400 bg-emerald-400/10"
                          : "border-blue-600 bg-blue-900/40"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isUnread ? "bg-yellow-400 animate-pulse" : report.has_reply ? "bg-emerald-400" : "bg-blue-500"}`} />
                    </div>

                    <button
                      onClick={() => openReport(report)}
                      className={`w-full text-left relative rounded-2xl border p-5 transition-all duration-200
                        group-hover:-translate-y-0.5 group-hover:shadow-xl
                        ${isUnread
                          ? "bg-gradient-to-r from-yellow-500/8 to-blue-900/20 border-yellow-500/30 shadow-yellow-500/5 shadow-lg"
                          : "bg-gradient-to-r from-blue-900/15 to-transparent border-blue-800/30 hover:border-blue-700/50 hover:bg-blue-900/25"
                        }`}
                    >
                      {/* Report number badge */}
                      <span className="absolute top-4 right-4 text-[10px] text-blue-600 font-mono">#{String(idx + 1).padStart(2, "0")}</span>

                      <p className="text-white font-medium text-sm leading-relaxed line-clamp-2 pr-8 mb-3">{report.message}</p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-blue-500 text-xs">
                          <Clock size={10} />
                          {new Date(report.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>

                        {report.has_reply ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                            <CheckCircle size={9} />
                            {report.is_read_by_user ? "Replied" : "New Reply!"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs">
                            <MessageCircle size={9} /> Awaiting reply
                          </span>
                        )}

                        <span className="ml-auto flex items-center gap-1 text-blue-600 text-xs group-hover:text-blue-400 transition-colors">
                          View <ChevronRight size={12} />
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* â”€â”€ Modal â”€â”€ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0d1f3c] to-[#060f1e] border border-blue-700/40 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Modal top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500" />

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-blue-800/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <FileText size={16} className="text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Report Details</h3>
                  <p className="text-blue-500 text-xs flex items-center gap-1">
                    <Clock size={9} /> {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-900/40 hover:bg-blue-800/60 text-blue-400 hover:text-white transition-all text-sm">
                âœ•
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Your message */}
              <div className="rounded-2xl bg-blue-900/25 border border-blue-800/40 p-4">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MessageCircle size={10} /> Your Message
                </p>
                <p className="text-blue-100 text-sm leading-relaxed">{selected.message}</p>
              </div>

              {/* Reply */}
              {selected.has_reply && selected.reply ? (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 border border-emerald-500/25 p-4">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <CheckCircle size={10} /> Reply from Admin/Staff
                    {selected.replied_at && (
                      <span className="ml-auto font-normal normal-case text-emerald-600 text-[10px]">
                        {new Date(selected.replied_at).toLocaleString()}
                      </span>
                    )}
                  </p>
                  <p className="text-emerald-100 text-sm leading-relaxed">{selected.reply}</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-blue-900/15 border border-blue-800/30 p-5 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-blue-900/40 border border-blue-800/40 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle size={18} className="text-blue-600 opacity-60" />
                  </div>
                  <p className="text-blue-400 text-sm font-medium">No reply yet</p>
                  <p className="text-blue-600 text-xs mt-1">We'll get back to you soon.</p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-blue-800/40">
              <button
                onClick={() => setSelected(null)}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-blue-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


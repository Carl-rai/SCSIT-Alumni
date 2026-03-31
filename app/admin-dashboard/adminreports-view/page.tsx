"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, Eye, X, Mail, User, Clock, Send, CheckCircle, Trash2 } from "lucide-react";
import AdminSidebar from "../../components/admin-sidebar";
import { apiUrl } from "@/lib/api";

type ReportType = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_registered_user: boolean;
  has_reply: boolean;
  reply: string | null;
  replied_at: string | null;
  is_read_by_user: boolean;
};

export default function AdminReportsView() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportType[]>([]);
  const [filtered, setFiltered] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ReportType | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") { router.push("/"); return; }
    fetchReports();
  }, [router]);

  const fetchReports = async () => {
    try {
      const res = await fetch(apiUrl("/api/reports/"));
      const data = await res.json();
      setReports(data);
      setFiltered(data);
    } catch (error) {
      console.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setFiltered(reports.filter(r =>
      r.name.toLowerCase().includes(value.toLowerCase()) ||
      r.email.toLowerCase().includes(value.toLowerCase()) ||
      r.message.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(apiUrl(`/api/reports/${id}/`), { method: 'DELETE' });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
        setFiltered(prev => prev.filter(r => r.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch { console.error('Failed to delete report'); }
  };

  const openReport = (report: ReportType) => {
    setSelected(report);
    setReplyText(report.reply || "");
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(apiUrl(`/api/reports/${selected.id}/reply/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      if (res.ok) {
        await fetchReports();
        setSelected(prev => prev ? { ...prev, reply: replyText, has_reply: true, is_read_by_user: false } : null);
      }
    } catch (error) {
      console.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 flex">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-14 lg:top-0 z-30 bg-[#020d1f]/90 backdrop-blur-md border-b border-blue-800/40 px-4 lg:px-8 py-4 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <h1 className="text-xl font-bold text-white">Reports</h1>
            <p className="text-blue-400 text-sm">View and reply to submitted reports</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
            <FileText size={14} className="text-red-400" />
            <span className="text-xs text-red-400 font-medium">{reports.length} Total</span>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {/* Hero */}
          <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 via-blue-900/20 to-transparent border border-red-500/15 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(239,68,68,0.06),transparent_60%)]" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium mb-1 flex items-center gap-2">
                  <FileText size={14} /> User Reports & Feedback
                </p>
                <h2 className="text-2xl font-bold text-white">All Reports</h2>
                <p className="text-blue-300 text-sm mt-1">Reply to registered users (in-app) or guests (via email).</p>
              </div>
              <FileText size={48} className="text-red-400/20" />
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-blue-900/30 border border-blue-800/40 rounded-xl text-white placeholder-blue-400 focus:outline-none focus:border-yellow-400/50 transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-blue-400">
              <FileText size={48} className="mx-auto mb-4 opacity-30" />
              <p>No reports found.</p>
            </div>
          ) : (
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-800/40 bg-blue-900/40">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-800/30">
                    {filtered.map((report, index) => (
                      <tr key={report.id} className="hover:bg-blue-900/30 transition-colors">
                        <td className="px-6 py-4 text-blue-400 text-sm">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                              <User size={14} className="text-yellow-400" />
                            </div>
                            <div>
                              <span className="font-medium text-white">{report.name}</span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                report.is_registered_user
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {report.is_registered_user ? 'Registered' : 'Guest'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-blue-300 text-sm">{report.email}</td>
                        <td className="px-6 py-4 text-blue-300 text-sm max-w-xs truncate">{report.message}</td>
                        <td className="px-6 py-4">
                          {report.has_reply ? (
                            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
                              <CheckCircle size={11} /> Replied
                              {report.is_registered_user && !report.is_read_by_user && (
                                <span className="ml-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                              )}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-blue-400 text-xs">
                            <Clock size={12} />
                            {new Date(report.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openReport(report)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium transition-all"
                            >
                              <Eye size={13} /> View
                            </button>
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-all"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-blue-700/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <User size={20} className="text-yellow-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      selected.is_registered_user
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {selected.is_registered_user ? 'Registered User' : 'Guest'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400 text-sm mt-0.5">
                    <Mail size={12} /> {selected.email}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-blue-800/60 rounded-xl transition-colors">
                <X size={18} className="text-blue-400" />
              </button>
            </div>

            <div className="flex items-center gap-1 text-blue-500 text-xs mb-3">
              <Clock size={11} /> {new Date(selected.created_at).toLocaleString()}
            </div>

            {/* Message */}
            <div className="bg-blue-900/30 border border-blue-800/40 rounded-xl p-4 mb-4">
              <p className="text-xs text-blue-400 mb-2 font-semibold uppercase tracking-wider">Message</p>
              <p className="text-blue-200 leading-relaxed">{selected.message}</p>
            </div>

            {/* Existing reply */}
            {selected.reply && (
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-emerald-400 mb-2 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle size={11} /> Previous Reply Â· {selected.replied_at ? new Date(selected.replied_at).toLocaleString() : ''}
                </p>
                <p className="text-emerald-200 leading-relaxed text-sm">{selected.reply}</p>
                {selected.is_registered_user && (
                  <p className="text-xs mt-2 text-emerald-500">
                    {selected.is_read_by_user ? 'âœ“ Seen by user' : 'â³ Not yet seen by user'}
                  </p>
                )}
                {!selected.is_registered_user && (
                  <p className="text-xs mt-2 text-blue-400">ðŸ“§ Sent to {selected.email}</p>
                )}
              </div>
            )}

            {/* Reply box */}
            <div>
              <p className="text-xs text-blue-400 mb-2 font-semibold uppercase tracking-wider">
                {selected.reply ? 'Update Reply' : 'Write a Reply'}
                {!selected.is_registered_user && <span className="ml-2 text-yellow-400 normal-case font-normal">(will be sent via email)</span>}
                {selected.is_registered_user && <span className="ml-2 text-emerald-400 normal-case font-normal">(will appear in user's report page)</span>}
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder="Type your reply here..."
                className="w-full px-4 py-3 bg-blue-900/30 border border-blue-800/40 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-yellow-400/50 resize-none text-sm"
              />
              <button
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                <Send size={16} />
                {sending ? 'Sending...' : selected.reply ? 'Update Reply' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


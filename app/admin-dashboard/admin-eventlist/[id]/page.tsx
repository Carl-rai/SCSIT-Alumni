"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { Users, Search } from "lucide-react";
import { apiUrl } from "@/lib/api";

type RegistrantType = {
  id: number;
  guest_count: number;
  registration_date: string;
  status: string;
  remarks: string;
  user_details: { id: number; email: string; first_name: string; last_name: string; alumni_id: string };
  event_details: { id: number; title: string; date: string; start_time: string; location: string };
};

const fmtTime = (t: string) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

export default function AdminEventListPage() {
  const router = useRouter();
  const { id } = useParams();
  const [registrants, setRegistrants] = useState<RegistrantType[]>([]);
  const [filtered, setFiltered] = useState<RegistrantType[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin" && role !== "staff") { router.push("/"); return; }
    fetchRegistrants();
  }, []);

  const fetchRegistrants = async () => {
    try {
      const res = await fetch(apiUrl(`/api/event-registrations/event_registrations/?event_id=${id}`));
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setRegistrants(list);
      setFiltered(list);
      if (list.length > 0) setEventTitle(list[0].event_details?.title || "");
    } catch { console.error("Failed to fetch registrants"); }
    finally { setLoading(false); }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFiltered(registrants.filter(r =>
      r.user_details?.alumni_id?.toLowerCase().includes(value.toLowerCase()) ||
      `${r.user_details?.first_name} ${r.user_details?.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
      r.user_details?.email?.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const statusColor = (s: string) =>
    s === "confirmed" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
    s === "cancelled" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Users size={22} className="text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Registered <span className="text-yellow-400">Alumni</span></h1>
          </div>
          {eventTitle && (
            <p className="text-gray-400 ml-12">Event: <span className="text-white font-medium">{eventTitle}</span></p>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Alumni ID, Name, or Email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No registered alumni for this event.</div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/8 bg-white/3">
              <span className="text-sm text-gray-400">Total: <span className="text-yellow-400 font-semibold">{filtered.length}</span> registrants</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/5">
                    {["#","Alumni ID","Name","Email","Guests","Remarks","Registered On","Status"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-500">{i + 1}</td>
                      <td className="px-5 py-4 text-sm font-mono">
                        {r.user_details?.alumni_id || <span className="text-red-400 italic text-xs">missing</span>}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium">{r.user_details?.first_name} {r.user_details?.last_name}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{r.user_details?.email}</td>
                      <td className="px-5 py-4 text-sm text-center text-gray-400">{r.guest_count}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{r.remarks || <span className="text-gray-600 italic">none</span>}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{new Date(r.registration_date).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
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
  );
}


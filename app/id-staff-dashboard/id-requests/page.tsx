"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IdStaffSidebar from "@/app/components/id-staff-sidebar";
import { IdCard, Download, CheckCircle, RefreshCw, Upload } from "lucide-react";
import { apiUrl } from "@/lib/api";
import {
  buildIdRequestExportEmailPayload,
  buildIdRequestReadyEmailPayload,
  type IDRequestEmailSource,
  sendBackendEmailPayload,
} from "@/lib/send-backend-email";

type IDRequestItem = {
  id: number;
  user_id: number;
  alumni_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  course: string;
  year_graduate: number;
  gender: string;
  note: string;
  status: string;
  created_at: string;
};

export default function IdStaffRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<IDRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [markingDone, setMarkingDone] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "id-staff") { router.push("/"); return; }
    fetchRequests();
  }, [router, statusFilter]);

  const getToken = () => localStorage.getItem("accessToken") || "";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/id-requests/?status=${statusFilter}`), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setRequests(await res.json());
    } catch { console.error("Failed to fetch ID requests"); }
    finally { setLoading(false); }
  };

  const handleExport = () => {
    const exportedRequests = [...requests];
    fetch(apiUrl(`/api/id-requests/export/?status=${statusFilter}`), {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `id_requests_${statusFilter}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        if (statusFilter === "pending") {
          Promise.allSettled(
            exportedRequests.map((req) =>
              sendBackendEmailPayload(buildIdRequestExportEmailPayload(req))
            )
          ).catch(() => {});
        }
        setTimeout(fetchRequests, 500);
      });
  };

  const handleImport = async () => {
    if (!importFile) {
      alert("Please choose a CSV file to import.");
      return;
    }

    const formData = new FormData();
    formData.append("csv_file", importFile);

    setImporting(true);
    try {
      const res = await fetch(apiUrl("/api/id-requests/import/"), {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Failed to import CSV.");
        return;
      }

      await Promise.allSettled(
        (data.updated_requests || []).map((req: IDRequestEmailSource) =>
          sendBackendEmailPayload(buildIdRequestReadyEmailPayload(req))
        )
      );

      alert(
        `Imported successfully. Updated: ${data.updated_count || 0}, skipped: ${data.skipped_count || 0}, missing: ${data.missing_count || 0}`
      );
      setImportFile(null);
      await fetchRequests();
    } catch {
      alert("Server connection failed.");
    } finally {
      setImporting(false);
    }
  };

  const handleMarkDone = async (id: number) => {
    setMarkingDone(id);
    try {
      const res = await fetch(apiUrl(`/api/id-requests/${id}/status/`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: "done" }),
      });
      if (res.ok) fetchRequests();
      else alert("Failed to update status.");
    } catch { alert("Server connection failed."); }
    finally { setMarkingDone(null); }
  };

  const showActions = statusFilter === "pending";

  const statusBadge = (s: string) => {
    if (s === "pending") return "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";
    if (s === "exported") return "bg-blue-500/15 border-blue-500/30 text-blue-300";
    return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
  };

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <IdStaffSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <IdCard size={22} className="text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">ID Card <span className="text-cyan-400">Requests</span></h1>
          </div>
          <p className="text-gray-400 ml-12">View and export alumni ID card requests</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="pending">Pending</option>
            <option value="exported">Exported</option>
            <option value="done">Done</option>
          </select>

          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={requests.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-blue-950 font-bold rounded-xl text-sm transition-all"
          >
            <Download size={14} /> Export CSV
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-[220px] text-xs text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
            />
            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-blue-950 font-bold rounded-xl text-sm transition-all"
            >
              <Upload size={14} /> {importing ? "Importing..." : "Import CSV"}
            </button>
          </div>
          <p className="w-full text-xs text-gray-500">
            Import only CSV files where the Status column is set to <span className="text-emerald-300">done</span> for every row.
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No {statusFilter} ID requests found.</div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/5">
                    {["Alumni ID", "Name", "Email", "Course", "Year", "Gender", "Note", "Status", "Requested"].concat(showActions ? ["Actions"] : []).map((h) => (
                      <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono">{r.alumni_id || <span className="text-gray-500 italic">—</span>}</td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                        {r.first_name} {r.middle_name ? `${r.middle_name} ` : ""}{r.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{r.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{r.course}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{r.year_graduate}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{r.gender}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-[150px] truncate">{r.note || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${statusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      {showActions && (
                        <td className="px-4 py-3">
                          {r.status !== "done" && (
                          <button
                            onClick={() => handleMarkDone(r.id)}
                            disabled={markingDone === r.id}
                            title="Mark as Done"
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-lg transition-all disabled:opacity-50"
                          >
                            <CheckCircle size={13} />
                          </button>
                          )}
                        </td>
                      )}
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

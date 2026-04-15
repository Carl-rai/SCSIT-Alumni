"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Filter, Search, ShieldAlert, UserCog } from "lucide-react";
import AdminSidebar from "../../components/admin-sidebar";

type AuditLog = {
  id: number;
  actor_email: string | null;
  actor_name: string | null;
  actor_role: string;
  action: string;
  method: string;
  path: string;
  resource: string | null;
  resource_id: string | null;
  success: boolean;
  status_code: number | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

const roleStyles: Record<string, string> = {
  admin: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  staff: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  "id-staff": "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  user: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  anonymous: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  system: "border-purple-500/30 bg-purple-500/10 text-purple-300",
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/");
      return;
    }
    fetchLogs();
  }, [router]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      const res = await fetch("/api/audit-logs/?limit=250", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesRole = roleFilter === "all" || log.actor_role === roleFilter;
      if (!matchesRole) return false;
      if (!q) return true;
      return [
        log.actor_email,
        log.actor_name,
        log.actor_role,
        log.action,
        log.method,
        log.path,
        log.resource,
        log.resource_id,
        JSON.stringify(log.details || {}),
      ].some((value) => String(value ?? "").toLowerCase().includes(q));
    });
  }, [logs, search, roleFilter]);

  const successCount = logs.filter((log) => log.success).length;
  const failedCount = logs.length - successCount;

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 flex">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-14 lg:top-0 z-30 bg-[#020d1f]/90 backdrop-blur-md border-b border-blue-800/40 px-4 lg:px-8 py-4 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <h1 className="text-xl font-bold text-white">Audit Logs</h1>
            <p className="text-blue-400 text-sm">Track actions performed by admin, staff, and id-staff</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <ShieldAlert size={14} className="text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">{logs.length} Events</span>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-blue-900/20 to-transparent border border-yellow-500/15 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.06),transparent_60%)]" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium mb-1 flex items-center gap-2">
                  <Activity size={14} /> System activity overview
                </p>
                <h2 className="text-2xl font-bold text-white">Audit trail for privileged users</h2>
                <p className="text-blue-300 text-sm mt-1">Search, filter, and review recorded actions from the app.</p>
              </div>
              <Clock3 size={48} className="text-yellow-400/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-blue-300">Total logs</p>
              <p className="mt-2 text-2xl font-bold text-white">{logs.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-emerald-300">Successful</p>
              <p className="mt-2 text-2xl font-bold text-white">{successCount}</p>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-red-300">Failed</p>
              <p className="mt-2 text-2xl font-bold text-white">{failedCount}</p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email, role, action, path, or details..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-gray-500 transition-colors focus:border-yellow-500/50 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white transition-colors focus:border-yellow-500/50 focus:outline-none"
              >
                <option value="all" className="bg-blue-950">All roles</option>
                <option value="admin" className="bg-blue-950">Admin</option>
                <option value="staff" className="bg-blue-950">Staff</option>
                <option value="id-staff" className="bg-blue-950">ID Staff</option>
                <option value="user" className="bg-blue-950">User</option>
                <option value="anonymous" className="bg-blue-950">Anonymous</option>
                <option value="system" className="bg-blue-950">System</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-blue-400 rounded-2xl border border-white/10 bg-white/5">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-30" />
              <p>No audit logs found.</p>
            </div>
          ) : (
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-800/40 bg-blue-900/40">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">When</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Actor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Path</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-800/30">
                    {filtered.map((log) => (
                      <tr key={log.id} className="hover:bg-blue-900/30 transition-colors align-top">
                        <td className="px-6 py-4 text-blue-400 text-xs whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                              <UserCog size={14} className="text-yellow-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">{log.actor_name || "Unknown"}</p>
                              <p className="text-blue-400 text-xs">{log.actor_email || "No email"}</p>
                              <p className="text-gray-500 text-[10px] mt-1">{log.ip_address || "Unknown IP"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${roleStyles[log.actor_role] || roleStyles.anonymous}`}>
                            {log.actor_role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-white">{log.action}</div>
                          <div className="text-xs text-blue-300">{log.method}</div>
                          <div className="text-[10px] text-gray-500 mt-1">{log.resource || "resource"} {log.resource_id ? `#${log.resource_id}` : ""}</div>
                        </td>
                        <td className="px-6 py-4 text-blue-300 text-xs max-w-xs break-all">{log.path}</td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            log.success
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border border-red-500/30 bg-red-500/10 text-red-300"
                          }`}>
                            {log.success ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            {log.status_code ?? (log.success ? "OK" : "Error")}
                          </div>
                          <p className="mt-2 max-w-xs text-[11px] text-gray-400 break-all">
                            {JSON.stringify(log.details)}
                          </p>
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
    </div>
  );
}

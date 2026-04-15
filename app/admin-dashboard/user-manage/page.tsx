"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { Search, Users, FileX, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { sendBackendEmailFromResponse } from "@/lib/send-backend-email";
import AlumniCsvUploadButton from "@/app/components/alumni-csv-upload-button";
import UserEditModal from "@/app/components/user-edit-modal";

type UserType = {
  id: number;
  alumni_id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  age: number;
  course: string;
  year_graduate: number;
  status: string;
  profile_image?: string;
};

type AlumniRecordType = {
  alumni_id: string;
  first_name: string;
  year_graduate: number;
  category?: { id: number; name: string } | null;
};

export default function UserManagePage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [alumniRecords, setAlumniRecords] = useState<AlumniRecordType[]>([]);
  const router = useRouter();
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [rejectModal, setRejectModal] = useState<{ show: boolean; userId: number | null }>({ show: false, userId: null });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin" && role !== "staff") { router.push("/"); return; }
    fetchUsers();
    fetchAlumniRecords();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(apiUrl("/api/users/"));
      const data = await res.json().catch(() => []);
      setUsers(Array.isArray(data) ? data : []);
    } catch { console.error("Failed to fetch users"); }
    finally { setLoading(false); }
  };

  const fetchAlumniRecords = async () => {
    try {
      const res = await fetch(apiUrl("/api/alumni-students/"));
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlumniRecords(data);
      }
    } catch {
      console.error("Failed to fetch alumni records");
    }
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const userList = Array.isArray(users) ? users : [];
    setFilteredUsers(
      userList.filter((u) => {
        if (u.id === 1 || u.status === "rejected") return false;
        const matchesSearch =
          u.alumni_id?.toLowerCase().includes(term) ||
          `${u.first_name} ${u.middle_name} ${u.last_name}`.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.course?.toLowerCase().includes(term) ||
          u.year_graduate?.toString().includes(searchTerm);
        const matchesStatus = statusFilter === "all" || u.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    );
  }, [users, searchTerm, statusFilter]);

  const normalize = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

  const hasMatchingAlumniRecord = (user: UserType) =>
    alumniRecords.some((record) =>
      normalize(record.alumni_id) === normalize(user.alumni_id) &&
      normalize(record.category?.name) === normalize(user.course) &&
      String(record.year_graduate || "") === String(user.year_graduate || "")
    );

  const canApproveUser = (user: UserType) => {
    if (!user.alumni_id?.trim()) return { allowed: false, reason: "Alumni ID is required" };
    if (!user.course?.trim()) return { allowed: false, reason: "Course is required" };
    if (!user.year_graduate || user.year_graduate <= 0) return { allowed: false, reason: "Graduation year is required" };
    if (!hasMatchingAlumniRecord(user)) return { allowed: false, reason: "No matching alumni record found" };
    return { allowed: true };
  };

  const handleApprove = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const check = canApproveUser(user);
    if (!check.allowed) { alert(check.reason); return; }
    if (!confirm("Approve this user?")) return;
    try {
      const res = await fetch(apiUrl(`/api/users/${userId}/approve/`), { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        await sendBackendEmailFromResponse(data);
        alert("User approved!");
        fetchUsers();
      } else alert(data.error || "Failed to approve user");
    } catch { alert("Server connection failed"); }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) { alert("Please provide a reason."); return; }
    try {
      const res = await fetch(apiUrl(`/api/users/${rejectModal.userId}/reject/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (res.ok) {
        await sendBackendEmailFromResponse(data);
        alert("User rejected!");
        setRejectModal({ show: false, userId: null });
        fetchUsers();
      } else alert(data.error || "Failed to reject user");
    } catch { alert("Server connection failed"); }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(apiUrl(`/api/users/${userId}/delete/`), { method: "DELETE" });
      if (res.ok) { alert("User deleted!"); fetchUsers(); }
      else alert("Failed to delete user");
    } catch { alert("Server connection failed"); }
  };

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
            <h1 className="text-3xl font-bold text-white">Alumni <span className="text-yellow-400">Management</span></h1>
          </div>
          <p className="text-gray-400 ml-12">Manage and review alumni user accounts</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <AlumniCsvUploadButton showDelete onUploaded={fetchAlumniRecords} />
          <button
            onClick={() => router.push("/admin-dashboard/rejected")}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg transition-all text-sm font-medium"
          >
            <FileX size={15} /> Rejected Records
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Alumni ID, Name, Email, Course, or Year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[180px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-700 focus:outline-none focus:border-yellow-500/50 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No users found.</div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/5">
                    {["Alumni ID","Name","Email","Gender","Age","Course","Year","Actions"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const check = canApproveUser(user);
                    const approveDisabled = user.status === "approved" || !check.allowed;
                    return (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 text-sm font-mono">
                          {user.alumni_id || <span className="text-red-400 italic text-xs">missing</span>}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium">{user.first_name} {user.middle_name} {user.last_name}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.gender}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.age}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.course}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">
                          {user.year_graduate || <span className="text-red-400 italic text-xs">missing</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5">
                            <button onClick={() => setEditUser(user)}
                              className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all" title="Edit">
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={approveDisabled}
                              title={
                                user.status === "approved"
                                  ? "Already approved"
                                  : check.allowed
                                    ? "Approve"
                                    : check.reason
                              }
                              className={`p-1.5 border rounded-lg transition-all ${
                                approveDisabled
                                  ? "bg-white/5 border-white/10 text-gray-600 cursor-not-allowed"
                                  : "bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/30 text-emerald-300"
                              }`}
                            >
                              <CheckCircle size={13} />
                            </button>
                            {user.status === "approved" ? (
                              <button onClick={() => handleDelete(user.id)}
                                className="p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg transition-all" title="Delete">
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <button onClick={() => { setRejectReason(""); setRejectModal({ show: true, userId: user.id }); }}
                                className="p-1.5 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 text-orange-300 rounded-lg transition-all" title="Reject">
                                <XCircle size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <UserEditModal
        open={!!editUser}
        user={editUser}
        alumniRecords={alumniRecords}
        onClose={() => setEditUser(null)}
        onSaved={fetchUsers}
      />

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a1628] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-yellow-400 mb-1">Reject User</h2>
            <p className="text-gray-400 text-sm mb-5">Reason will be sent to the user&apos;s email.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 mb-5 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={handleRejectConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors">
                Confirm Reject
              </button>
              <button onClick={() => setRejectModal({ show: false, userId: null })}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


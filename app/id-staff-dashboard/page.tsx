"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, CheckCircle, AlertCircle, Edit } from "lucide-react";
import { apiUrl } from "@/lib/api";
import IdStaffSidebar from "@/app/components/id-staff-sidebar";
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
};

type AlumniRecordType = {
  alumni_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name?: string;
  year_graduate: number;
  category?: { id: number; name: string } | null;
};

const normalize = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

export default function IdStaffDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [alumniRecords, setAlumniRecords] = useState<AlumniRecordType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserType | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "id-staff") {
      router.push("/");
      return;
    }
    fetchUsers();
    fetchAlumniRecords();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(apiUrl("/api/users/"));
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumniRecords = async () => {
    try {
      const res = await fetch(apiUrl("/api/alumni-students/"));
      const data = await res.json();
      setAlumniRecords(Array.isArray(data) ? data : []);
    } catch {
      setAlumniRecords([]);
    }
  };

  const hasMatchingAlumniRecord = (user: UserType) =>
    alumniRecords.some((record) =>
      normalize(record.alumni_id) === normalize(user.alumni_id) &&
      normalize(record.category?.name) === normalize(user.course) &&
      String(record.year_graduate || "") === String(user.year_graduate || "")
    );

  const visibleUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((user) => {
      if (user.id === 1) return false;
      const matchesSearch =
        user.alumni_id?.toLowerCase().includes(term) ||
        `${user.first_name} ${user.middle_name || ""} ${user.last_name}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.course?.toLowerCase().includes(term) ||
        user.year_graduate?.toString().includes(searchTerm);
      return matchesSearch;
    });
  }, [users, searchTerm]);

  const matchedCount = visibleUsers.filter(hasMatchingAlumniRecord).length;
  const unmatchedCount = visibleUsers.length - matchedCount;

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100">
      <IdStaffSidebar />

      <main className="flex-1 px-4 pb-10 pt-20 lg:ml-64 lg:px-8 lg:pt-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2">
              <Users size={22} className="text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              ID Staff <span className="text-cyan-400">Dashboard</span>
            </h1>
          </div>
          <p className="ml-12 text-gray-400">
            Manage registered alumni IDs and compare them against the uploaded CSV records.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="grid flex-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-500/20 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-blue-300">Total Alumni</p>
              <p className="mt-2 text-2xl font-bold text-white">{visibleUsers.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-emerald-300">Matched IDs</p>
              <p className="mt-2 text-2xl font-bold text-white">{matchedCount}</p>
            </div>
            <div className="rounded-2xl border border-orange-500/20 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-orange-300">Needs Review</p>
              <p className="mt-2 text-2xl font-bold text-white">{unmatchedCount}</p>
            </div>
          </div>

        </div>

        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Alumni ID, name, email, course, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-gray-500 transition-colors focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center text-gray-500">
            No registered alumni found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/5">
                    {["Alumni ID", "Name", "Email", "Course", "Year", "Record", "Action"].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => {
                    const isMatched = hasMatchingAlumniRecord(user);
                    return (
                      <tr key={user.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                        <td className="px-5 py-4 font-mono text-sm">
                          {user.alumni_id || <span className="text-red-400 italic text-xs">missing</span>}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium">
                          {user.first_name} {user.middle_name} {user.last_name}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.course}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.year_graduate || <span className="text-red-400 italic text-xs">missing</span>}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            isMatched
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border border-orange-500/30 bg-orange-500/10 text-orange-300"
                          }`}>
                            {isMatched ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                            {isMatched ? "Matched" : "No Match"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setEditUser(user)}
                            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-600/20 px-3 py-2 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-600/35"
                          >
                            <Edit size={13} />
                            Edit ID
                          </button>
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
        onSaved={() => {
          fetchUsers();
          fetchAlumniRecords();
        }}
      />
    </div>
  );
}

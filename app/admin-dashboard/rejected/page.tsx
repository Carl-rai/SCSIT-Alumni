"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { Search, FileX, Edit } from "lucide-react";
import { apiUrl } from "@/lib/api";

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

export default function RejectedUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filtered, setFiltered] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin" && role !== "staff") { router.push("/"); return; }
    fetchRejected();
  }, [router]);

  const fetchRejected = async () => {
    try {
      const res = await fetch(apiUrl("/api/users/"));
      const data = await res.json();
      const rejected = data.filter((u: UserType) => u.status === "rejected");
      setUsers(rejected);
      setFiltered(rejected);
    } catch { console.error("Failed to fetch users"); }
    finally { setLoading(false); }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFiltered(users.filter(u =>
      u.alumni_id?.toLowerCase().includes(value.toLowerCase()) ||
      `${u.first_name} ${u.middle_name} ${u.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
      u.email.toLowerCase().includes(value.toLowerCase()) ||
      u.course?.toLowerCase().includes(value.toLowerCase())
    ));
  };

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <FileX size={22} className="text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Rejected <span className="text-red-400">Alumni</span></h1>
          </div>
          <p className="text-gray-400 ml-12">Alumni accounts that were rejected during verification</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Alumni ID, Name, Email, or Course..."
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
          <div className="text-center py-16 text-gray-500">No rejected users found.</div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/8 bg-red-500/5">
              <span className="text-sm text-gray-400">Total rejected: <span className="text-red-400 font-semibold">{filtered.length}</span></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/5">
                    {["Alumni ID","Name","Email","Gender","Age","Course","Year","Status","Action"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
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
                        <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-xs font-medium">rejected</span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => router.push(`/admin-dashboard/reject-edit/${user.id}`)}
                          className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all" title="Edit">
                          <Edit size={13} />
                        </button>
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


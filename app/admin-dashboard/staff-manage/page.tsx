"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { Search, UserCog, UserPlus, Edit, Trash2 } from "lucide-react";
import { apiUrl } from "@/lib/api";

type StaffType = {
  id: number;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  age: number;
  position: string;
  status: string;
};

export default function StaffManagePage() {
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") { router.push("/"); return; }
    fetchStaff();
  }, [router]);

  const fetchStaff = async () => {
    try {
      const res = await fetch(apiUrl("/api/staff/"));
      const data = await res.json();
      setStaff(data);
      setFilteredStaff(data);
    } catch { console.error("Failed to fetch staff"); }
    finally { setLoading(false); }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilteredStaff(staff.filter(m =>
      `${m.first_name} ${m.middle_name ?? ""} ${m.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
      m.email.toLowerCase().includes(value.toLowerCase()) ||
      m.position?.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(apiUrl(`/api/staff/${id}/delete/`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { alert("Staff deleted!"); fetchStaff(); }
      else alert("Failed to delete staff");
    } catch { alert("Server connection failed"); }
  };

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <UserCog size={22} className="text-yellow-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Staff <span className="text-yellow-400">Accounts</span></h1>
            </div>
            <p className="text-gray-400 ml-12">Manage staff members and their roles</p>
          </div>
          <button
            onClick={() => router.push("/admin-dashboard/admin-addstaff")}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-semibold rounded-xl transition-all shadow-lg shadow-yellow-500/20"
          >
            <UserPlus size={16} /> Add Staff
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name, Email"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No staff found.</div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/5">
                    {["Name","Email","Gender","Age","Actions"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-medium">{member.first_name} {member.middle_name} {member.last_name}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{member.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{member.gender}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{member.age}</td>
                      
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          <button onClick={() => router.push(`/edit-staff/${member.id}`)}
                            className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all" title="Edit">
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`)}
                            className="p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg transition-all" title="Delete">
                            <Trash2 size={13} />
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
  );
}


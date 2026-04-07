"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/app/components/admin-sidebar";
import { Search, Database, Plus, Edit, Trash2 } from "lucide-react";
import { apiUrl } from "@/lib/api";

type AlumniStudentType = {
  id: number;
  alumni_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  age: number;
  year_graduate: number;
  category: { id: number; name: string };
};

export default function AlumniRecordsPage() {
  const [students, setStudents] = useState<AlumniStudentType[]>([]);
  const [filtered, setFiltered] = useState<AlumniStudentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
    const interval = setInterval(fetchStudents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(apiUrl("/api/alumni-students/"));
      const data = await res.json();
      setStudents(data);
      setFiltered(data);
    } catch { console.error("Failed to fetch alumni"); }
    finally { setLoading(false); }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFiltered(students.filter(s =>
      s.alumni_id.toLowerCase().includes(value.toLowerCase()) ||
      `${s.first_name} ${s.middle_name} ${s.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
      s.year_graduate.toString().includes(value) ||
      s.category?.name.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this alumni record?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(apiUrl(`/api/alumni-students/${id}/`), {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok || res.status === 204) {
        const updatedStudents = students.filter((student) => student.id !== id);
        setStudents(updatedStudents);
        setFiltered(updatedStudents.filter(s =>
          s.alumni_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${s.first_name} ${s.middle_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.year_graduate.toString().includes(searchTerm) ||
          s.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
        alert("Alumni record deleted.");
      } else {
        alert("Failed to delete alumni record.");
      }
    } catch {
      alert("Server connection failed");
    }
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
                <Database size={22} className="text-yellow-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Alumni <span className="text-yellow-400">Records</span></h1>
            </div>
            <p className="text-gray-400 ml-12">Official alumni student database</p>
          </div>
          <Link href="/admin-dashboard/alumni-add"
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-semibold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
            <Plus size={16} /> Add Alumni
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Alumni ID, Name, Year, or Course..."
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
          <div className="text-center py-16 text-gray-500">No alumni records found.</div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/8 bg-white/3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Total: <span className="text-yellow-400 font-semibold">{filtered.length}</span> records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/5">
                    {["Alumni ID","Name","Gender","Age","Year Graduate","Course","Actions"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-sm font-mono text-yellow-400/80">{s.alumni_id}</td>
                      <td className="px-5 py-4 text-sm font-medium">{s.first_name} {s.middle_name} {s.last_name}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{s.gender}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{s.age}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{s.year_graduate}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-xs">{s.category?.name}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          <button onClick={() => router.push(`/edit-alumni/${s.id}`)}
                            className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all" title="Edit">
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg transition-all"
                            title="Delete"
                          >
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


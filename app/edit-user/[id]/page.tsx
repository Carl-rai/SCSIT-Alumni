"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { UserPen, Search, ArrowLeft } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/app/components/toast-provider";

type AlumniRecord = {
  id: number;
  alumni_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  year_graduate: number;
  category?: { id: number; name: string };
};

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    alumni_id: "", email: "", first_name: "", middle_name: "",
    last_name: "", gender: "", age: "", course: "", year_graduate: "",
  });
  const [records, setRecords] = useState<AlumniRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AlumniRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsLoading, setRecordsLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchUser();
    fetchAlumniRecords();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(apiUrl(`/api/users/${params.id}/`));
      const user = await res.json();
      setForm({
        alumni_id: user.alumni_id || "",
        email: user.email || "",
        first_name: user.first_name || "",
        middle_name: user.middle_name || "",
        last_name: user.last_name || "",
        gender: user.gender || "",
        age: user.age?.toString() || "",
        course: user.course || "",
        year_graduate: user.year_graduate?.toString() || "",
      });
    } catch { console.error("Failed to fetch user"); }
    finally { setLoading(false); }
  };

  const fetchAlumniRecords = async () => {
    try {
      const res = await fetch(apiUrl("/api/alumni-students/"));
      const data = await res.json();
      setRecords(data);
      setFilteredRecords(data);
    } catch { console.error("Failed to fetch alumni records"); }
    finally { setRecordsLoading(false); }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilteredRecords(records.filter(r =>
      r.alumni_id.toLowerCase().includes(value.toLowerCase()) ||
      `${r.first_name} ${r.middle_name ?? ""} ${r.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
      r.year_graduate.toString().includes(value) ||
      (r.category?.name ?? "").toLowerCase().includes(value.toLowerCase())
    ));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl(`/api/users/${params.id}/update/`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("User updated successfully!", "success");
        router.push("/admin-dashboard/user-manage");
      } else {
        showToast(data.error || "Update failed.", "error");
      }
    } catch {
      showToast("Server connection failed.", "error");
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors";

  if (loading) return (
    <div className="flex min-h-screen bg-[#020d1f] items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push("/admin-dashboard/user-manage")}
            className="flex items-center gap-2 text-blue-400 hover:text-yellow-400 text-sm mb-4 transition-colors">
            <ArrowLeft size={15} /> Back to Alumni Management
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <UserPen size={22} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit <span className="text-yellow-400">Alumni User</span></h1>
              <p className="text-gray-400 text-sm">Update alumni account information</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Edit Form */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-yellow-400 rounded-full inline-block" />
              Account Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Alumni ID", name: "alumni_id", type: "text" },
                { label: "Email", name: "email", type: "email" },
                { label: "First Name", name: "first_name", type: "text" },
                { label: "Middle Name", name: "middle_name", type: "text" },
                { label: "Last Name", name: "last_name", type: "text" },
                { label: "Age", name: "age", type: "number" },
                { label: "Course", name: "course", type: "text" },
                { label: "Year Graduated", name: "year_graduate", type: "number" },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                  <input type={type} name={name} value={(form as any)[name]} onChange={handleChange} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputCls}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit"
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 mt-2">
                Update User
              </button>
            </form>
          </div>

          {/* Alumni Records Reference */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-400 rounded-full inline-block" />
              Alumni Records Reference
            </h2>
            <p className="text-gray-500 text-sm mb-4">Verify if the registrant exists in official records.</p>

            <div className="relative mb-4">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by ID, Name, Year, or Course..."
                value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors" />
            </div>

            <div className="overflow-y-auto flex-1 max-h-[460px] rounded-xl border border-white/8">
              {recordsLoading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No records found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      {["Alumni ID", "Name", "Year", "Course"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-yellow-400/80 text-xs">{r.alumni_id}</td>
                        <td className="px-4 py-3 text-gray-300">{r.first_name} {r.middle_name} {r.last_name}</td>
                        <td className="px-4 py-3 text-gray-400">{r.year_graduate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-xs">
                            {r.category?.name ?? "â€”"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Total: <span className="text-yellow-400 font-semibold">{filteredRecords.length}</span> records
            </p>
          </div>
        </div>
      </main>
      <style jsx>{`select option { background: #0a1628; color: white; }`}</style>
    </div>
  );
}


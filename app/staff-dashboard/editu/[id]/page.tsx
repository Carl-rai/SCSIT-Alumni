"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StaffSidebar from "../../../components/staff-sidebar";
import { ArrowLeft, User, Hash, BookOpen, Users, Calendar, Mail, Save, Loader, Search, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/app/components/toast-provider";

type AlumniRecord = {
  id: number;
  alumni_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  age: number;
  year_graduate: number;
  category?: { id: number; name: string };
};

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    setFilteredRecords(
      records.filter((r) =>
        r.alumni_id.toLowerCase().includes(value.toLowerCase()) ||
        `${r.first_name} ${r.middle_name ?? ""} ${r.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
        r.year_graduate.toString().includes(value) ||
        (r.category?.name ?? "").toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/users/${params.id}/update/`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("User updated successfully!", "success");
        router.push("/staff-dashboard/staff-usermanage");
      } else {
        showToast(data.error || "Update failed.", "error");
      }
    } catch {
      showToast("Server connection failed.", "error");
    }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020d1f] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-yellow-400 animate-spin" />
      </div>
      <p className="text-blue-400 text-sm animate-pulse">Loading user recordâ€¦</p>
    </div>
  );

  const fullName = [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 flex relative overflow-x-hidden">

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-yellow-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-purple-600/6 rounded-full blur-[90px]" />
      </div>

      <StaffSidebar />

      <div className="flex-1 lg:ml-64 relative z-10">
        {/* Top bar */}
        <header className="sticky top-14 lg:top-0 z-30 bg-[#020d1f]/90 backdrop-blur-md border-b border-blue-800/40 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div>
            <h1 className="text-xl font-bold text-white">Edit Alumni User</h1>
            <p className="text-blue-400 text-sm">Staff Dashboard <span className="text-blue-600">/ User Management / Edit</span></p>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-10">

          {/* Back */}
          <button
            onClick={() => router.replace("/staff-dashboard/staff-usermanage")}
            className="flex items-center gap-2 mb-8 text-blue-400 hover:text-yellow-400 transition-colors text-sm group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to User Management
          </button>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* â”€â”€ LEFT: Edit Form â”€â”€ */}
            <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#0a1628] to-[#060f1e]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.12),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.10),transparent_55%)]" />
              <div className="absolute inset-0 opacity-[0.025]"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

              <div className="h-1 w-full bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500" />

              <div className="relative px-6 py-7">
                {/* Title */}
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                    <User size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-500/15 border border-yellow-500/25 rounded-full text-yellow-400 text-xs font-semibold w-fit mb-1">
                      <Sparkles size={10} /> Staff
                    </span>
                    <h2 className="text-xl font-extrabold text-white">Edit Alumni Information</h2>
                    {fullName && <p className="text-blue-400 text-xs mt-0.5">Editing: <span className="text-yellow-400 font-semibold">{fullName}</span></p>}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Personal */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-blue-800/40" />
                      <span className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
                        <User size={9} /> Personal
                      </span>
                      <div className="flex-1 h-px bg-blue-800/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Alumni ID", name: "alumni_id", type: "text", icon: Hash, col: "col-span-2" },
                        { label: "Email", name: "email", type: "email", icon: Mail, col: "col-span-2" },
                        { label: "First Name", name: "first_name", type: "text", icon: User, col: "" },
                        { label: "Middle Name", name: "middle_name", type: "text", icon: User, col: "" },
                        { label: "Last Name", name: "last_name", type: "text", icon: User, col: "col-span-2" },
                      ].map(({ label, name, type, col }) => (
                        <div key={name} className={col}>
                          <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-1.5">{label}</label>
                          <input type={type} name={name} value={(form as any)[name]} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Academic */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-blue-800/40" />
                      <span className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
                        <BookOpen size={9} /> Academic
                      </span>
                      <div className="flex-1 h-px bg-blue-800/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><Users size={9} /> Gender</label>
                        <select name="gender" value={form.gender} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-1.5">Age</label>
                        <input type="number" name="age" value={form.age} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><BookOpen size={9} /> Course</label>
                        <input type="text" name="course" value={form.course} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar size={9} /> Year Grad.</label>
                        <input type="number" name="year_graduate" value={form.year_graduate} onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-blue-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? <><Loader size={16} className="animate-spin" /> Savingâ€¦</> : <><Save size={16} /> Save Changes</>}
                  </button>
                </form>
              </div>
            </div>

            {/* â”€â”€ RIGHT: Alumni Records â”€â”€ */}
            <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#0a1628] to-[#060f1e]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.10),transparent_55%)]" />
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 relative z-10" />

              <div className="relative flex flex-col flex-1 px-6 py-7">
                {/* Title */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">Alumni Records</h2>
                    <p className="text-blue-400 text-xs mt-0.5">Verify registrant against official records</p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, year, or courseâ€¦"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors placeholder-blue-700"
                  />
                </div>

                {/* Table */}
                <div className="overflow-y-auto flex-1 max-h-[460px] rounded-2xl border border-blue-800/30">
                  {recordsLoading ? (
                    <div className="flex items-center justify-center py-16 gap-3">
                      <div className="w-6 h-6 border-2 border-t-blue-400 border-blue-800 rounded-full animate-spin" />
                      <p className="text-blue-400 text-sm">Loading recordsâ€¦</p>
                    </div>
                  ) : filteredRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                      <Search size={28} className="text-blue-700 opacity-50" />
                      <p className="text-blue-500 text-sm">No records found.</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-blue-900/60 sticky top-0">
                        <tr>
                          {["Alumni ID", "Name", "Year", "Course"].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left text-xs text-blue-400 font-bold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((r) => (
                          <tr key={r.id} className="border-t border-blue-800/30 hover:bg-blue-900/30 transition-colors">
                            <td className="px-3 py-2.5 text-yellow-400 font-mono text-xs">{r.alumni_id}</td>
                            <td className="px-3 py-2.5 text-gray-200 text-xs">{r.first_name} {r.middle_name} {r.last_name}</td>
                            <td className="px-3 py-2.5 text-blue-300 text-xs">{r.year_graduate}</td>
                            <td className="px-3 py-2.5 text-blue-300 text-xs">{r.category?.name ?? <span className="text-gray-600 italic">-</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <p className="text-xs text-blue-600 mt-3">
                  Showing <span className="text-yellow-400 font-semibold">{filteredRecords.length}</span> of <span className="text-blue-400">{records.length}</span> records
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}


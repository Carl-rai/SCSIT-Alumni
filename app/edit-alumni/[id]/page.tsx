"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "../../components/admin-sidebar";
import { ArrowLeft, GraduationCap, User, Hash, Calendar, BookOpen, Users, Sparkles, Save, Loader } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function EditAlumniPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    alumni_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    age: "",
    year_graduate: "",
    course_category: "",
  });

  useEffect(() => {
    if (params.id) fetchAlumni();
  }, [params.id]);

  const fetchAlumni = async () => {
    try {
      const res = await fetch(apiUrl(`/api/alumni-students/${params.id}/`));
      const data = await res.json();
      setForm({
        alumni_id: data.alumni_id || "",
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        gender: data.gender || "",
        age: data.age?.toString() || "",
        year_graduate: data.year_graduate?.toString() || "",
        course_category: data.course_category || "",
      });
    } catch { console.error("Failed to fetch alumni"); }
    finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/alumni-students/${params.id}/`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Alumni updated successfully!");
        router.push("/admin-dashboard/alumni-recordsadmin");
      } else {
        const data = await res.json();
        alert("Error: " + JSON.stringify(data));
      }
    } catch { alert("Server connection failed"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020d1f] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-yellow-400 animate-spin" />
      </div>
      <p className="text-blue-400 text-sm animate-pulse">Loading alumni recordâ€¦</p>
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

      <AdminSidebar />

      <div className="flex-1 lg:ml-64 relative z-10">
        {/* Top bar */}
        <header className="sticky top-14 lg:top-0 z-30 bg-[#020d1f]/90 backdrop-blur-md border-b border-blue-800/40 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div>
            <h1 className="text-xl font-bold text-white">Edit Alumni Record</h1>
            <p className="text-blue-400 text-sm">Admin Dashboard <span className="text-blue-600">/ Alumni Records / Edit</span></p>
          </div>
        </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Back button */}
        <button
          onClick={() => router.replace("/admin-dashboard/alumni-recordsadmin")}
          className="flex items-center gap-2 mb-8 text-blue-400 hover:text-yellow-400 transition-colors text-sm group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Alumni Records
        </button>

        {/* Hero card */}
        <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#0a1628] to-[#060f1e]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.10),transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500" />

          <div className="relative px-6 sm:px-8 py-8">

            {/* Page title row */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <GraduationCap size={22} className="text-yellow-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-500/15 border border-yellow-500/25 rounded-full text-yellow-400 text-xs font-semibold">
                    <Sparkles size={10} /> Admin
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Edit Alumni Record
                </h1>
                {fullName && (
                  <p className="text-blue-400 text-sm mt-0.5">
                    Editing: <span className="text-yellow-400 font-semibold">{fullName}</span>
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Personal Info section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-blue-800/40" />
                  <span className="flex items-center gap-1.5 text-blue-500 text-xs font-bold uppercase tracking-widest">
                    <User size={10} /> Personal Information
                  </span>
                  <div className="flex-1 h-px bg-blue-800/40" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Alumni ID â€” full width */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Hash size={10} /> Alumni ID
                    </label>
                    <input type="text" name="alumni_id" value={form.alumni_id} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors placeholder-blue-700" />
                  </div>

                  <div>
                    <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">First Name</label>
                    <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                  </div>

                  <div>
                    <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">
                      Middle Name <span className="text-blue-600 normal-case font-normal">(Optional)</span>
                    </label>
                    <input type="text" name="middle_name" value={form.middle_name} onChange={handleChange}
                      className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">Last Name</label>
                    <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                  </div>
                </div>
              </div>

              {/* Academic Info section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-blue-800/40" />
                  <span className="flex items-center gap-1.5 text-blue-500 text-xs font-bold uppercase tracking-widest">
                    <BookOpen size={10} /> Academic Information
                  </span>
                  <div className="flex-1 h-px bg-blue-800/40" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Users size={10} /> Gender
                    </label>
                    <select name="gender" value={form.gender} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">Age</label>
                    <input type="number" name="age" value={form.age} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                  </div>

                  <div>
                    <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Calendar size={10} /> Year Graduated
                    </label>
                    <input type="number" name="year_graduate" value={form.year_graduate} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                  </div>

                  <div>
                    <label className="block text-xs text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <BookOpen size={10} /> Course
                    </label>
                    <input type="text" name="course_category" value={form.course_category} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-blue-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? (
                  <><Loader size={16} className="animate-spin" /> Saving Changesâ€¦</>
                ) : (
                  <><Save size={16} /> Save Changes</>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}


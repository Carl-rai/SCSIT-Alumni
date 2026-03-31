"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffSidebar from "@/app/components/staff-sidebar";
import { GraduationCap } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function StaffAlumniRecordsAddPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    alumni_id: "", first_name: "", middle_name: "", last_name: "",
    gender: "", age: "", year_graduate: "", category: "",
  });
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(apiUrl("/api/categories/"));
      setCategories(await res.json());
    } catch { console.error("Failed to fetch categories"); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl("/api/alumni-students/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { alert("Alumni added!"); router.push("/staff-dashboard/alumni-records"); }
      else { const d = await res.json(); alert("Error: " + JSON.stringify(d)); }
    } catch { alert("Server connection failed"); }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors";

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <StaffSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <GraduationCap size={22} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Add <span className="text-yellow-400">Alumni</span></h1>
              <p className="text-gray-400 text-sm">Add a new alumni record</p>
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Alumni ID", name: "alumni_id" },
                { label: "First Name", name: "first_name" },
                { label: "Middle Name", name: "middle_name", optional: true },
                { label: "Last Name", name: "last_name" },
                { label: "Age", name: "age", type: "number" },
                { label: "Year Graduate", name: "year_graduate", type: "number" },
              ].map(({ label, name, type = "text", optional }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-400 mb-1.5">{label} {optional && <span className="text-gray-600">(Optional)</span>}</label>
                  <input type={type} name={name} value={(form as any)[name]} onChange={handleChange} className={inputCls} required={!optional} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputCls} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Course</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputCls} required>
                  <option value="">Select Course</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit"
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 mt-2">
                Add Alumni
              </button>
            </form>
          </div>
        </div>
      </main>
      <style jsx>{`select option { background: #0a1628; color: white; }`}</style>
    </div>
  );
}


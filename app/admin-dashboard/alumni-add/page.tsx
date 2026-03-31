"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { GraduationCap, Plus } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function AlumniAddPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    alumni_id: "", first_name: "", middle_name: "", last_name: "",
    gender: "", age: "", year_graduate: "", category: "",
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

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
      if (res.ok) { alert("Alumni added!"); router.push("/admin-dashboard/alumni-recordsadmin"); }
      else { const d = await res.json(); alert("Error: " + JSON.stringify(d)); }
    } catch { alert("Server connection failed"); }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) { alert("Category name is required"); return; }
    setAddingCategory(true);
    try {
      const res = await fetch(apiUrl("/api/categories/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (res.ok) {
        const created = await res.json();
        setCategories(prev => [...prev, created]);
        setForm(prev => ({ ...prev, category: created.id }));
        setNewCategory({ name: "", description: "" });
        setShowCategoryModal(false);
        alert("Category added!");
      } else { const err = await res.json(); alert("Error: " + JSON.stringify(err)); }
    } catch { alert("Server connection failed"); }
    finally { setAddingCategory(false); }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors";

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <GraduationCap size={22} className="text-yellow-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Add <span className="text-yellow-400">Alumni</span></h1>
                <p className="text-gray-400 text-sm">Add a new alumni record</p>
              </div>
            </div>
            <button onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition-all text-sm">
              <Plus size={14} /> Add Course
            </button>
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

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a1628] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-yellow-400 mb-5">Add Course Category</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Category Name</label>
                <input type="text" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                  placeholder="e.g. BSIT" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                  placeholder="e.g. Bachelor of Science in Information Technology" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddCategory} disabled={addingCategory}
                className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-semibold rounded-xl transition-colors disabled:opacity-50">
                {addingCategory ? "Adding..." : "Add Category"}
              </button>
              <button onClick={() => { setShowCategoryModal(false); setNewCategory({ name: "", description: "" }); }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`select option { background: #0a1628; color: white; }`}</style>
    </div>
  );
}


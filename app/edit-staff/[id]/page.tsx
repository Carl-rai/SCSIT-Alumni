"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { UserCog, ArrowLeft } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    email: "", first_name: "", middle_name: "",
    last_name: "", gender: "", age: "", position: "", role: "",
  });

  useEffect(() => {
    if (params.id) fetchStaff();
  }, [params.id]);

  const fetchStaff = async () => {
    try {
      const res = await fetch(apiUrl("/api/staff/"));
      const data = await res.json();
      const staff = data.find((s: any) => s.id === parseInt(params.id as string));
      if (staff) {
        setForm({
          email: staff.email || "",
          first_name: staff.first_name || "",
          middle_name: staff.middle_name || "",
          last_name: staff.last_name || "",
          gender: staff.gender || "",
          age: staff.age?.toString() || "",
          position: staff.position || "",
          role: staff.role || "staff",
        });
      }
    } catch { console.error("Failed to fetch staff"); }
    finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl(`/api/staff/${params.id}/update/`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { alert("Staff updated successfully!"); router.push("/admin-dashboard/staff-manage"); }
      else { const d = await res.json(); alert("Error: " + JSON.stringify(d)); }
    } catch { alert("Server connection failed"); }
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
          <button onClick={() => router.push("/admin-dashboard/staff-manage")}
            className="flex items-center gap-2 text-blue-400 hover:text-yellow-400 text-sm mb-4 transition-colors">
            <ArrowLeft size={15} /> Back to Staff Accounts
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <UserCog size={22} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit <span className="text-yellow-400">Staff</span></h1>
              <p className="text-gray-400 text-sm">Update staff account information</p>
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-yellow-400 rounded-full inline-block" />
              Staff Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Email", name: "email", type: "email" },
                { label: "First Name", name: "first_name", type: "text" },
                { label: "Middle Name", name: "middle_name", type: "text", optional: true },
                { label: "Last Name", name: "last_name", type: "text" },
                { label: "Age", name: "age", type: "number" },
            
              ].map(({ label, name, type, optional }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    {label} {optional && <span className="text-gray-600">(Optional)</span>}
                  </label>
                  <input type={type} name={name} value={(form as any)[name]} onChange={handleChange}
                    className={inputCls} required={!optional} />
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
                <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className={inputCls} required>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit"
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 mt-2">
                Update Staff
              </button>
            </form>
          </div>
        </div>
      </main>
      <style jsx>{`select option { background: #0a1628; color: white; }`}</style>
    </div>
  );
}


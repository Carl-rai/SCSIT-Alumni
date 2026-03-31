"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { UserPlus } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function AdminAddStaffPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "", first_name: "", middle_name: "", last_name: "",
    gender: "", age: "", position: "", password: "", role: "staff",
  });

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin") router.push("/");
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl("/api/create-staff/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { alert("Staff account created! Email notification sent."); router.push("/admin-dashboard/staff-manage"); }
      else { const d = await res.json(); alert("Error: " + JSON.stringify(d)); }
    } catch { alert("Server connection failed"); }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors";

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <UserPlus size={22} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Add <span className="text-yellow-400">Staff</span></h1>
              <p className="text-gray-400 text-sm">Create a new staff account</p>
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Email", name: "email", type: "email" },
                { label: "First Name", name: "first_name", type: "text" },
                { label: "Middle Name", name: "middle_name", type: "text", optional: true },
                { label: "Last Name", name: "last_name", type: "text" },
                { label: "Age", name: "age", type: "number" },
                
                { label: "Password", name: "password", type: "password" },
              ].map(({ label, name, type, optional }) => (
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
                <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className={inputCls} required>
                  <option value="staff">Staff</option>
                  
                </select>
              </div>
              <button type="submit"
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 mt-2">
                Add Staff
              </button>
            </form>
          </div>
        </div>
      </main>
      <style jsx>{`select option { background: #0a1628; color: white; }`}</style>
    </div>
  );
}


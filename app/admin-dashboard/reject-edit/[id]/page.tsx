"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { apiUrl } from "@/lib/api";
import LogoutConfirmModal from "@/app/components/logout-confirm-modal";
import { useToast } from "@/app/components/toast-provider";

type UserForm = {
  alumni_id: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  age: string;
  course: string;
  year_graduate: string;
};

export default function RejectEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [form, setForm] = useState<UserForm>({
    alumni_id: "",
    email: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    age: "",
    course: "",
    year_graduate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/");
      return;
    }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(apiUrl(`/api/users/${id}/`));
      const data = await res.json();
      setForm({
        alumni_id: data.alumni_id || "",
        email: data.email || "",
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        gender: data.gender || "",
        age: data.age?.toString() || "",
        course: data.course || "",
        year_graduate: data.year_graduate?.toString() || "",
      });
    } catch {
      alert("Failed to load user.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/users/${id}/update/`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age),
          year_graduate: parseInt(form.year_graduate),
        }),
      });
      if (res.ok) {
        alert("User updated successfully!");
        router.push("/admin-dashboard/rejected");
      } else {
        const err = await res.json();
        alert(JSON.stringify(err));
      }
    } catch {
      alert("Server connection failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!form.alumni_id.trim()) {
      alert("Alumni ID is required to approve.");
      return;
    }
    if (!form.year_graduate.trim()) {
      alert("Year Graduated is required to approve.");
      return;
    }
    if (!confirm("Save changes and approve this user?")) return;
    setSaving(true);
    try {
      // Save first
      const saveRes = await fetch(apiUrl(`/api/users/${id}/update/`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age),
          year_graduate: parseInt(form.year_graduate),
        }),
      });
      if (!saveRes.ok) {
        alert("Failed to save changes before approving.");
        setSaving(false);
        return;
      }
      // Then approve
      const approveRes = await fetch(apiUrl(`/api/users/${id}/approve/`), {
        method: "POST",
      });
      if (approveRes.ok) {
        alert("User approved successfully!");
        router.push("/admin-dashboard/rejected");
      } else {
        alert("Failed to approve user.");
      }
    } catch {
      alert("Server connection failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setShowLogoutConfirm(false);
    showToast("You have been logged out.", "success");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-gray-100">
      <header className="bg-blue-900/40 backdrop-blur-lg border-b border-blue-700/40 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin-dashboard" className="flex items-center gap-3">
            <img src="/nah.png" alt="Alumni Logo" className="h-10 w-9 object-contain" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-yellow-400">Alumni Management</span>
            </span>
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-950 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <button
          onClick={() => router.push("/admin-dashboard/rejected")}
          className="mb-6 px-4 py-2 bg-blue-900/60 hover:bg-yellow-400 hover:text-blue-950 rounded-lg transition-colors"
        >
          â† Back to Rejected
        </button>

        <h1 className="text-4xl font-bold mb-8">
          Edit <span className="text-red-400">Rejected</span> Alumni
        </h1>

        <div className="bg-blue-800/30 border border-blue-700/40 rounded-xl p-8 space-y-5">
          {[
            { label: "Alumni ID", name: "alumni_id" },
            { label: "Email", name: "email" },
            { label: "First Name", name: "first_name" },
            { label: "Middle Name", name: "middle_name" },
            { label: "Last Name", name: "last_name" },
            { label: "Age", name: "age", type: "number" },
            { label: "Course", name: "course" },
            { label: "Year Graduated", name: "year_graduate", type: "number" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className="block text-sm text-yellow-400 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/40 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-yellow-400 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700/40 rounded-lg text-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleApprove}
              disabled={saving}
              className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? "Processing..." : "Approve Alumni"}
            </button>
          </div>
        </div>
      </main>
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}


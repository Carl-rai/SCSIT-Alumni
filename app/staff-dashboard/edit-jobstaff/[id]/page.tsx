"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { apiUrl } from "@/lib/api";
import LogoutConfirmModal from "@/app/components/logout-confirm-modal";
import { useToast } from "@/app/components/toast-provider";

export default function EditJobStaffPage() {
  const router = useRouter();
  const { id } = useParams();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userName, setUserName] = useState("");
  const [form, setForm] = useState({
    job_title: "",
    company_name: "",
    job_description: "",
    industry: "",
    employment_type: "",
    work_setup: "",
    location: "",
    salary_range: "",
    required_skills: "",
    education_requirement: "",
    experience_level: "",
    application_deadline: "",
    application_link_or_email: "",
    contact_person: "",
    status: "open",
  });
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUserName(name || "Profile");

    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(apiUrl(`/api/jobs/${id}/`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setForm({
            job_title: data.job_title || "",
            company_name: data.company_name || "",
            job_description: data.job_description || "",
            industry: data.industry || "",
            employment_type: data.employment_type || "",
            work_setup: data.work_setup || "",
            location: data.location || "",
            salary_range: data.salary_range || "",
            required_skills: data.required_skills || "",
            education_requirement: data.education_requirement || "",
            experience_level: data.experience_level || "",
            application_deadline: data.application_deadline || "",
            application_link_or_email: data.application_link_or_email || "",
            contact_person: data.contact_person || "",
            status: data.status || "open",
          });
        } else {
          alert("Failed to load job data.");
          router.push("/staff-dashboard/view-jobstaff");
        }
      } catch {
        alert("Server connection failed");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(form.application_deadline);
    if (form.application_deadline && deadline < today) {
      setErrors((prev) => ({ ...prev, application_deadline: "Application deadline cannot be in the past." }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });
      if (image) formData.append("image_upload", image);
      const res = await fetch(apiUrl(`/api/jobs/${id}/`), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        alert("Job updated successfully!");
        router.push("/staff-dashboard/view-jobstaff");
      } else {
        const err = await res.json();
        alert(JSON.stringify(err));
      }
    } catch {
      alert("Server connection failed");
    } finally {
      setSubmitting(false);
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

  if (loading) return <div className="min-h-screen bg-blue-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-gray-100">
      <header className="bg-blue-900/40 backdrop-blur-lg border-b border-blue-700/40 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/staff-dashboard" className="flex items-center gap-3">
            <img src="/nah.png" alt="Alumni Logo" className="h-10 w-9 object-contain" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-yellow-400">Staff Dashboard</span>
            </span>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 bg-yellow-500 hover:bg-yellow-400 rounded-full flex items-center justify-center transition-colors shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-950">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-blue-900 border border-blue-700/40 rounded-lg shadow-xl overflow-hidden">
                <Link href="/staff-dashboard/staff-profile" className="block px-4 py-3 hover:bg-blue-800 transition-colors" onClick={() => setShowDropdown(false)}>
                  {userName}
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-left px-4 py-3 hover:bg-blue-800 transition-colors">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <button
          onClick={() => router.push("/staff-dashboard/view-jobstaff")}
          className="mb-6 bg-blue-900/60 hover:bg-yellow-400 hover:text-blue-950 text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
          â† Back
        </button>

        <div className="bg-blue-900/40 backdrop-blur-lg border border-blue-700/40 rounded-2xl p-10">
          <h1 className="text-4xl font-bold text-center mb-8">
            <span className="text-yellow-400">Edit</span> Job
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-yellow-400 font-semibold text-lg border-b border-blue-700/40 pb-2">Basic Job Information</p>
            <input name="job_title" placeholder="Job Title" value={form.job_title} onChange={handleChange} className="input" required />
            <input name="company_name" placeholder="Company / Organization Name" value={form.company_name} onChange={handleChange} className="input" required />
            <textarea name="job_description" placeholder="Job Description" value={form.job_description} onChange={handleChange} className="input" rows={4} required />
            <input name="industry" placeholder="Industry / Field" value={form.industry} onChange={handleChange} className="input" required />

            <p className="text-yellow-400 font-semibold text-lg border-b border-blue-700/40 pb-2">Job Details</p>
            <select name="employment_type" value={form.employment_type} onChange={handleChange} className="input" required>
              <option value="">Employment Type</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
            <select name="work_setup" value={form.work_setup} onChange={handleChange} className="input" required>
              <option value="">Work Setup</option>
              <option value="on_site">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="input" required />
            <input name="salary_range" placeholder="Salary Range (Optional)" value={form.salary_range} onChange={handleChange} className="input" />

            <p className="text-yellow-400 font-semibold text-lg border-b border-blue-700/40 pb-2">Requirements</p>
            <textarea name="required_skills" placeholder="Required Skills" value={form.required_skills} onChange={handleChange} className="input" rows={3} required />
            <input name="education_requirement" placeholder="Education Requirement" value={form.education_requirement} onChange={handleChange} className="input" required />
            <select name="experience_level" value={form.experience_level} onChange={handleChange} className="input" required>
              <option value="">Experience Level</option>
              <option value="entry">Entry-level</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
            </select>

            <p className="text-yellow-400 font-semibold text-lg border-b border-blue-700/40 pb-2">Application Information</p>
            <div>
              <input name="application_deadline" type="date" value={form.application_deadline} onChange={handleChange} className="input" required />
              {errors.application_deadline && <p className="text-red-400 text-sm mt-1">{errors.application_deadline}</p>}
            </div>
            <input name="application_link_or_email" placeholder="Application Link or Email" value={form.application_link_or_email} onChange={handleChange} className="input" required />
            <input name="contact_person" placeholder="Contact Person (Optional)" value={form.contact_person} onChange={handleChange} className="input" />

            <p className="text-yellow-400 font-semibold text-lg border-b border-blue-700/40 pb-2">Posting Details</p>
            <select name="status" value={form.status} onChange={handleChange} className="input" required>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>

            <div>
              <label className="block text-blue-200 mb-2 text-sm">Replace Image (Optional)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: rgba(30, 58, 138, 0.5);
          border: 1px solid rgba(59, 130, 246, 0.5);
          color: white;
        }
        .input:focus {
          outline: none;
          border-color: #facc15;
        }
        select.input option {
          background: #1e3a8a;
          color: white;
        }
      `}</style>
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}


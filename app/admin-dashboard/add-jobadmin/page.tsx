"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { BriefcaseBusiness } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function AddJobAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    job_title: "", company_name: "", job_description: "", industry: "",
    employment_type: "", work_setup: "", location: "", salary_range: "",
    required_skills: "", education_requirement: "", experience_level: "",
    application_deadline: "", application_link_or_email: "", contact_person: "", status: "open",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (form.application_deadline && new Date(form.application_deadline) < today) {
      setErrors(p => ({ ...p, application_deadline: "Deadline cannot be in the past." }));
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (image) fd.append("image_upload", image);
      const res = await fetch(apiUrl("/api/jobs/"), { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) { alert("Job posted!"); router.push("/admin-dashboard/view-jobadmin"); }
      else { const err = await res.json(); alert(JSON.stringify(err)); }
    } catch { alert("Server connection failed"); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors";
  const sectionCls = "text-yellow-400 font-semibold text-sm uppercase tracking-wider border-b border-white/8 pb-2 mb-4";

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <BriefcaseBusiness size={22} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Post a <span className="text-yellow-400">Job</span></h1>
              <p className="text-gray-400 text-sm">Create a new job listing for alumni</p>
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className={sectionCls}>Basic Information</p>
              <input name="job_title" placeholder="Job Title" value={form.job_title} onChange={handleChange} className={inputCls} required />
              <input name="company_name" placeholder="Company / Organization Name" value={form.company_name} onChange={handleChange} className={inputCls} required />
              <textarea name="job_description" placeholder="Job Description" value={form.job_description} onChange={handleChange} className={inputCls} rows={4} required />
              <input name="industry" placeholder="Industry / Field (e.g. IT, Engineering)" value={form.industry} onChange={handleChange} className={inputCls} required />

              <p className={sectionCls}>Job Details</p>
              <div className="grid grid-cols-2 gap-4">
                <select name="employment_type" value={form.employment_type} onChange={handleChange} className={inputCls} required>
                  <option value="">Employment Type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
                <select name="work_setup" value={form.work_setup} onChange={handleChange} className={inputCls} required>
                  <option value="">Work Setup</option>
                  <option value="on_site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <input name="location" placeholder="Location (City or Country)" value={form.location} onChange={handleChange} className={inputCls} required />
              <input name="salary_range" placeholder="Salary Range (Optional)" value={form.salary_range} onChange={handleChange} className={inputCls} />

              <p className={sectionCls}>Requirements</p>
              <textarea name="required_skills" placeholder="Required Skills" value={form.required_skills} onChange={handleChange} className={inputCls} rows={3} required />
              <input name="education_requirement" placeholder="Education Requirement" value={form.education_requirement} onChange={handleChange} className={inputCls} required />
              <select name="experience_level" value={form.experience_level} onChange={handleChange} className={inputCls} required>
                <option value="">Experience Level</option>
                <option value="entry">Entry-level</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
              </select>

              <p className={sectionCls}>Application Info</p>
              <div>
                <input name="application_deadline" type="date" value={form.application_deadline} onChange={handleChange} className={inputCls} required />
                {errors.application_deadline && <p className="text-red-400 text-xs mt-1">{errors.application_deadline}</p>}
              </div>
              <input name="application_link_or_email" placeholder="Application Link or Email" value={form.application_link_or_email} onChange={handleChange} className={inputCls} required />
              <input name="contact_person" placeholder="Contact Person (Optional)" value={form.contact_person} onChange={handleChange} className={inputCls} />

              <p className={sectionCls}>Posting Details</p>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls} required>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Job Image <span className="text-gray-600">(Optional)</span></label>
                <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp" onChange={(e) => setImage(e.target.files?.[0] || null)} className={inputCls} />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20">
                {submitting ? "Posting..." : "Post Job"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <style jsx>{`select option { background: #0a1628; color: white; }`}</style>
    </div>
  );
}


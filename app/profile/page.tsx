"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Camera, GraduationCap, Loader, Pencil, X, Check, MapPin, Phone, Briefcase, Building2, Wrench, FileText } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    gender: "", age: "", course: "", year_graduate: "",
    location: "", contact_num: "", current_job: "", company: "", skills: "", bio: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    if (role !== "user") { router.push("/"); return; }
    fetchUserData(email);
  }, [router]);

  const fetchUserData = async (email: string | null) => {
    if (!email) return;
    try {
      const res = await fetch(apiUrl(`/api/user-profile/?email=${email}`));
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setImagePreview(data.profile_image || null);
        setIsPrivate(data.is_private || false);
        setForm({
          first_name: data.first_name, middle_name: data.middle_name || "",
          last_name: data.last_name, gender: data.gender,
          age: data.age, course: data.course, year_graduate: data.year_graduate,
          location: data.location || "", contact_num: data.contact_num || "",
          current_job: data.current_job || "", company: data.company || "",
          skills: data.skills || "", bio: data.bio || "",
        });
      }
    } catch { console.error("Failed to fetch user data"); }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) { alert("Only JPG, PNG, WEBP or GIF allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("email", user.email);
      fd.append("profile_image", file);
      const res = await fetch(apiUrl("/api/upload-profile-image/"), { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImagePreview(data.profile_image);
        setUser((prev: any) => ({ ...prev, profile_image: data.profile_image }));
      } else { alert(data.error || "Failed to upload image."); }
    } catch { alert("Server connection failed."); }
    finally { setUploadingImage(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl("/api/update-profile/"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, ...form }),
      });
      if (res.ok) {
        setIsEditing(false);
        fetchUserData(user.email);
        localStorage.setItem("userName", `${form.first_name} ${form.last_name}`);
        window.dispatchEvent(new Event("storage"));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update profile");
      }
    } catch { alert("Server connection failed"); }
    finally { setSaving(false); }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setForm({
      first_name: user.first_name, middle_name: user.middle_name || "",
      last_name: user.last_name, gender: user.gender, age: user.age,
      course: user.course, year_graduate: user.year_graduate,
      location: user.location || "", contact_num: user.contact_num || "",
      current_job: user.current_job || "", company: user.company || "",
      skills: user.skills || "", bio: user.bio || "",
    });
  };

  const handleTogglePrivacy = async () => {
    setTogglingPrivacy(true);
    try {
      const res = await fetch(apiUrl("/api/toggle-privacy/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsPrivate(data.is_private);
      }
    } catch { alert("Server connection failed"); }
    finally { setTogglingPrivacy(false); }
  };

  if (!user) return (
    <div className="min-h-screen bg-[#020d1f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-yellow-400">My</span> Profile
          </h1>
          <p className="text-blue-300">Manage your alumni account</p>
        </div>

        <div className="bg-blue-900/20 border border-blue-700/30 rounded-2xl overflow-hidden shadow-2xl">

          {/* Banner */}
          <div className="relative h-28 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
            <h2 className="top-18 left-41 absolute text-xl font-bold text-white">{user.first_name} {user.middle_name ? `${user.middle_name}. ` : ""}{user.last_name}</h2>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.08),transparent_70%)]" />
          </div>

          <div className="px-8 pb-8">
            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-14 mb-8">
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-2xl border-4 border-[#020d1f] overflow-hidden bg-blue-800 shadow-xl">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900">
                      <GraduationCap size={40} className="text-yellow-400/60" />
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                      <Loader size={22} className="text-yellow-400 animate-spin" />
                    </div>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 rounded-xl flex items-center justify-center shadow-lg transition-all border-2 border-[#020d1f]">
                  <Camera size={14} className="text-blue-950" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <div className="text-center sm:text-left pb-1">
                
                <p className="text-blue-400 text-sm">{user.email}</p>
                <span className="inline-block mt-1 px-3 py-0.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs rounded-full font-medium">
                  Alumni Â· {user.course}
                </span>
              </div>

              <div className="sm:ml-auto pb-1 flex items-center gap-3">
                <button
                  onClick={handleTogglePrivacy}
                  disabled={togglingPrivacy}
                  className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all border ${
                    isPrivate
                      ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                      : "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30"
                  }`}
                >
                  {isPrivate ? "ðŸ”’ Private" : "ðŸŒ Public"}
                </button>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
                    <Pencil size={15} /> Edit Profile
                  </button>
                ) : (
                  <button onClick={cancelEdit}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-800/60 hover:bg-blue-700/60 border border-blue-700/40 text-white rounded-xl transition-all">
                    <X size={15} /> Cancel
                  </button>
                )}
              </div>
            </div>

            {/* â”€â”€ VIEW MODE â”€â”€ */}
            {!isEditing ? (
              <div className="space-y-6">
                {isPrivate && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <span className="text-red-400 text-sm font-medium">
                      ðŸ”’ You set your profile to <strong>Private</strong>. Alumni cannot see your information Details.
                    </span>
                  </div>
                )}
                {/* Basic Info */}
                <section>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-3">Basic Information</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: "Alumni ID", value: user.alumni_id || "Not Assigned" },
                      { label: "Email", value: user.email },
                      { label: "First Name", value: user.first_name },
                      { label: "Middle Name", value: user.middle_name || "N/A" },
                      { label: "Last Name", value: user.last_name },
                      { label: "Gender", value: user.gender },
                      { label: "Age", value: user.age },
                      { label: "Course", value: user.course },
                      { label: "Year Graduated", value: user.year_graduate },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5">{label}</label>
                        <div className="px-4 py-3 bg-blue-900/40 border border-blue-700/30 rounded-xl text-sm text-gray-200">{value}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Professional Info */}
                <section>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-3">Professional & Contact</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: "Location", icon: MapPin, value: user.location || "-" },
                      { label: "Contact Number", icon: Phone, value: user.contact_num || "-" },
                      { label: "Current Job", icon: Briefcase, value: user.current_job || "-" },
                      { label: "Company", icon: Building2, value: user.company || "-" },
                    ].map(({ label, icon: Icon, value }) => (
                      <div key={label}>
                        <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Icon size={10} /> {label}
                        </label>
                        <div className="px-4 py-3 bg-blue-900/40 border border-blue-700/30 rounded-xl text-sm text-gray-200">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Wrench size={10} /> Skills
                      </label>
                      <div className="px-4 py-3 bg-blue-900/40 border border-blue-700/30 rounded-xl text-sm text-gray-200 min-h-[60px] whitespace-pre-wrap">{user.skills || "-"}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <FileText size={10} /> Bio
                      </label>
                      <div className="px-4 py-3 bg-blue-900/40 border border-blue-700/30 rounded-xl text-sm text-gray-200 min-h-[60px] whitespace-pre-wrap">{user.bio || "-"}</div>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              /* â”€â”€ EDIT MODE â”€â”€ */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <section>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-3">Basic Information</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Read-only */}
                    {[
                      { label: "Alumni ID", value: user.alumni_id || "Not Assigned (Admin Only)" },
                      { label: "Email", value: user.email },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5">{label}</label>
                        <div className="px-4 py-3 bg-blue-900/20 border border-blue-700/20 rounded-xl text-sm text-gray-500">{value}</div>
                      </div>
                    ))}
                    {/* Editable text inputs */}
                    {[
                      { label: "First Name", name: "first_name", type: "text", required: true },
                      { label: "Middle Name", name: "middle_name", type: "text", required: false },
                      { label: "Last Name", name: "last_name", type: "text", required: true },
                      { label: "Age", name: "age", type: "number", required: true },
                      { label: "Course", name: "course", type: "text", required: true },
                      { label: "Year Graduated", name: "year_graduate", type: "number", required: true },
                    ].map(({ label, name, type, required }) => (
                      <div key={name}>
                        <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5">{label}</label>
                        <input type={type} name={name} value={(form as any)[name]} onChange={handleChange} required={required}
                          className="w-full px-4 py-3 bg-blue-900/40 border border-blue-700/40 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5">Gender</label>
                      <select name="gender" value={form.gender} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-blue-900/40 border border-blue-700/40 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Professional & Contact */}
                <section>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-3">Professional & Contact</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: "Location", name: "location", placeholder: "e.g. Cebu City, Philippines" },
                      { label: "Contact Number", name: "contact_num", placeholder: "e.g. +63 912 345 6789" },
                      { label: "Current Job", name: "current_job", placeholder: "e.g. Software Engineer" },
                      { label: "Company", name: "company", placeholder: "e.g. Acme Corp" },
                    ].map(({ label, name, placeholder }) => (
                      <div key={name}>
                        <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5">{label}</label>
                        <input type="text" name={name} value={(form as any)[name]} onChange={handleChange} placeholder={placeholder}
                          className="w-full px-4 py-3 bg-blue-900/40 border border-blue-700/40 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder-blue-700" />
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5">Skills</label>
                      <textarea name="skills" value={form.skills} onChange={handleChange} rows={3}
                        placeholder="e.g. React, Python, Project Management"
                        className="w-full px-4 py-3 bg-blue-900/40 border border-blue-700/40 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder-blue-700 resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-blue-400 uppercase tracking-wider mb-1.5">Bio</label>
                      <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                        placeholder="Tell us a little about yourselfâ€¦"
                        className="w-full px-4 py-3 bg-blue-900/40 border border-blue-700/40 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder-blue-700 resize-none" />
                    </div>
                  </div>
                </section>

                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
                  {saving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


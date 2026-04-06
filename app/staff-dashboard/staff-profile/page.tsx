"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StaffSidebar from "@/app/components/staff-sidebar";
import { UserCircle, Lock, ShieldCheck, Camera, Loader } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function StaffProfilePage() {
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    if (role !== "staff") { router.push("/"); return; }
    fetchStaffData(email);
  }, [router]);

  const fetchStaffData = async (email: string | null) => {
    if (!email) return;
    try {
      const res = await fetch(apiUrl(`/api/staff-profile/?email=${email}`));
      if (res.ok) {
        const d = await res.json();
        setStaff(d);
        setPasswordChanged(d.password_changed);
        setImagePreview(d.profile_image || null);
      }
    } catch { console.error("Failed to fetch staff data"); }
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
      fd.append("email", staff.email);
      fd.append("profile_image", file);
      const res = await fetch(apiUrl("/api/upload-profile-image/"), { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImagePreview(data.profile_image);
        setStaff((prev: any) => ({ ...prev, profile_image: data.profile_image }));
      } else { alert(data.error || "Failed to upload image."); }
    } catch { alert("Server connection failed."); }
    finally { setUploadingImage(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { alert("Passwords do not match!"); return; }
    try {
      const res = await fetch(apiUrl("/api/change-password/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: staff.email, current_password: passwordForm.currentPassword, new_password: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) { alert("Password changed!"); setShowPasswordModal(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setPasswordChanged(true); }
      else alert(data.error || "Failed to change password");
    } catch { alert("Server connection failed"); }
  };

  if (!staff) return (
    <div className="flex min-h-screen bg-[#020d1f] items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const fields = [
    { label: "Email", value: staff.email },
   
    { label: "First Name", value: staff.first_name },
    { label: "Middle Name", value: staff.middle_name || "N/A" },
    { label: "Last Name", value: staff.last_name },
    { label: "Gender", value: staff.gender },
    { label: "Age", value: staff.age },
  ];

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors";

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <StaffSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <UserCircle size={22} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My <span className="text-yellow-400">Profile</span></h1>
              <p className="text-gray-400 text-sm">Your staff account information</p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 mb-5">
            {/* Avatar with upload */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/8">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl border-2 border-yellow-500/30 overflow-hidden bg-blue-900/50 shadow-lg">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-yellow-400">{staff.first_name?.[0]}{staff.middle_name ? `${staff.middle_name}. ` : ''}{staff.last_name?.[0]}</span>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                      <Loader size={18} className="text-yellow-400 animate-spin" />
                    </div>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 rounded-lg flex items-center justify-center shadow-md transition-all border-2 border-[#020d1f]"
                  title="Change photo">
                  <Camera size={12} className="text-blue-950" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{staff.first_name} {staff.middle_name ? `${staff.middle_name}. ` : ''} {staff.last_name}</h2>
                
                <p className="text-gray-500 text-xs mt-1">Click the camera icon to update your photo</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {fields.map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <div className="px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-sm text-gray-300">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/8">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={15} className={passwordChanged ? "text-gray-500" : "text-yellow-400"} />
                <span className="text-sm text-gray-400">
                  {passwordChanged ? "Password has been changed once - contact admin for further changes." : "You can change your password once."}
                </span>
              </div>
              <button
                onClick={() => { if (passwordChanged) { alert("Contact admin for further password changes."); } else { setShowPasswordModal(true); } }}
                disabled={passwordChanged}
                className={`flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-all ${passwordChanged ? "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] shadow-lg shadow-yellow-500/20"}`}
              >
                <Lock size={15} /> {passwordChanged ? "Password Already Changed" : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0a1628] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-yellow-400 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { label: "Current Password", key: "currentPassword" },
                { label: "New Password", key: "newPassword" },
                { label: "Confirm New Password", key: "confirmPassword" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                  <input type="password" value={(passwordForm as any)[key]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                    className={inputCls} required />
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <button type="submit"
                  className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-semibold rounded-xl transition-colors">
                  Change Password
                </button>
                <button type="button" onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


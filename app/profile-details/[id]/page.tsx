"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../components/navbar";
import { GraduationCap, MapPin, Briefcase, Building2, Phone, User, BookOpen, ArrowLeft } from "lucide-react";
import { apiUrl } from "@/lib/api";

type AlumniProfile = {
  id: number;
  alumni_id?: string;
  email?: string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  full_name?: string;
  gender?: string;
  age?: number;
  course?: string;
  year_graduate?: number;
  location?: string | null;
  contact_num?: string | null;
  current_job?: string | null;
  company?: string | null;
  skills?: string | null;
  bio?: string | null;
  profile_image: string | null;
  is_private?: boolean;
  private_message?: string | null;
};

export default function ProfileDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(apiUrl(`/api/users/${params.id}/`));
      const data = await res.json();
      setProfile(data);
    } catch {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#001F3F] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#001F3F] flex items-center justify-center text-blue-400">
      Alumni not found.
    </div>
  );

  const fullName = profile.full_name || `${profile.first_name || ""} ${profile.middle_name ? profile.middle_name + " " : ""}${profile.last_name || ""}`.trim();
  const isPrivate = !!profile.is_private;

  const infoItems = [
    { icon: <GraduationCap size={15} className="text-yellow-400" />, label: "Alumni ID", value: profile.alumni_id },
    { icon: <BookOpen size={15} className="text-yellow-400" />, label: "Course", value: profile.course },
    { icon: <GraduationCap size={15} className="text-yellow-400" />, label: "Year Graduated", value: profile.year_graduate },
    { icon: <User size={15} className="text-yellow-400" />, label: "Gender", value: profile.gender },
    { icon: <User size={15} className="text-yellow-400" />, label: "Age", value: profile.age },
    { icon: <Briefcase size={15} className="text-yellow-400" />, label: "Current Job", value: profile.current_job },
    { icon: <Building2 size={15} className="text-yellow-400" />, label: "Company", value: profile.company },
    { icon: <MapPin size={15} className="text-yellow-400" />, label: "Location", value: profile.location },
    { icon: <Phone size={15} className="text-yellow-400" />, label: "Contact", value: profile.contact_num },
  ];

  return (
    <div className="min-h-screen bg-[#001F3F] text-gray-100">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-400 hover:text-yellow-400 transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        {/* Profile Card */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-3xl overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-900 via-blue-800 to-yellow-400/20" />

          {/* Avatar + Name */}
          <div className="px-8 pb-6">
            <div className="-mt-12 mb-4 flex items-end justify-between">
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#001F3F]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-yellow-400/10 border-4 border-[#001F3F] flex items-center justify-center">
                  <span className="text-yellow-400 font-bold text-3xl">{(fullName || "A").charAt(0)}</span>
                </div>
              )}
              <span className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold rounded-full">
                Alumni
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-1">{fullName || "Alumni"}</h1>
            {isPrivate && (
              <p className="text-blue-400 text-sm mb-1">{profile.current_job || "Job not specified"}</p>
            )}
            {!isPrivate && (
              <>
                <p className="text-blue-400 text-sm mb-1">{profile.email}</p>
                <div className="flex items-center gap-1.5 text-blue-300 text-sm">
                  <BookOpen size={13} className="text-yellow-400" />
                  <span>{profile.course} - Batch {profile.year_graduate}</span>
                </div>
              </>
            )}
            {isPrivate && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl">
                <span className="text-red-400 text-xs font-medium">
                  {profile.private_message || "This Account is Private."}
                </span>
              </div>
            )}

            {/* Bio */}
            {!isPrivate && profile.bio && (
              <div className="mt-5 p-4 bg-blue-900/30 border border-blue-700/30 rounded-2xl">
                <p className="text-blue-300 text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Info Grid */}
            {!isPrivate && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {infoItems.map(item => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-3 bg-blue-900/30 border border-blue-800/40 rounded-xl">
                  <div className="shrink-0">{item.icon}</div>
                  <div className="min-w-0">
                    <p className="text-blue-400 text-[11px] uppercase tracking-wider">{item.label}</p>
                    <p className="text-white text-sm font-medium truncate">{item.value || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>

            )}

            {/* Skills */}
            {!isPrivate && profile.skills && (
              <div className="mt-6">
                <p className="text-blue-400 text-xs uppercase tracking-wider mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.split(",").map(skill => skill.trim()).filter(Boolean).map(skill => (
                    <span key={skill} className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StaffSidebar from "@/app/components/staff-sidebar";
import { Search, Briefcase, Plus, Edit, Trash2, MapPin, Building2, Clock } from "lucide-react";
import { apiUrl } from "@/lib/api";

type JobType = {
  id: number;
  job_title: string;
  company_name: string;
  job_description: string;
  industry: string;
  employment_type: string;
  work_setup: string;
  location: string;
  salary_range?: string;
  required_skills: string;
  education_requirement: string;
  experience_level: string;
  application_deadline: string;
  application_link_or_email: string;
  contact_person?: string;
  date_posted: string;
  status: string;
  image?: string;
};

const EMP: Record<string, string> = { full_time: "Full-time", part_time: "Part-time", internship: "Internship", contract: "Contract" };
const SETUP: Record<string, string> = { on_site: "On-site", remote: "Remote", hybrid: "Hybrid" };
const EXP: Record<string, string> = { entry: "Entry-level", mid: "Mid-level", senior: "Senior" };

export default function ViewJobStaffPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [filtered, setFiltered] = useState<JobType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    setUserRole(localStorage.getItem("userRole") || "");
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(apiUrl("/api/jobs/"));
      const data = await res.json();
      setJobs(data);
      setFiltered(data);
    } catch { console.error("Failed to fetch jobs"); }
    finally { setLoading(false); }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFiltered(jobs.filter(j =>
      j.job_title.toLowerCase().includes(value.toLowerCase()) ||
      j.company_name.toLowerCase().includes(value.toLowerCase()) ||
      j.industry.toLowerCase().includes(value.toLowerCase()) ||
      j.location.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job post?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(apiUrl(`/api/jobs/${id}/`), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { alert("Job deleted!"); fetchJobs(); }
      else alert("Failed to delete job.");
    } catch { alert("Server connection failed"); }
  };

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <StaffSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Briefcase size={22} className="text-yellow-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Career <span className="text-yellow-400">& Jobs</span></h1>
            </div>
            <p className="text-gray-400 ml-12">Manage all job postings for alumni</p>
          </div>
          <button onClick={() => router.push("/staff-dashboard/add-jobstaff")}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-semibold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
            <Plus size={16} /> Add Job
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by Title, Company, Industry, or Location..."
            value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No job posts found.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((job) => (
              <div key={job.id} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all group">
                {job.image && (
                  <div className="relative h-44 overflow-hidden">
                    <img src={job.image} alt={job.job_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020d1f] to-transparent" />
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${job.status === "open" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                      {job.status === "open" ? "â— Open" : "â— Closed"}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold text-yellow-400">{job.job_title}</h2>
                    {!job.image && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${job.status === "open" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                        {job.status === "open" ? "â— Open" : "â— Closed"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-300 text-sm font-medium mb-2">
                    <Building2 size={13} /> {job.company_name}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{job.job_description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-xs">
                      <Clock size={10} /> {EMP[job.employment_type] || job.employment_type}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-xs">
                      {SETUP[job.work_setup] || job.work_setup}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded-full text-xs">
                      <MapPin size={10} /> {job.location}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    <p>Deadline: <span className="text-gray-400">{job.application_deadline}</span></p>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-white/8">
                    <Link href={`/staff-dashboard/edit-jobstaff/${job.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-sm transition-all">
                      <Edit size={13} /> Edit
                    </Link>
                    {userRole === "admin" && (
                      <button onClick={() => handleDelete(job.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-sm transition-all">
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


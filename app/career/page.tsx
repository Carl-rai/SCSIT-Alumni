"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { apiUrl } from "@/lib/api";

type JobType = {
  id: number;
  job_title: string;
  company_name: string;
  job_description: string;
  status: string;
  image?: string;
};

export default function CareerPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [filtered, setFiltered] = useState<JobType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await fetch(apiUrl("/api/jobs/"));
      const data = await res.json();
      const open = data.filter((j: JobType) => j.status === "open");
      setJobs(open);
      setFiltered(open);
    } catch {
      console.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDetails = (id: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    router.push(`/job-detailsapply/${id}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFiltered(
      jobs.filter(
        (j) =>
          j.job_title.toLowerCase().includes(value.toLowerCase()) ||
          j.company_name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-yellow-400">Career</span> & Opportunities
          </h1>
          <p className="text-xl text-blue-200">Browse open job opportunities</p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by Title or Company..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-blue-900/50 border border-blue-700/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          />
        </div>

        {loading ? (
          <p className="text-center">Loading jobs...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">No open job posts found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filtered.map((job) => (
              <div key={job.id} className="bg-blue-900/40 backdrop-blur-lg border border-blue-700/40 rounded-2xl overflow-hidden shadow-lg">
                {job.image && (
                  <img src={job.image} alt={job.job_title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-yellow-400">{job.job_title}</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-700/60 text-green-300">
                      Open
                    </span>
                  </div>
                  <p className="text-blue-200 font-semibold">ðŸ¢ {job.company_name}</p>
                  <p className="text-gray-300 text-sm line-clamp-3">{job.job_description}</p>
                  <button
                    onClick={() => handleViewDetails(job.id)}
                    className="mt-2 w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-3 rounded-xl transition-all"
                  >
                    View Details & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-blue-900 border border-blue-700/40 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-yellow-400 mb-3">Login Required</h2>
            <p className="text-blue-200 mb-6">You need to be logged in to view job details and apply.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-3 rounded-xl border border-blue-600 text-white hover:bg-blue-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}


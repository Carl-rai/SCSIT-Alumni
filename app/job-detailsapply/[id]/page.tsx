"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../components/navbar";
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
  posted_by_name?: string;
  date_posted: string;
  status: string;
  image?: string;
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time",
  internship: "Internship", contract: "Contract",
};
const WORK_SETUP_LABELS: Record<string, string> = {
  on_site: "On-site", remote: "Remote", hybrid: "Hybrid",
};
const EXPERIENCE_LABELS: Record<string, string> = {
  entry: "Entry-level", mid: "Mid-level", senior: "Senior",
};

export default function JobDetailsApplyPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJob();
      const interval = setInterval(fetchJob, 10000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await fetch(apiUrl(`/api/jobs/${id}/`));
      if (res.ok) setJob(await res.json());
    } catch { console.error("Failed to fetch job"); }
    finally { setLoading(false); }
  };

  const handleApply = () => {
    if (!job) return;
    const link = job.application_link_or_email;
    const userEmail = localStorage.getItem("userEmail") || "";
    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank");
    } else {
      const subject = encodeURIComponent(`Job Application - ${job.job_title}`);
      const body = encodeURIComponent(`Dear Hiring Manager,\n\nI am interested in applying for the ${job.job_title} position at ${job.company_name}.\n\nBest regards,\n${userEmail}`);
      window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(link)}&su=${subject}&body=${body}`, "_blank");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 flex items-center justify-center text-white">
      Loading...
    </div>
  );

  if (!job) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 flex items-center justify-center text-white">
      Job not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <button
          onClick={() => router.push("/career")}
          className="mb-6 bg-blue-900/60 hover:bg-yellow-400 hover:text-blue-950 text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
          â† Back
        </button>

        <div className="bg-blue-900/40 backdrop-blur-lg border border-blue-700/40 rounded-2xl overflow-hidden shadow-lg">
          {job.image && <img src={job.image} alt={job.job_title} className="w-full h-56 object-cover" />}

          <div className="p-8 space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-yellow-400">{job.job_title}</h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-700/60 text-green-300">Open</span>
            </div>

            <p className="text-blue-200 text-lg font-semibold">Company: {job.company_name}</p>
            <p className="text-gray-300">{job.job_description}</p>

            <div className="border-t border-blue-700/40 pt-4 space-y-2 text-sm text-gray-400">
              <p className="text-yellow-400 font-semibold text-base">Job Details</p>
              <p>Industry: {job.industry}</p>
              <p>Employment: {EMPLOYMENT_LABELS[job.employment_type] || job.employment_type}</p>
              <p>Work Setup: {WORK_SETUP_LABELS[job.work_setup] || job.work_setup}</p>
              <p>Location: {job.location}</p>
              {job.salary_range && <p>Salary: {job.salary_range}</p>}
            </div>

            <div className="border-t border-blue-700/40 pt-4 space-y-2 text-sm text-gray-400">
              <p className="text-yellow-400 font-semibold text-base">Requirements</p>
              <p>Education: {job.education_requirement}</p>
              <p>Experience: {EXPERIENCE_LABELS[job.experience_level] || job.experience_level}</p>
              <p>Skills: {job.required_skills}</p>
            </div>

            <div className="border-t border-blue-700/40 pt-4 space-y-2 text-sm text-gray-400">
              <p className="text-yellow-400 font-semibold text-base">Application Info</p>
              <p>Deadline: {job.application_deadline}</p>
              {job.contact_person && <p>ðŸ‘¤ Contact: {job.contact_person}</p>}
              <p>Posted by: {job.posted_by_name || "â€”"}</p>
              <p>Date Posted: {job.date_posted}</p>
              <p>Apply to: {job.application_link_or_email}</p>
            </div>

            <button
              onClick={handleApply}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-4 rounded-xl transition-all text-lg mt-4"
            >
              Apply Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


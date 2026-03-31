"use client";
import Link from "next/link";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { Users, Calendar, Search, ArrowRight, GraduationCap, Star, Briefcase, MapPin, Clock, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type EventType = {
  id: number;
  title: string;
  date: string;
  start_time: string;
  location: string;
  image: string | null;
  course_category: string | null;
};

type JobType = {
  id: number;
  job_title: string;
  company_name: string;
  employment_type: string;
  work_setup: string;
  location: string;
  image: string | null;
  date_posted: string;
  status: string;
};

export default function AlumniHomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [alumniCount, setAlumniCount] = useState<number | null>(null);
  const [eventsCount, setEventsCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventType[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobType[]>([]);

  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem("accessToken"));
    check();
    window.addEventListener("storage", check);
    fetch(apiUrl("/api/stats/"))
      .then(r => r.json())
      .then(d => { setAlumniCount(d.alumni_count); setEventsCount(d.events_count); setJobsCount(d.jobs_count); })
      .catch(() => {});
    return () => window.removeEventListener("storage", check);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(apiUrl("/api/events/"))
      .then(r => r.json())
      .then(d => setRecentEvents(d.slice(-10).reverse()))
      .catch(() => {});
    fetch(apiUrl("/api/jobs/"))
      .then(r => r.json())
      .then(d => setRecentJobs(d.filter((j: JobType) => j.status === "open").slice(0, 10)))
      .catch(() => {});
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium mb-8">
            <Star size={14} className="fill-yellow-400" />
            SCSIT Alumni Network
          </div>

          {isLoggedIn ? (
            <>
              <h1 className="text-6xl sm:text-7xl font-extrabold leading-tight mb-6">
                Welcome Back,<br />
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  Alumni!
                </span>
              </h1>
              <p className="text-xl text-blue-200/80 max-w-2xl mx-auto mb-10 italic">
                "Once an alumni, always a part of the family. Your journey continues here."
              </p>
            </>
          ) : (
            <>
              <h1 className="text-6xl sm:text-7xl font-extrabold leading-tight mb-6">
                Connect. Remember.<br />
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  Celebrate.
                </span>
              </h1>
              <p className="text-xl text-blue-200/80 max-w-2xl mx-auto mb-10">
                Reunite with classmates, celebrate milestones, discover opportunities, and stay part of the family forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/registration"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:-translate-y-0.5">
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link href="/events"
                  className="flex items-center justify-center gap-2 px-8 py-4 border border-blue-600/60 hover:border-yellow-500/50 text-blue-200 hover:text-yellow-300 rounded-xl transition-all hover:-translate-y-0.5">
                  Explore Events
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-blue-400/50 text-xs">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-blue-400/30" />
          Scroll
        </div>
      </section>

      {/* â”€â”€ LOGGED IN: Latest Events & Jobs â”€â”€ */}
      {isLoggedIn ? (
        <section className="py-20 px-6">
          <div className="mx-auto max-w-6xl space-y-16">

            {/* Latest Events */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Latest <span className="text-yellow-400">Events</span>
                  </h2>
                  <p className="text-blue-400 text-sm mt-1">Most recent upcoming events</p>
                </div>
                <Link href="/events" className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
                  View all <ArrowRight size={15} />
                </Link>
              </div>

              {recentEvents.length === 0 ? (
                <p className="text-blue-400 text-center py-10">No events available.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {recentEvents.map(ev => (
                    <Link key={ev.id} href={`/registerevent/${ev.id}`}
                      className="group bg-blue-900/20 border border-blue-700/30 rounded-2xl overflow-hidden hover:border-yellow-400/40 hover:-translate-y-1 transition-all duration-200">
                      <div className="h-36 bg-blue-900/40 overflow-hidden">
                        {ev.image ? (
                          <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar size={32} className="text-blue-700" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-white font-semibold text-sm line-clamp-2 mb-2">{ev.title}</p>
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs mb-1">
                          <Clock size={11} />
                          {ev.date ? new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA"}
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs truncate">
                          <MapPin size={11} />
                          {ev.location}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent" />

            {/* Latest Jobs */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Latest <span className="text-yellow-400">Job Openings</span>
                  </h2>
                  <p className="text-blue-400 text-sm mt-1">Recent open positions for alumni</p>
                </div>
                <Link href="/career" className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
                  View all <ArrowRight size={15} />
                </Link>
              </div>

              {recentJobs.length === 0 ? (
                <p className="text-blue-400 text-center py-10">No job openings available.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {recentJobs.map(job => (
                    <Link key={job.id} href="/career"
                      className="group bg-blue-900/20 border border-blue-700/30 rounded-2xl overflow-hidden hover:border-yellow-400/40 hover:-translate-y-1 transition-all duration-200">
                      <div className="h-36 bg-blue-900/40 overflow-hidden">
                        {job.image ? (
                          <img src={job.image} alt={job.job_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Briefcase size={32} className="text-blue-700" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-white font-semibold text-sm line-clamp-2 mb-1">{job.job_title}</p>
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs mb-1">
                          <Building2 size={11} />
                          {job.company_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs mb-2 truncate">
                          <MapPin size={11} />
                          {job.location}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] rounded-full">
                            {job.employment_type.replace("_", " ")}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] rounded-full">
                            {job.work_setup.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

      ) : (
        <>
          {/* Stats */}
          <section className="py-16 bg-gradient-to-r from-blue-950/80 via-blue-900/40 to-blue-950/80 border-y border-blue-800/30">
            <div className="mx-auto max-w-5xl px-6 grid grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-5xl font-extrabold text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
                  {alumniCount !== null ? alumniCount.toLocaleString() : "â€”"}
                </div>
                <div className="text-blue-300 font-medium">Registered Alumni</div>
              </div>
              <div className="group">
                <div className="text-5xl font-extrabold text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
                  {eventsCount !== null ? eventsCount.toLocaleString() : "â€”"}
                </div>
                <div className="text-blue-300 font-medium">Events Hosted</div>
              </div>
              <div className="group">
                <div className="text-5xl font-extrabold text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
                  {jobsCount !== null ? jobsCount.toLocaleString() : "â€”"}
                </div>
                <div className="text-blue-300 font-medium">Open Job Listings</div>
              </div>
            </div>
          </section>

          {/* Feature Cards */}
          <section className="py-24 px-6">
            <div className="mx-auto max-w-6xl">
              <div className="text-center mb-14">
                <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
                <p className="text-blue-300 text-lg max-w-xl mx-auto">Your one-stop platform to stay connected with your alma mater and fellow alumni.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Users, href: "/directory", label: "Alumni Directory", desc: "Find and reconnect with former classmates, teachers, and batchmates using advanced search filters.", cta: "Explore Directory" },
                  { icon: Calendar, href: "/events", label: "Events & Reunions", desc: "Discover upcoming homecomings, batch meetups, webinars, and professional networking events.", cta: "View Events" },
                  { icon: Search, href: "/career", label: "Career & Opportunities", desc: "Browse job postings, internships, and career opportunities curated for SCSIT alumni.", cta: "View Opportunities" },
                ].map(({ icon: Icon, href, label, desc, cta }) => (
                  <div key={href} className="group relative bg-gradient-to-b from-blue-900/40 to-blue-950/60 border border-blue-700/30 rounded-2xl p-8 hover:border-yellow-500/40 transition-all hover:-translate-y-2 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/3 group-hover:to-transparent transition-all" />
                    <div className="relative">
                      <div className="mb-5 inline-flex p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
                        <Icon className="h-7 w-7 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{label}</h3>
                      <p className="text-blue-300 text-sm mb-6 leading-relaxed">{desc}</p>
                      <Link href={href} className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium text-sm transition-colors">
                        {cta} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="py-20 px-6">
            <div className="mx-auto max-w-4xl relative overflow-hidden bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-yellow-500/10 border border-yellow-500/20 rounded-3xl p-12 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.08),transparent_70%)]" />
              <GraduationCap size={48} className="text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Ready to Reconnect?</h2>
              <p className="text-blue-200 mb-8 max-w-lg mx-auto">Join thousands of SCSIT alumni who are already part of our growing community.</p>
              <Link href="/registration"
                className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/25">
                Create Your Account <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { Search, Users, GraduationCap } from "lucide-react";
import { apiUrl } from "@/lib/api";

type AlumniType = {
  id: number;
  full_name: string;
  course?: string | null;
  year_graduate?: number | null;
  profile_image: string | null;
  current_job: string | null;
  company: string | null;
  location: string | null;
};

export default function DirectoryPage() {
  const router = useRouter();
  const [alumni, setAlumni] = useState<AlumniType[]>([]);
  const [filtered, setFiltered] = useState<AlumniType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return; }
    fetchAlumni();
  }, [router]);

  const fetchAlumni = async () => {
    try {
      const email = localStorage.getItem("userEmail") || "";
      const url = email
        ? apiUrl(`/api/directory/?email=${encodeURIComponent(email)}`)
        : apiUrl("/api/directory/");
      const res = await fetch(url);
      const data = await res.json();
      setAlumni(data);
      setFiltered(data);
    } catch {
      console.error("Failed to fetch alumni");
    } finally {
      setLoading(false);
    }
  };

  const courseValues = alumni.map(a => a.course || "").filter(Boolean);
  const courses = ["All", ...Array.from(new Set(courseValues)).sort()];
  const years = [
    "All",
    ...Array.from(
      new Set(
        alumni
          .map(a => a.year_graduate)
          .filter((y): y is number => typeof y === "number")
      )
    )
      .sort((a, b) => b - a)
      .map(String),
  ];

  const applyFilters = (searchVal: string, course: string, year: string) => {
    let result = alumni;
    if (searchVal) {
      const q = searchVal.toLowerCase();
      result = result.filter(a =>
        a.full_name.toLowerCase().includes(q) ||
        (a.course || "").toLowerCase().includes(q) ||
        String(a.year_graduate ?? "").includes(searchVal)
      );
    }
    if (course !== "All") result = result.filter(a => (a.course || "") === course);
    if (year !== "All") result = result.filter(a => String(a.year_graduate ?? "") === year);
    setFiltered(result);
  };

  const handleSearch = (val: string) => { setSearch(val); applyFilters(val, selectedCourse, selectedYear); };
  const handleCourse = (val: string) => { setSelectedCourse(val); applyFilters(search, val, selectedYear); };
  const handleYear = (val: string) => { setSelectedYear(val); applyFilters(search, selectedCourse, val); };

  const grouped: Record<string, Record<string, AlumniType[]>> = {};
  filtered.forEach(a => {
    const course = a.course || "";
    const year = a.year_graduate ? String(a.year_graduate) : "";
    if (!grouped[course]) grouped[course] = {};
    if (!grouped[course][year]) grouped[course][year] = [];
    grouped[course][year].push(a);
  });

  return (
    <div className="min-h-screen bg-[#001F3F] text-gray-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="text-yellow-400">Alumni</span> Directory
          </h1>
          <p className="text-blue-300 text-sm">Browse and connect with fellow SCSIT alumni</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              placeholder="Search by name, course, or year..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-blue-900/30 border border-blue-700/40 rounded-xl text-white placeholder-blue-400 focus:outline-none focus:border-yellow-400/50"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={e => handleCourse(e.target.value)}
            className="px-4 py-3 bg-blue-900/30 border border-blue-700/40 rounded-xl text-white focus:outline-none focus:border-yellow-400/50 min-w-[180px]"
          >
            {courses.map(c => <option key={c} value={c} className="bg-blue-950">{c}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={e => handleYear(e.target.value)}
            className="px-4 py-3 bg-blue-900/30 border border-blue-700/40 rounded-xl text-white focus:outline-none focus:border-yellow-400/50 min-w-[140px]"
          >
            {years.map(y => <option key={y} value={y} className="bg-blue-950">{y === "All" ? "All Years" : y}</option>)}
          </select>
        </div>

        <p className="text-blue-400 text-sm mb-6">
          Showing <span className="text-yellow-400 font-semibold">{filtered.length}</span> alumni
        </p>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-blue-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p>No alumni found.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([course, yearGroups]) => (
              <div key={course}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
                    <GraduationCap size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">{course}</span>
                  </div>
                  <div className="flex-1 h-px bg-blue-800/40" />
                  <span className="text-blue-500 text-xs">{Object.values(yearGroups).flat().length} alumni</span>
                </div>

                <div className="space-y-6">
                  {Object.entries(yearGroups).sort(([a], [b]) => Number(b) - Number(a)).map(([year, members]) => (
                    <div key={year}>
                      <div className="flex items-center gap-2 mb-3 ml-2">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Batch {year}</span>
                        <span className="text-blue-700 text-xs">Â· {members.length} alumni</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {members.map(a => (
                          <button
                            key={a.id}
                            onClick={() => router.push(`/profile-details/${a.id}`)}
                            className="group flex flex-col items-center gap-3 p-4 bg-blue-900/20 border border-blue-700/30 rounded-2xl hover:border-yellow-400/40 hover:bg-blue-800/30 transition-all duration-200 text-center"
                          >
                            {a.profile_image ? (
                              <img
                                src={a.profile_image}
                                alt={a.full_name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-blue-700/40 group-hover:border-yellow-400/50 transition-all"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-yellow-400/10 border-2 border-yellow-400/20 flex items-center justify-center group-hover:border-yellow-400/50 transition-all">
                                <span className="text-yellow-400 font-bold text-xl">{a.full_name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="min-w-0 w-full">
                              <p className="text-white text-xs font-semibold truncate">{a.full_name}</p>
                              {a.current_job && (
                                <p className="text-blue-400 text-[11px] truncate mt-0.5">{a.current_job}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
      </main>
      <Footer />
    </div>
  );
}


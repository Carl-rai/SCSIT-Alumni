"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";
import { Search, CalendarDays, ChevronRight, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    fetchEvents();
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    const interval = setInterval(fetchEvents, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const checkLoginStatus = () => {
    setIsLoggedIn(!!localStorage.getItem("accessToken"));
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(apiUrl("/api/events/"));
      const data = await res.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch { console.error("Failed to fetch events"); }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilteredEvents(
      events.filter((e: any) =>
        e.title.toLowerCase().includes(value.toLowerCase()) ||
        e.location.toLowerCase().includes(value.toLowerCase()) ||
        e.date.includes(value)
      )
    );
  };

  const isFull = (e: any) => e.capacity != null && e.slots_remaining === 0;

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 relative overflow-x-hidden">

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-yellow-500/6 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16">

        {/* Hero header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/15 border border-yellow-500/25 rounded-full text-yellow-400 text-xs font-semibold mb-4">
            <Sparkles size={11} /> Alumni Events
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
            <span className="text-white">Events &</span>{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">Reunions</span>
          </h1>
          <p className="text-blue-300 text-lg">Discover and join upcoming alumni events</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-12">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
          <input
            type="text"
            placeholder="Search by title, location, or dateâ€¦"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-2xl text-white text-sm placeholder-blue-600 transition-colors"
          />
        </div>

        {filteredEvents.length === 0 && searchTerm && (
          <p className="text-center text-blue-500 mb-8">No events match your search.</p>
        )}

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event: any) => (
            <div
              key={event.id}
              onClick={() => {
                if (!isLoggedIn) { setShowLoginPrompt(true); return; }
                if (!isFull(event)) router.push(`/registerevent/${event.id}`);
              }}
              className={`group relative bg-gradient-to-b from-blue-900/20 to-blue-900/10 border border-blue-800/30 rounded-3xl overflow-hidden hover:border-blue-700/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/40 transition-all duration-300 ${
                isFull(event) ? "cursor-not-allowed opacity-75" : "cursor-pointer"
              }`}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden bg-blue-900/40">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950">
                    <CalendarDays size={40} className="text-blue-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020d1f] via-transparent to-transparent" />

                {/* Full badge */}
                {isFull(event) && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                    Full
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                  {event.title}
                </h3>
                <p className="text-blue-300 text-sm leading-relaxed line-clamp-3">
                  {event.description}
                </p>

                {/* Register hint */}
                <div className="flex items-center gap-1 mt-4 text-yellow-400/70 text-xs font-medium group-hover:text-yellow-400 transition-colors">
                  {isFull(event) ? (
                    <span className="text-red-400">Event Full</span>
                  ) : (
                    <>Register now <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" /></>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && !searchTerm && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <CalendarDays size={48} className="text-blue-800 opacity-50" />
            <p className="text-white font-semibold text-lg">No events yet</p>
            <p className="text-blue-500 text-sm">Check back soon for upcoming alumni events.</p>
          </div>
        )}
      </main>

      {/* Login prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-b from-[#0d1f3c] to-[#060f1e] border border-blue-700/40 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="h-1 w-full bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500 absolute top-0 left-0 rounded-t-3xl" />
            <h2 className="text-2xl font-bold text-yellow-400 mb-3 mt-2">Login Required</h2>
            <p className="text-blue-300 text-sm mb-6">You need to be logged in to register for an event.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-3 rounded-xl border border-blue-700/50 text-white hover:bg-blue-800/40 transition-all text-sm">
                Cancel
              </button>
              <button onClick={() => router.push("/login")}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-blue-950 font-bold transition-all text-sm shadow-lg shadow-yellow-500/20">
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


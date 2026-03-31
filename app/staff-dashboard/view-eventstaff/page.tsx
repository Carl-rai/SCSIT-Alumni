"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StaffSidebar from "@/app/components/staff-sidebar";
import { Search, CalendarDays, Plus, Edit, Trash2, MapPin, Clock, Users, BookOpen } from "lucide-react";
import { apiUrl } from "@/lib/api";

type EventType = {
  id: number;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  venue?: string;
  image?: string;
  batch_category?: string;
  course_category?: string;
  capacity?: number;
  slots_remaining?: number;
};

const fmtTime = (t: string) => {
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

export default function ViewEventStaffPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [filtered, setFiltered] = useState<EventType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
    setUserRole(localStorage.getItem("userRole") || "");
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(apiUrl("/api/events/"));
      const data = await res.json();
      setEvents(data);
      setFiltered(data);
    } catch { console.error("Failed to fetch events"); }
    finally { setLoading(false); }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFiltered(events.filter(e =>
      e.title.toLowerCase().includes(value.toLowerCase()) ||
      e.location.toLowerCase().includes(value.toLowerCase()) ||
      e.date.includes(value)
    ));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(apiUrl(`/api/events/${id}/`), { method: "DELETE" });
      if (res.ok) { alert("Event deleted!"); fetchEvents(); }
      else alert("Failed to delete event");
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
                <CalendarDays size={22} className="text-yellow-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Events <span className="text-yellow-400">Management</span></h1>
            </div>
            <p className="text-gray-400 ml-12">Manage alumni events</p>
          </div>
          <button onClick={() => router.push("/staff-dashboard/add")}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-semibold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
            <Plus size={16} /> Add Event
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by Title, Location, or Date..."
            value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No events found.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((event) => (
              <div key={event.id} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all group">
                {event.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020d1f] to-transparent" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-yellow-400 mb-2">{event.title}</h2>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{event.description}</p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CalendarDays size={13} className="text-yellow-400/60" /> {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={13} className="text-blue-400/60" /> {fmtTime(event.start_time)} â€“ {fmtTime(event.end_time)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin size={13} className="text-red-400/60" /> {event.location}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin size={13} className="text-orange-400/60" /> {event.venue}
                      </div>
                    )}
                    {event.capacity != null && (
                      <div className={`flex items-center gap-2 text-sm font-medium ${event.slots_remaining === 0 ? "text-red-400" : "text-emerald-400"}`}>
                        <Users size={13} /> Slots: {event.slots_remaining === 0 ? "Full" : event.slots_remaining} / {event.capacity}
                      </div>
                    )}
                    {event.batch_category && (
                      <span className="inline-block px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs">Batch: {event.batch_category}</span>
                    )}
                    {event.course_category && (
                      <span className="inline-block px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-xs ml-1">{event.course_category}</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-white/8">
                    <Link href={`/staff-dashboard/edit-event/${event.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-sm transition-all">
                      <Edit size={13} /> Edit
                    </Link>
                    {userRole === "admin" && (
                      <button onClick={() => handleDelete(event.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-sm transition-all">
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                    <Link href={`/staff-dashboard/staff-eventlist/${event.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm transition-all">
                      <Users size={13} /> Registrants
                    </Link>
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


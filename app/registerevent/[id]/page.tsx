"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import { MapPin, CalendarDays, Clock, Users, BookOpen, Ticket, ArrowLeft, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function RegisterEventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guestCount, setGuestCount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (params.id) {
      const token = localStorage.getItem("accessToken");
      Promise.all([fetchEvent(), token ? fetchCurrentUser(token) : Promise.resolve()]);
    }
  }, [params.id]);

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch(apiUrl("/api/me/"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCurrentUser(await res.json());
    } catch {}
  };

  const fetchEvent = async () => {
    try {
      const res = await fetch(apiUrl(`/api/events/${params.id}/`));
      const data = await res.json();
      setEvent(data);
      setLoading(false);
    } catch {
      console.error("Failed to fetch event");
      setLoading(false);
    }
  };

  const isBlocked = () => {
    if (!event || !currentUser) return null;
    if (event.batch_category && String(currentUser.year_graduate) !== String(event.batch_category))
      return `This event is only open to batch ${event.batch_category} graduates.`;
    if (event.course_category && (currentUser.course || "").trim().toLowerCase() !== event.course_category.trim().toLowerCase())
      return `This event is only open to ${event.course_category} course alumni.`;
    return null;
  };

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(apiUrl("/api/event-registrations/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event: params.id, guest_count: guestCount, remarks }),
      });
      if (res.ok) {
        alert("Successfully registered for the event!");
        router.push("/events");
      } else {
        const error = await res.json();
        alert(error.detail || "Registration failed. You may already be registered.");
      }
    } catch {
      alert("Server connection failed");
    } finally {
      setSubmitting(false);
    }
  };

  const blockedMsg = isBlocked();
  const isFull = event?.slots_remaining === 0;
  const slotsLow = event?.slots_remaining > 0 && event?.slots_remaining <= 10;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020d1f] text-gray-100">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-yellow-400 animate-spin" />
          </div>
          <p className="text-blue-400 text-sm animate-pulse">Loading event detailsâ€¦</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#020d1f] text-gray-100">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
          <AlertCircle size={40} className="text-red-400 opacity-60" />
          <p className="text-white font-semibold text-lg">Event not found</p>
          <button onClick={() => router.replace("/events")} className="text-blue-400 text-sm hover:text-blue-300 transition-colors">â† Back to Events</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 relative overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-yellow-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-purple-600/6 rounded-full blur-[90px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back button */}
        <button
          onClick={() => router.replace("/events")}
          className="flex items-center gap-2 mb-8 text-blue-400 hover:text-yellow-400 transition-colors text-sm group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Events
        </button>

        {/* Event image */}
        {event.image && (
          <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden mb-6 border border-white/5 shadow-2xl">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020d1f] via-[#020d1f]/30 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-semibold backdrop-blur-sm">
                <Sparkles size={11} /> Event Registration
              </span>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#0a1628] to-[#060f1e]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.08),transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500" />

          <div className="relative px-6 sm:px-8 py-8">
            {/* Title */}
            {!event.image && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/15 border border-yellow-500/25 rounded-full text-yellow-400 text-xs font-semibold w-fit mb-4">
                <Sparkles size={11} /> Event Registration
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
              {event.title}
            </h1>
            <p className="text-blue-300 text-sm leading-relaxed mb-8">{event.description}</p>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                { icon: MapPin, label: "Location", value: event.location, color: "blue" },
                ...(event.venue ? [{ icon: MapPin, label: "Venue", value: event.venue, color: "orange" }] : []),
                { icon: CalendarDays, label: "Date", value: event.date, color: "purple" },
                { icon: Clock, label: "Start Time", value: formatTime(event.start_time), color: "emerald" },
                { icon: Clock, label: "End Time", value: formatTime(event.end_time), color: "emerald" },
                ...(event.batch_category ? [{ icon: Users, label: "For Batch", value: event.batch_category, color: "yellow" }] : []),
                ...(event.course_category ? [{ icon: BookOpen, label: "For Course", value: event.course_category, color: "cyan" }] : []),
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-${color}-500/5 border border-${color}-500/15`}>
                  <div className={`w-8 h-8 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={`text-${color}-400`} />
                  </div>
                  <div>
                    <p className={`text-${color}-500 text-[10px] font-bold uppercase tracking-widest`}>{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}

              {/* Slots */}
              {event.capacity != null && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl sm:col-span-2
                  ${isFull ? "bg-red-500/5 border border-red-500/20" : slotsLow ? "bg-orange-500/5 border border-orange-500/20" : "bg-emerald-500/5 border border-emerald-500/20"}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                    ${isFull ? "bg-red-500/10 border border-red-500/20" : slotsLow ? "bg-orange-500/10 border border-orange-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                    <Ticket size={14} className={isFull ? "text-red-400" : slotsLow ? "text-orange-400" : "text-emerald-400"} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isFull ? "text-red-500" : slotsLow ? "text-orange-500" : "text-emerald-500"}`}>Slots Remaining</p>
                    <p className={`text-sm font-bold ${isFull ? "text-red-400" : slotsLow ? "text-orange-400" : "text-emerald-400"}`}>
                      {isFull ? "Event Full" : `${event.slots_remaining} slot${event.slots_remaining !== 1 ? "s" : ""} left`}
                      {slotsLow && !isFull && <span className="ml-2 text-orange-500 font-normal text-xs">Filling up fast!</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Registration section */}
            {blockedMsg ? (
              <div className="flex items-start gap-3 p-5 bg-red-900/20 border border-red-500/30 rounded-2xl">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-semibold text-sm">Registration Not Allowed</p>
                  <p className="text-red-400/80 text-sm mt-1">{blockedMsg}</p>
                </div>
              </div>
            ) : isFull ? (
              <div className="flex items-start gap-3 p-5 bg-red-900/20 border border-red-500/30 rounded-2xl">
                <Ticket size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-semibold text-sm">Event is Full</p>
                  <p className="text-red-400/80 text-sm mt-1">No more slots available for this event.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Divider */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-px bg-blue-800/40" />
                  <span className="text-blue-600 text-xs font-semibold uppercase tracking-widest">Registration Details</span>
                  <div className="flex-1 h-px bg-blue-800/40" />
                </div>

                <div>
                  <label className="block text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">Number of Guests</label>
                  <input
                    type="number"
                    min="0"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors placeholder-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">Remarks <span className="text-blue-600 normal-case font-normal">(Optional)</span></label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/40 hover:border-blue-600/60 focus:border-yellow-500/50 focus:outline-none rounded-xl text-white text-sm transition-colors placeholder-blue-600 resize-none"
                    placeholder="Any special requirements or notesâ€¦"
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-blue-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-950/40 border-t-blue-950 rounded-full animate-spin" />
                      Registeringâ€¦
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirm Registration
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


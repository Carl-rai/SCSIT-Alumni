"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { CalendarPlus } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function AddEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", date: "", start_time: "", end_time: "",
    location: "", venue: "", batch_category: "", course_category: "", capacity: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "date") setDateError("");
    if (e.target.name === "start_time" || e.target.name === "end_time") setTimeError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(form.date) < today) { setDateError("Event date cannot be in the past."); return; }
    if (form.start_time && form.end_time && form.end_time <= form.start_time) { setTimeError("End time must be after start time."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (image) fd.append("image_upload", image);
      const res = await fetch(apiUrl("/api/events/"), { method: "POST", body: fd });
      if (res.ok) { alert("Event created!"); router.push("/admin-dashboard/view-eventadmin"); }
      else { const err = await res.json(); alert(JSON.stringify(err)); }
    } catch { alert("Server connection failed"); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors";

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <CalendarPlus size={22} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Add <span className="text-yellow-400">Event</span></h1>
              <p className="text-gray-400 text-sm">Create a new alumni event</p>
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Event Title</label>
                <input name="title" placeholder="e.g. Alumni Homecoming 2025" value={form.title} onChange={handleChange} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea name="description" placeholder="Describe the event..." value={form.description} onChange={handleChange} className={inputCls} rows={4} required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} className={inputCls} required />
                {dateError && <p className="text-red-400 text-xs mt-1">{dateError}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Start Time</label>
                  <input name="start_time" type="time" value={form.start_time} onChange={handleChange} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">End Time</label>
                  <input name="end_time" type="time" value={form.end_time} onChange={handleChange} className={inputCls} required />
                </div>
              </div>
              {timeError && <p className="text-red-400 text-xs -mt-3">{timeError}</p>}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                <input name="location" placeholder="address" value={form.location} onChange={handleChange} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Venue <span className="text-gray-600">(Optional)</span></label>
                <input name="venue" placeholder="e.g. Main Hall, Room 101" value={form.venue} onChange={handleChange} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Batch Category <span className="text-gray-600">(Optional)</span></label>
                  <input name="batch_category" placeholder="e.g. Batch 2020" value={form.batch_category} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Course Category <span className="text-gray-600">(Optional)</span></label>
                  <input name="course_category" placeholder="e.g. BSIT" value={form.course_category} onChange={handleChange} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Capacity <span className="text-gray-600">(Optional)</span></label>
                <input name="capacity" type="number" placeholder="Max attendees" value={form.capacity} onChange={handleChange} className={inputCls} min="1" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Event Image <span className="text-gray-600">(Optional)</span></label>
                <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp" onChange={(e) => setImage(e.target.files?.[0] || null)} className={inputCls} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20">
                {submitting ? "Creating..." : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}


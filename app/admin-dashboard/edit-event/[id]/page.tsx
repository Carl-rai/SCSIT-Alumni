"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin-sidebar";
import { CalendarCog } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", date: "", start_time: "", end_time: "",
    location: "", venue: "", batch_category: "", course_category: "", capacity: "",
    image: null as File | null,
  });

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(apiUrl(`/api/events/${id}/`));
      const d = await res.json();
      setForm({ title: d.title, description: d.description, date: d.date, start_time: d.start_time, end_time: d.end_time, location: d.location, venue: d.venue || "", batch_category: d.batch_category || "", course_category: d.course_category || "", capacity: d.capacity || "", image: null });
      setCurrentImage(d.image || "");
    } catch { alert("Failed to load event"); }
    finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append("title", form.title); fd.append("description", form.description);
      fd.append("date", form.date); fd.append("start_time", form.start_time); fd.append("end_time", form.end_time);
      fd.append("location", form.location);
      if (form.venue) fd.append("venue", form.venue);
      if (form.batch_category) fd.append("batch_category", form.batch_category);
      if (form.course_category) fd.append("course_category", form.course_category);
      if (form.capacity) fd.append("capacity", form.capacity);
      if (form.image) fd.append("image_upload", form.image);
      const res = await fetch(apiUrl(`/api/events/${id}/`), { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) { alert("Event updated!"); router.push("/admin-dashboard/view-eventadmin"); }
      else { const err = await res.json(); alert(JSON.stringify(err)); }
    } catch { alert("Server connection failed"); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors";

  if (loading) return (
    <div className="flex min-h-screen bg-[#020d1f] items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#020d1f] text-gray-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <CalendarCog size={22} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit <span className="text-yellow-400">Event</span></h1>
              <p className="text-gray-400 text-sm">Update event details</p>
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Event Title</label>
                <input name="title" value={form.title} onChange={handleChange} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className={inputCls} rows={4} required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} className={inputCls} required />
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
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className={inputCls} required />
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
                <input name="capacity" type="number" value={form.capacity} onChange={handleChange} className={inputCls} min="1" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Event Image</label>
                {currentImage && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
                    <img src={currentImage} alt="Current" className="w-full h-40 object-cover" />
                    <p className="text-xs text-gray-500 px-3 py-2">Current image â€” upload new to replace</p>
                  </div>
                )}
                <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp" onChange={(e) => setForm(p => ({ ...p, image: e.target.files?.[0] || null }))} className={inputCls} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#020d1f] font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20">
                {submitting ? "Updating..." : "Update Event"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}


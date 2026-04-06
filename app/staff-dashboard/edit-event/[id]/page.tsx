"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    venue: "",
    batch_category: "",
    course_category: "",
    capacity: "",
    image: null as File | null,
  });
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(apiUrl(`/api/events/${params.id}/`));
      const data = await res.json();
      
      setFormData({
        title: data.title,
        description: data.description,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location,
        venue: data.venue || "",
        batch_category: data.batch_category || "",
        course_category: data.course_category || "",
        capacity: data.capacity || "",
        image: null,
      });
      setCurrentImage(data.image || "");
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch event:", error);
      alert("Failed to load event data");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const formDataToSend = new FormData();
      
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("start_time", formData.start_time);
      formDataToSend.append("end_time", formData.end_time);
      formDataToSend.append("location", formData.location);
      if (formData.venue) formDataToSend.append("venue", formData.venue);
      if (formData.batch_category) formDataToSend.append("batch_category", formData.batch_category);
      if (formData.course_category) formDataToSend.append("course_category", formData.course_category);
      if (formData.capacity) formDataToSend.append("capacity", formData.capacity);
      
      if (formData.image) {
        formDataToSend.append("image_upload", formData.image);
      }

      const res = await fetch(apiUrl(`/api/events/${params.id}/`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (res.ok) {
        alert("Event updated successfully!");
        router.push("/staff-dashboard/view-eventstaff");
      } else {
        const error = await res.json();
        alert(`Failed to update event: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Server connection failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-gray-100 flex items-center justify-center">
        <p className="text-xl">Loading event data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-gray-100">
      <header className="bg-blue-900/40 backdrop-blur-lg border-b border-blue-700/40 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/staff-dashboard" className="flex items-center gap-3">
            <img src="/nah.png" alt="Alumni Logo" className="h-10 w-9 object-contain" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-yellow-400">Edit Event</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-blue-900/60 hover:bg-yellow-400 hover:text-blue-950 rounded-lg transition-colors"
        >
          ← Back
        </button>

        <form onSubmit={handleSubmit} className="bg-blue-900/40 backdrop-blur-lg border border-blue-700/40 rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-blue-200 mb-2">Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Start Time</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">End Time</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Venue <span className="text-blue-400 text-sm">(Optional)</span></label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Main Hall, Room 101"
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Batch Category <span className="text-blue-400 text-sm">(Optional)</span></label>
            <input
              type="text"
              name="batch_category"
              value={formData.batch_category}
              onChange={handleChange}
              placeholder="e.g. Batch 2020"
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Course Category <span className="text-blue-400 text-sm">(Optional)</span></label>
            <input
              type="text"
              name="course_category"
              value={formData.course_category}
              onChange={handleChange}
              placeholder="e.g. BSIT, BSN"
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Capacity <span className="text-blue-400 text-sm">(Optional)</span></label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="1"
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-blue-200 mb-2">Event Image</label>
            {currentImage && (
              <div className="mb-4">
                <p className="text-sm text-blue-300 mb-2">Current Image:</p>
                <img src={currentImage} alt="Current event" className="w-full h-48 object-cover rounded-lg" />
              </div>
            )}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff,.tif,.ico,.avif"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-700/40 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
            <p className="text-sm text-blue-300 mt-2">Leave empty to keep current image</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold text-lg rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update Event"}
          </button>
        </form>
      </main>
    </div>
  );
}


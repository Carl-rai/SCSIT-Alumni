"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function ReportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      const name = localStorage.getItem("userName");
      const email = localStorage.getItem("userEmail");
      if (name && email) {
        setForm(prev => ({ ...prev, name, email }));
        setIsLoggedIn(true);
      } else {
        setForm(prev => ({ ...prev, name: "", email: "" }));
        setIsLoggedIn(false);
      }
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/reports/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
        setForm(prev => ({ ...prev, message: "" }));
        setTimeout(() => {
          setSubmitted(false);
          setIsOpen(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 bg-blue-900 border border-blue-700/40 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-800/60 px-4 py-3 flex justify-between items-center border-b border-blue-700/40">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="text-yellow-400" />
              <span className="font-semibold text-white">Send a Message</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {submitted ? (
              <div className="text-center py-6">
                <div className="text-yellow-400 text-4xl mb-3">âœ“</div>
                <p className="text-white font-semibold">Report Submitted!</p>
                <p className="text-blue-300 text-sm mt-1">Thank you for your feedback.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {!isLoggedIn && (
                  <>
                    <input
                      name="name"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-blue-800/50 border border-blue-700/40 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-400"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Your Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-blue-800/50 border border-blue-700/40 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-400"
                    />
                  </>
                )}
                {isLoggedIn && (
                  <p className="text-blue-300 text-sm">Sending as <span className="text-yellow-400 font-semibold">{form.name}</span></p>
                )}
                <textarea
                  name="message"
                  placeholder="Your message or report..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 bg-blue-800/50 border border-blue-700/40 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-400 resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Chat Head Button */}
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-yellow-500 hover:bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <MessageCircle size={24} className="text-blue-950" />
        </button>
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <X size={16} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
}


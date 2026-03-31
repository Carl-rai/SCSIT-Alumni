"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/app/components/toast-provider";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/login/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.login, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        const { role, first_name, last_name, access, refresh, email } = data;
        const entries: [string, string][] = [
          ["accessToken", access], ["refreshToken", refresh],
          ["userRole", role], ["userName", `${first_name} ${last_name}`], ["userEmail", email],
        ];
        entries.forEach(([k, v]) => { localStorage.setItem(k, v); sessionStorage.setItem(k, v); });
        window.dispatchEvent(new Event("storage"));
        if (role === "admin") router.push("/admin-dashboard");
        else if (role === "staff") router.push("/staff-dashboard");
        else router.push("/");
      } else if (res.status === 403) {
        showToast("Your account is pending admin approval. You'll be notified via email once approved.", "info");
      } else if (res.status === 401) {
        showToast("Invalid email, alumni ID, or password. Please try again.", "error");
      } else {
        showToast(data.error || data.message || "Login failed. Please try again.", "error");
      }
    } catch {
      showToast("Server connection failed. Make sure the backend is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020d1f] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-950 via-blue-900 to-[#020d1f] p-12 border-r border-blue-800/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-blue-500/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>
        <Link href="/" className="relative flex items-center gap-3">
          <img src="/nah.png" alt="Logo" className="h-10 w-9 object-contain" />
          <span className="text-xl font-bold"><span className="text-yellow-400">SCSIT</span> Alumni</span>
        </Link>
        <div className="relative">
          <GraduationCap size={64} className="text-yellow-400/60 mb-6" />
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Welcome back to<br />
            <span className="text-yellow-400">your community.</span>
          </h2>
          <p className="text-blue-300 text-lg">Connect with fellow alumni, discover events, and explore career opportunities.</p>
        </div>
        <p className="relative text-blue-500 text-sm"> {new Date().getFullYear()} SCSIT Alumni Association</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src="/nah.png" alt="Logo" className="h-9 w-8 object-contain" />
            <span className="text-xl font-bold"><span className="text-yellow-400">SCSIT</span> Alumni</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Sign in</h1>
            <p className="text-blue-400">Don't have an account? <Link href="/registration" className="text-yellow-400 hover:text-yellow-300 font-medium">Create one</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-blue-300 mb-2 font-medium">Email or Alumni ID</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                <input name="login" type="text" placeholder="you@example.com or Alu00000" value={form.login} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-blue-900/30 border border-blue-700/50 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-yellow-500/60 focus:bg-blue-900/50 transition-all"
                  required />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-blue-300 font-medium">Password</label>
                <Link href="/forgot-password" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                <input name="password" type={showPassword ? "text" : "password"} placeholder="**********" value={form.password} onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 bg-blue-900/30 border border-blue-700/50 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-yellow-500/60 focus:bg-blue-900/50 transition-all"
                  required />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-yellow-400 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30">
              {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-blue-400">
            <Link href="/" className="hover:text-blue-300 transition-colors">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Mail, KeyRound, Lock, ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { sendBackendEmailFromResponse } from "@/lib/send-backend-email";

const steps = [
  { icon: Mail, label: "Email", desc: "Enter your email" },
  { icon: ShieldCheck, label: "Verify", desc: "Enter the code" },
  { icon: Lock, label: "Reset", desc: "Set new password" },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(apiUrl("/api/forgot-password/"), { email });
      await sendBackendEmailFromResponse(data);
      alert("Verification code sent to your email!");
      setStep(2);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to send code");
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(apiUrl("/api/verify-code/"), { email, code });
      setStep(3);
    } catch (error: any) {
      alert(error.response?.data?.error || "Invalid or expired code");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Password must be at least 8 characters with uppercase, lowercase, number, and special character.");
      return;
    }
    if (newPassword !== confirmPassword) { alert("Passwords do not match"); return; }
    setLoading(true);
    try {
      await axios.post(apiUrl("/api/reset-password/"), {
        email, code, new_password: newPassword, confirm_password: confirmPassword,
      });
      alert("Password reset successfully!");
      router.push("/login");
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to reset password");
    } finally { setLoading(false); }
  };

  const StepIcon = steps[step - 1].icon;

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

        <div className="relative space-y-8">
          {/* Step progress visual */}
          <div className="space-y-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const state = i + 1 < step ? "done" : i + 1 === step ? "active" : "idle";
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all
                    ${state === "done" ? "bg-yellow-500 text-blue-950" :
                      state === "active" ? "bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400" :
                      "bg-blue-900/60 border border-blue-700/40 text-blue-500"}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${state === "active" ? "text-yellow-400" : state === "done" ? "text-white" : "text-blue-600"}`}>{s.label}</p>
                    <p className={`text-xs ${state === "active" ? "text-blue-300" : "text-blue-700"}`}>{s.desc}</p>
                  </div>
                  {state === "done" && <div className="ml-auto w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center"><span className="text-blue-950 text-xs font-bold">âœ“</span></div>}
                </div>
              );
            })}
          </div>

          <div>
            <h2 className="text-4xl font-extrabold text-white mb-3 leading-tight">
              Reset your<br /><span className="text-yellow-400">password.</span>
            </h2>
            <p className="text-blue-300">Follow the steps to securely recover access to your account.</p>
          </div>
        </div>

        <p className="relative text-blue-500 text-sm">© {new Date().getFullYear()} SCSIT Alumni Association</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src="/nah.png" alt="Logo" className="h-9 w-8 object-contain" />
            <span className="text-xl font-bold"><span className="text-yellow-400">SCSIT</span> Alumni</span>
          </Link>

          {/* Mobile step dots */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i + 1 === step ? "w-8 bg-yellow-500" : i + 1 < step ? "w-2 bg-yellow-500/60" : "w-2 bg-blue-800"}`} />
            ))}
          </div>

          {/* Card */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40">
            {/* Icon + heading */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/10">
                <StepIcon size={28} className="text-yellow-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">{steps[step - 1].label}</h1>
              <p className="text-blue-400 text-sm mt-1 text-center">{steps[step - 1].desc}</p>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-5">
                <p className="text-blue-300 text-sm text-center -mt-4 mb-2">We'll send a verification code to your email address.</p>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-blue-900/30 border border-blue-700/50 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-yellow-500/60 focus:bg-blue-900/50 transition-all"
                    required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
                  {loading ? "Sending..." : <><span>Send Code</span><ArrowRight size={18} /></>}
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <p className="text-blue-300 text-sm text-center -mt-4 mb-2">
                  Code sent to <span className="text-yellow-400 font-medium">{email}</span>
                </p>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input type="text" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3.5 bg-blue-900/30 border border-blue-700/50 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-yellow-500/60 focus:bg-blue-900/50 transition-all text-center tracking-[0.4em] text-lg font-bold"
                    required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
                  {loading ? "Verifying..." : <><span>Verify Code</span><ArrowRight size={18} /></>}
                </button>
                <button type="button" onClick={() => setStep(1)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-blue-400 hover:text-yellow-400 text-sm transition-colors">
                  <RotateCcw size={14} /><span>Resend Code</span>
                </button>
              </form>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <p className="text-blue-300 text-sm text-center -mt-4 mb-2">Choose a strong new password for your account.</p>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-blue-900/30 border border-blue-700/50 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-yellow-500/60 focus:bg-blue-900/50 transition-all"
                    required />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-blue-900/30 border border-blue-700/50 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-yellow-500/60 focus:bg-blue-900/50 transition-all"
                    required />
                </div>
                <p className="text-xs text-blue-500">8+ chars, uppercase, lowercase,number, special character</p>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
                  {loading ? "Resetting..." : <><span>Reset Password</span><ArrowRight size={18} /></>}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-blue-400">
            <Link href="/login" className="hover:text-blue-300 transition-colors"> Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

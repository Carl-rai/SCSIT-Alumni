"use client";

import { useState, useRef } from "react";
import Header from "../components/header";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function Page() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "Male",
    age: "",
    course: "",
    year_graduate: "",
    password: "",
    confirm_password: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasAlumniId, setHasAlumniId] = useState<boolean | null>(null);
  const [studentId, setStudentId] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "taken">("idle");
  const [emailError, setEmailError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["" ,"", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      setEmailStatus("idle");
      setEmailError("");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value) return;
      if (!emailRegex.test(value)) {
        setEmailStatus("invalid");
        setEmailError("Please enter a valid email address.");
        return;
      }
      setEmailStatus("checking");
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(apiUrl("/api/check-email/"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: value }),
          });
          if (res.status === 409) {
            setEmailStatus("taken");
            setEmailError("This email is already registered.");
          } else if (res.ok) {
            setEmailStatus("valid");
            setEmailError("");
          }
        } catch {
          setEmailStatus("idle");
        }
      }, 600);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (emailStatus !== "valid") return;
    setSendingOtp(true);
    setOtpError("");
    try {
      const res = await fetch(apiUrl("/api/send-registration-otp/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (res.ok) {
        setOtpSent(true);
        setOtpDigits(["", "", "", "", "", ""]);
        setShowOtpModal(true);
        startResendTimer();
      } else {
        const data = await res.json();
        setOtpError(data.error || "Failed to send code.");
      }
    } catch {
      setOtpError("Server error. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length < 6) { setOtpError("Please enter the full 6-digit code."); return; }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(apiUrl("/api/verify-registration-otp/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });
      if (res.ok) {
        setEmailVerified(true);
        setShowOtpModal(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        const data = await res.json();
        setOtpError(data.error || "Invalid code.");
      }
    } catch {
      setOtpError("Server error. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailStatus === "invalid" || emailStatus === "taken" || emailStatus === "checking") {
      alert(emailError || "Please wait for email validation to complete.");
      return;
    }
    if (emailStatus !== "valid") {
      alert("Please enter a valid email address.");
      return;
    }
    if (!emailVerified) {
      alert("Please verify your email address before proceeding.");
      return;
    }
    setShowPopup(true);
  };

  const handlePopupChoice = (choice: boolean) => {
    setHasAlumniId(choice);
    if (!choice) {
      setStudentId("");
    }
    setShowPopup(false);
  };

  const handleFinalSubmit = async () => {
    if (hasAlumniId === null) {
      alert("Please select if you have an Alumni ID");
      return;
    }

    if (hasAlumniId && !studentId) {
      alert("Please enter your Alumni ID");
      return;
    }

    if (
      !form.email ||
      !form.first_name ||
      !form.last_name ||
      !form.age ||
      !form.course ||
      !form.year_graduate ||
      !form.password ||
      !form.confirm_password
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      alert("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      const res = await fetch(apiUrl("/api/register/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          alumni_id: hasAlumniId ? studentId : ""
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const message = hasAlumniId 
          ? "Registration Successful!\n\nPlease wait for admin approval on your email."
          : "Registration Successful!\n\nPlease wait for admin approval together with your ID.";
        alert(message);
        router.push("/login");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert(
        "Server connection failed. Make sure the backend is running."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#020d1f] text-gray-100 flex flex-col">
      
      {/* âœ… HEADER */}
      <header>
        <Header />
      </header>

      {/* âœ… MAIN */}
      <main className="flex-1 flex items-center justify-center relative px-4 py-16 ">
        
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 left-6 bg-blue-900/60 hover:bg-yellow-400 hover:text-blue-950 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          Back
        </button>

        {/* Registration Card */}
        <div className="w-full max-w-4xl bg-blue-900/40 backdrop-blur-lg border border-blue-700/40 rounded-2xl p-10 shadow-2xl">
          <h2 className="text-4xl font-bold text-center mb-8">
            <span className="text-yellow-400">Alumni</span> Registration
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-6"
          >
            <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="input" required />
            <input name="middle_name" placeholder="Middle Initial (Optional)" value={form.middle_name} onChange={handleChange} className="input" />
            <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="input" required />
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input name="email" type="email" placeholder="Email" value={form.email} onChange={(e) => { setEmailVerified(false); setOtpSent(false); handleChange(e); }}
                    className={`input pr-10 ${
                      emailVerified ? "border-green-500/60" :
                      emailStatus === "valid" ? "border-blue-400/60" :
                      emailStatus === "invalid" || emailStatus === "taken" ? "border-red-500/60" : ""
                    }`} required />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === "checking" && <Loader size={16} className="text-blue-400 animate-spin" />}
                    {emailVerified && <CheckCircle size={16} className="text-green-400" />}
                    {!emailVerified && emailStatus === "valid" && <Mail size={16} className="text-blue-400" />}
                    {(emailStatus === "invalid" || emailStatus === "taken") && <XCircle size={16} className="text-red-400" />}
                  </div>
                </div>
                {emailStatus === "valid" && !emailVerified && (
                  <button type="button" onClick={handleSendOtp} disabled={sendingOtp}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1">
                    {sendingOtp ? <Loader size={12} className="animate-spin" /> : <Mail size={12} />}
                    {otpSent ? "Resend" : "Verify"}
                  </button>
                )}
                {emailVerified && (
                  <div className="flex items-center gap-1 px-3 text-green-400 text-xs font-bold">
                    <ShieldCheck size={16} /> Verified
                  </div>
                )}
              </div>
              {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
              {!emailVerified && emailStatus === "valid" && !otpSent && (
                <p className="text-blue-300 text-xs mt-1">Click &quot;Verify&quot; to send a verification code to your email.</p>
              )}
            </div>
            
            <select name="gender" value={form.gender} onChange={handleChange} className="input" required>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} className="input" required />
            <input name="course" placeholder="Course" value={form.course} onChange={handleChange} className="input" required />
            <input name="year_graduate"
              
              placeholder="Year Graduated"
              value={form.year_graduate}
              onChange={handleChange}
              min="1950"
              max={new Date().getFullYear()}
              className="input"
              required
            />
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="input pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-yellow-400 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <input
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirm_password}
                onChange={handleChange}
                className="input pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-yellow-400 transition-colors"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="md:col-span-2 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-4 rounded-xl transition-all"
            >
              Register Now
            </button>
          </form>

          <p className="text-center mt-6 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-yellow-400 cursor-pointer hover:underline"
            >
              Login here
            </span>
          </p>
        </div>
      </main>

      {/* Popup Modal */}
{showPopup && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    
    <div className="relative bg-blue-900 border border-blue-700/40 rounded-2xl p-8 max-w-md mx-4">

      {/* Back Arrow */}
      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-4 left-4 text-yellow-400 text-xl hover:text-yellow-300"
      >
        â†
      </button>

      <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
        Alumni ID
      </h3>

      <p className="text-gray-200 mb-6 text-center">
        Do you already have an Alumni ID?
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => handlePopupChoice(true)}
          className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-3 rounded-xl transition-all"
        >
          Yes
        </button>

        <button
          onClick={() => handlePopupChoice(false)}
          className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all"
        >
          No
        </button>
      </div>

    </div>
  </div>
)}
      {/* Alumni ID Input Popup */}
{hasAlumniId === true && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    
    <div className="relative bg-blue-900 border border-blue-700/40 rounded-2xl p-8 max-w-md mx-4">
      
      {/* Back Arrow */}
      <button
        onClick={() => setHasAlumniId(null)}
        className="absolute top-4 left-4 text-yellow-400 text-xl hover:text-yellow-300"
      >
        â†
      </button>

      <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
        Enter Alumni ID
      </h3>

      <input
        type="text"
        placeholder="Alumni ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="w-full p-4 rounded-xl bg-blue-800/50 border border-blue-700/40 text-white mb-4"
      />

      <button
        onClick={handleFinalSubmit}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-3 rounded-xl transition-all"
      >
        Submit Registration
      </button>

    </div>
  </div>
)}

      {/* No Alumni ID - Direct Submit */}
      {hasAlumniId === false && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleFinalSubmit}
            className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
          >
            Submit Registration
          </button>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowOtpModal(false)} />

          <div className="relative z-10 w-full max-w-sm mx-4">
            {/* Glow ring */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400 opacity-40 blur-lg animate-pulse" />

            <div className="relative bg-[#0a1628] border border-blue-700/50 rounded-2xl p-8 shadow-2xl">
              {/* Close */}
              <button onClick={() => setShowOtpModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-lg">âœ•</button>

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-yellow-500 flex items-center justify-center shadow-lg">
                  <ShieldCheck size={32} className="text-white" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center text-white mb-1">Verify Your Email</h3>
              <p className="text-gray-400 text-sm text-center mb-1">We sent a 6-digit code to</p>
              <p className="text-yellow-400 text-sm font-semibold text-center mb-6 truncate">{form.email}</p>

              {/* OTP Digit Inputs */}
              <div className="flex justify-center gap-3 mb-5">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigit(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 bg-blue-900/40 text-white transition-all focus:outline-none ${
                      otpError ? "border-red-500" :
                      digit ? "border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]" :
                      "border-blue-600/60 focus:border-yellow-400"
                    }`}
                    style={{ padding: "10px 0" }}
                  />
                ))}
              </div>

              {otpError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 mb-4">
                  <XCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-xs">{otpError}</p>
                </div>
              )}

              <button onClick={handleVerifyOtp} disabled={otpLoading || otpDigits.join("").length < 6}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 disabled:opacity-50 text-blue-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mb-4">
                {otpLoading ? <><Loader size={16} className="animate-spin" /> Verifying...</> : <><ShieldCheck size={16} /> Confirm Code</>}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-gray-500 text-xs">Resend code in <span className="text-yellow-400 font-semibold">{resendTimer}s</span></p>
                ) : (
                  <button onClick={handleSendOtp} disabled={sendingOtp}
                    className="text-blue-400 hover:text-blue-300 text-xs underline transition-colors disabled:opacity-50">
                    {sendingOtp ? "Sending..." : "Resend verification code"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: rgba(30, 58, 138, 0.5);
          border: 1px solid rgba(59, 130, 246, 0.5);
          color: white;
        }
        .input:focus {
          outline: none;
          border-color: #facc15;
        }
      `}</style>
    </div>
  );
}


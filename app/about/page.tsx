"use client";

import Link from "next/link";
import Footer from "../components/footer";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";

const missionItems = [
  "Strengthen connections among SCSIT alumni through meaningful engagement and collaboration.",
  "Support the professional growth and development of fellow graduates through mentorship, networking, and opportunities.",
  "Actively contribute to the advancement of SCSIT and its students by sharing expertise, resources, and experiences.",
  "Embody the values of excellence, service, and integrity in our respective fields and communities.",
];

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("accessToken"));
  }, []);

  return (
    <div className="min-h-screen bg-[#001F3F] text-gray-100 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-block px-4 py-1 mb-6 text-xs font-semibold tracking-widest uppercase bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 rounded-full">
            SCSIT Alumni Community
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
              Us
            </span>
          </h1>
          <p className="text-lg text-blue-200/80 leading-relaxed">
            The Salazar Colleges of Science and Institute of Technology (SCSIT) is more than an
            educational institution — it is a{" "}
            <span className="text-yellow-400 font-semibold">lifelong community</span> built on
            resilience, service, and excellence.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <div className="w-px h-10 bg-gradient-to-b from-yellow-400 to-transparent" />
          <span className="text-xs text-yellow-400 tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            🌟 <span className="text-yellow-400">Who We Are</span>
          </h2>
          <p className="text-blue-100/80 leading-relaxed mb-4">
            Founded on humble beginnings and driven by a mission to make quality education
            accessible, SCSIT has continuously empowered generations of students to achieve their
            dreams and become globally competitive professionals.
          </p>
          <p className="text-blue-100/80 leading-relaxed mb-4">
            As alumni, we are a testament to the institution's commitment to nurturing{" "}
            <span className="text-yellow-300 font-medium">competence</span>,{" "}
            <span className="text-yellow-300 font-medium">integrity</span>, and{" "}
            <span className="text-yellow-300 font-medium">perseverance</span>. From classrooms to
            careers, SCSIT has shaped us into individuals who contribute meaningfully to society.
          </p>
          <p className="text-blue-100/80 leading-relaxed">
            The SCSIT Alumni community continues this legacy by fostering strong connections,
            supporting one another's growth, and giving back to the institution that helped shape
            our futures.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-700/50 to-transparent" />
      </div>

      {/* Vision Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="relative bg-gradient-to-br from-yellow-400/10 to-blue-900/30 border border-yellow-400/20 rounded-3xl p-10 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-400/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1 mb-6 text-xs font-semibold tracking-widest uppercase bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 rounded-full">
              🎯 Our Vision
            </span>
            <h2 className="text-3xl font-bold mb-4 text-white">Alumni-Aligned Vision</h2>
            <p className="text-blue-100/80 leading-relaxed text-lg">
              To be a{" "}
              <span className="text-yellow-400 font-semibold">united and empowered</span> alumni
              community that upholds the ideals of SCSIT — producing world-class professionals
              committed to{" "}
              <span className="text-yellow-400 font-semibold">
                lifelong learning, leadership, and service
              </span>{" "}
              to society.
            </p>
            <p className="mt-4 text-sm text-blue-300/50 italic">
              Inspired by SCSIT's vision of developing world-class graduates with opportunities for
              professional growth.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 mb-4 text-xs font-semibold tracking-widest uppercase bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full">
            🚀 Our Mission
          </span>
          <h2 className="text-3xl font-bold">
            What We <span className="text-yellow-400">Stand For</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {missionItems.map((item, index) => (
            <div
              key={index}
              className="group flex gap-4 bg-blue-900/20 border border-blue-700/30 rounded-2xl p-6 hover:border-yellow-400/40 hover:bg-blue-800/20 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold group-hover:bg-yellow-400/20 transition-all">
                {index + 1}
              </div>
              <p className="text-blue-100/80 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-blue-300/50 italic">
          Adapted from SCSIT's mission of enhancing competencies, sustaining quality engagement, and
          strengthening graduate performance.
        </p>
      </section>

      {/* CTA — hidden when logged in */}
      {!isLoggedIn && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="relative bg-gradient-to-r from-blue-900/50 to-blue-800/30 border border-blue-700/40 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />
            <h2 className="relative text-3xl font-bold mb-4">
              Be Part of the <span className="text-yellow-400">Legacy</span>
            </h2>
            <p className="relative text-blue-200/70 mb-8 max-w-xl mx-auto">
              Join thousands of SCSIT alumni who are making a difference. Connect, grow, and give back
              to the community that shaped you.
            </p>
            <div className="relative flex flex-wrap justify-center gap-4">
              <Link
                href="/registration"
                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20"
              >
                Join the Community
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-blue-900/60 hover:bg-blue-800/60 border border-blue-700/40 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

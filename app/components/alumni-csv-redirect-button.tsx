"use client";

import { useState } from "react";
import { FileSpreadsheet, LoaderCircle } from "lucide-react";
import { API_PATHS } from "@/lib/api";

type AlumniCsvRedirectButtonProps = {
  className?: string;
  label?: string;
};

export default function AlumniCsvRedirectButton({
  className = "",
  label = "Alumni Records",
}: AlumniCsvRedirectButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRedirect = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(API_PATHS.alumniCsvUploads);
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        alert("Failed to load the latest CSV file.");
        return;
      }

      const latestUpload = Array.isArray(data) ? data[0] : null;
      const csvUrl = latestUpload?.csv_file_url;

      if (!csvUrl) {
        alert("No CSV file has been uploaded yet.");
        return;
      }

      window.location.href = csvUrl;
    } catch {
      alert("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRedirect}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {loading ? <LoaderCircle size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
      {loading ? "Loading CSV..." : label}
    </button>
  );
}

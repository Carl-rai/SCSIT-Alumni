"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileSpreadsheet, ExternalLink, RefreshCw, Trash2, X } from "lucide-react";
import { apiUrl, proxyApiUrl } from "@/lib/api";

type AlumniCsvUploadItem = {
  id: number;
  title?: string | null;
  csv_file_name?: string | null;
  csv_file_url?: string | null;
  uploaded_at?: string;
};

type AlumniCsvUploadButtonProps = {
  className?: string;
  label?: string;
  onUploaded?: () => void;
  showDelete?: boolean;
};

export default function AlumniCsvUploadButton({
  className = "",
  label = "Upload Alumni Records CSV File",
  onUploaded,
  showDelete = true,
}: AlumniCsvUploadButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState<AlumniCsvUploadItem[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getOpenUrl = (upload: AlumniCsvUploadItem) =>
    apiUrl(`/api/alumni-csv-uploads/${upload.id}/open/`);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await fetch(apiUrl("/api/token/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access) return null;

    localStorage.setItem("accessToken", data.access);
    sessionStorage.setItem("accessToken", data.access);
    window.dispatchEvent(new Event("storage"));
    return data.access as string;
  };

  const resetForm = () => {
    setTitle("");
    setFile(null);
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const closeModal = () => {
    if (uploading) return;
    setOpen(false);
    resetForm();
  };

  const fetchUploads = async () => {
    setLoadingUploads(true);
    try {
      const res = await fetch(proxyApiUrl("/api/alumni-csv-uploads/"));
      const data = await res.json().catch(() => []);
      if (res.ok && Array.isArray(data)) {
        setUploads(data);
      } else {
        setUploads([]);
      }
    } catch {
      setUploads([]);
    } finally {
      setLoadingUploads(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUploads();
    }
  }, [open]);

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a CSV file.");
      return;
    }

    const formData = new FormData();
    if (title.trim()) formData.append("title", title.trim());
    formData.append("csv_file", file);

    setUploading(true);
    setError("");

    try {
      const res = await fetch(proxyApiUrl("/api/alumni-csv-uploads/"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data?.csv_file?.[0] ||
          data?.title?.[0] ||
          data?.detail ||
          data?.error ||
          "Failed to upload CSV.";
        setError(message);
        return;
      }

      alert("CSV uploaded successfully.");
      resetForm();
      await fetchUploads();
      onUploaded?.();
    } catch {
      setError("Server connection failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (uploadId: number) => {
    if (!confirm("Delete this CSV upload?")) return;

    try {
      const doDelete = async (token?: string | null) =>
        fetch(proxyApiUrl(`/api/alumni-csv-uploads/${uploadId}/`), {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : getAuthHeaders(),
        });

      let res = await doDelete(localStorage.getItem("accessToken"));

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          res = await doDelete(newToken);
        }
      }

      if (!res.ok) {
        if (res.status === 401) {
          alert("Your session expired. Please log in again.");
          return;
        }
        alert("Failed to delete CSV upload.");
        return;
      }

      await fetchUploads();
      onUploaded?.();
    } catch {
      alert("Server connection failed.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-lg transition-all text-sm font-medium ${className}`}
      >
        <Upload size={15} /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/20 bg-[#0a1628] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <FileSpreadsheet size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Upload Alumni CSV</h3>
                  <p className="text-xs text-blue-300">Store a CSV file</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close upload dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Optional record name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">CSV File</label>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-400"
                />
                <p className="mt-2 text-xs text-gray-500">Accepted format: .csv</p>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Uploaded CSV Files</h4>
                    <p className="text-xs text-gray-400">Click a file to open it.</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchUploads}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/10"
                  >
                    <RefreshCw size={12} className={loadingUploads ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {loadingUploads ? (
                    <p className="text-sm text-gray-400">Loading uploaded files...</p>
                  ) : uploads.length === 0 ? (
                    <p className="text-sm text-gray-500">No CSV files uploaded yet.</p>
                  ) : (
                    uploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-200 transition-colors hover:bg-emerald-500/10"
                      >
                        <a
                          href={getOpenUrl(upload)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 flex-1 items-center justify-between gap-3"
                        >
                          <span className="min-w-0 truncate">
                            {upload.csv_file_name?.trim() || upload.title?.trim() || "CSV file"}
                          </span>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-300">
                            Open <ExternalLink size={12} />
                          </span>
                        </a>
                        {showDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(upload.id)}
                            className="flex shrink-0 items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
                            aria-label={`Delete ${upload.csv_file_name?.trim() || upload.title?.trim() || "CSV file"}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-gray-200 transition-colors hover:bg-white/10"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { Save, Sparkles, UserPen, X } from "lucide-react";
import { apiUrl } from "@/lib/api";

export type EditableUser = {
  id: number;
  alumni_id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  age: number;
  course: string;
  year_graduate: number;
  status?: string;
  profile_image?: string | null;
};

export type AlumniRecord = {
  alumni_id: string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  gender?: string;
  year_graduate: number;
  category?: { id: number; name: string } | null;
};

type UserEditModalProps = {
  open: boolean;
  user: EditableUser | null;
  alumniRecords: AlumniRecord[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

const emptyForm = {
  alumni_id: "",
  email: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "Male",
  age: "",
  course: "",
  year_graduate: "",
};

const normalize = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

export default function UserEditModal({ open, user, alumniRecords, onClose, onSaved }: UserEditModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [recordSearch, setRecordSearch] = useState("");

  useEffect(() => {
    if (open && user) {
      setForm({
        alumni_id: user.alumni_id || "",
        email: user.email || "",
        first_name: user.first_name || "",
        middle_name: user.middle_name || "",
        last_name: user.last_name || "",
        gender: user.gender || "Male",
        age: user.age?.toString() || "",
        course: user.course || "",
        year_graduate: user.year_graduate?.toString() || "",
      });
      setError("");
    }
    if (!open) {
      setForm(emptyForm);
      setError("");
      setSaving(false);
      setRecordSearch("");
    }
  }, [open, user]);

  if (!open || !user) return null;

  const matchingRecord = alumniRecords.find((record) =>
    normalize(record.alumni_id) === normalize(form.alumni_id) &&
    normalize(record.category?.name) === normalize(form.course) &&
    String(record.year_graduate || "") === String(form.year_graduate || "")
  );

  const visibleRecords = alumniRecords.filter((record) => {
    const search = normalize(recordSearch);
    if (!search) return true;
    const name = [record.first_name, record.middle_name, record.last_name].filter(Boolean).join(" ");
    return [
      record.alumni_id,
      name,
      record.category?.name,
      record.year_graduate,
    ].some((value) => normalize(value).includes(search));
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.alumni_id.trim()) return setError("Alumni ID is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!form.first_name.trim()) return setError("First name is required.");
    if (!form.last_name.trim()) return setError("Last name is required.");
    if (!form.course.trim()) return setError("Course is required.");
    if (!form.year_graduate.trim()) return setError("Year graduated is required.");
    if (!form.age.trim()) return setError("Age is required.");

    setSaving(true);
    setError("");

    try {
      const res = await fetch(apiUrl(`/api/users/${user.id}/update/`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumni_id: form.alumni_id.trim(),
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          middle_name: form.middle_name.trim() || null,
          last_name: form.last_name.trim(),
          gender: form.gender,
          age: Number(form.age),
          course: form.course.trim(),
          year_graduate: Number(form.year_graduate),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || "Failed to update user."); return; }

      await onSaved();
      onClose();
    } catch {
      setError("Server connection failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={saving ? undefined : onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-blue-500/20 bg-[#0a1628] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
              <UserPen size={18} className="text-blue-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edit Alumni</h3>
              <p className="text-xs text-blue-300">Update the user — right side shows the matched CSV record</p>
            </div>
          </div>
          <button
            type="button"
            onClick={saving ? undefined : onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close edit dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1">
          <div className="grid min-h-full gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">

            {/* LEFT — editable form */}
            <section className="flex min-h-0 max-h-[calc(90vh-10rem)] flex-col rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Edit User Data</p>
                <h4 className="mt-1 text-base font-bold text-white">Update fields below</h4>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="grid gap-4">
                  {[
                    { label: "Alumni ID", name: "alumni_id", type: "text", placeholder: "0000-0000" },
                    { label: "Email", name: "email", type: "email", placeholder: "email@example.com" },
                    { label: "First Name", name: "first_name", type: "text", placeholder: "First name" },
                    { label: "Middle Name", name: "middle_name", type: "text", placeholder: "Middle name (optional)" },
                    { label: "Last Name", name: "last_name", type: "text", placeholder: "Last name" },
                    { label: "Age", name: "age", type: "number", placeholder: "Age" },
                    { label: "Course", name: "course", type: "text", placeholder: "e.g. BSIT" },
                    { label: "Year Graduated", name: "year_graduate", type: "number", placeholder: "e.g. 2023" },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">{label}</p>
                      <input
                        name={name}
                        type={type}
                        value={(form as Record<string, string>)[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="mt-1 w-full bg-transparent text-sm text-white outline-none placeholder-gray-500"
                      />
                    </div>
                  ))}
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">Gender</p>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="mt-1 w-full bg-transparent text-sm text-white outline-none"
                    >
                      <option value="Male" className="text-black">Male</option>
                      <option value="Female" className="text-black">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT — read-only CSV record data */}
            <aside className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">CSV Alumni Record</p>
                  <h4 className="mt-1 text-base font-bold text-white">Matched record data</h4>
                </div>
                <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium border ${
                  matchingRecord
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-orange-500/30 bg-orange-500/10 text-orange-400"
                }`}>
                  <Sparkles size={12} />
                  {matchingRecord ? "Matched" : "No Match"}
                </div>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                  placeholder="Search CSV by ID, name, course, or year"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-400/60"
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {visibleRecords.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                    <p className="text-orange-400 text-sm font-medium">No CSV records match your search</p>
                    <p className="text-gray-500 text-xs">Upload a CSV file or clear the search box to view all rows.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="max-h-[54vh] overflow-auto">
                      <table className="min-w-full text-left">
                        <thead className="sticky top-0 bg-[#0f1c33] text-[10px] uppercase tracking-[0.22em] text-blue-300">
                          <tr>
                            <th className="px-4 py-3">Alumni ID</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Gender</th>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3">Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRecords.map((record) => {
                            const rowName = [record.first_name, record.middle_name, record.last_name].filter(Boolean).join(" ");
                            const isMatch =
                              normalize(record.alumni_id) === normalize(form.alumni_id) &&
                              normalize(record.category?.name) === normalize(form.course) &&
                              String(record.year_graduate || "") === String(form.year_graduate || "");

                            return (
                              <tr
                                key={`${record.alumni_id}-${record.year_graduate}-${record.category?.id ?? "na"}`}
                                className={isMatch ? "bg-blue-500/10" : "border-t border-white/5"}
                              >
                                <td className="px-4 py-3 text-xs font-mono text-white">{record.alumni_id || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-200">{rowName || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{record.gender || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{record.category?.name || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{record.year_graduate || "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : (
              <span className="inline-flex items-center justify-center gap-2">
                <Save size={15} /> Save Changes
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

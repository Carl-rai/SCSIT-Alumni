const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://alumni-backend-2wpy.onrender.com";

export const API_PATHS = {
  alumniCsvUploads: "/api/alumni-csv-uploads/",
  alumniCsvUploadOpen: (uploadId: number | string) => `/api/alumni-csv-uploads/${uploadId}/open/`,
  alumniCsvUploadDetail: (uploadId: number | string) => `/api/alumni-csv-uploads/${uploadId}/`,
  auditLogs: "/api/audit-logs/?limit=250",
} as const;

export function apiUrl(path: string) {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }

  return `${API_BASE_URL}${path}`;
}

export function proxyApiUrl(path: string) {
  const cleanedPath = path
    .replace(/^\/api\//, "")
    .replace(/^\/+/, "");

  return `/api/backend/${cleanedPath}`;
}

export { API_BASE_URL };

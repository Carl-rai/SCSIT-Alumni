const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://alumni-backend-2wpy.onrender.com";

export function apiUrl(path: string) {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }

  return `${API_BASE_URL}${path}`;
}

export { API_BASE_URL };

"use client";

import { useLayoutEffect } from "react";

export default function AuditFetchProvider() {
  useLayoutEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const method = (init.method || (input instanceof Request ? input.method : "GET") || "GET").toUpperCase();
      const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";
      const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || "";
      const name = localStorage.getItem("userName") || sessionStorage.getItem("userName") || "";
      const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail") || "";

      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
        if (role && !headers.has("X-Actor-Role")) {
          headers.set("X-Actor-Role", role);
        }
        if (name && !headers.has("X-Actor-Name")) {
          headers.set("X-Actor-Name", name);
        }
        if (email && !headers.has("X-Actor-Email")) {
          headers.set("X-Actor-Email", email);
        }
      }

      return originalFetch(input, { ...init, headers });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

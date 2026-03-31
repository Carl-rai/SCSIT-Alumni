"use client";

import { useEffect } from "react";

const AUTH_KEYS = ["accessToken", "refreshToken", "userRole", "userName", "userEmail"];

export default function AuthGuard() {
  useEffect(() => {
    const sessionToken = sessionStorage.getItem("accessToken");

    if (!sessionToken) {
      // Browser was closed — clear localStorage to force logout
      AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    } else {
      // Active session — sync sessionStorage → localStorage so all existing reads work
      AUTH_KEYS.forEach((key) => {
        const val = sessionStorage.getItem(key);
        if (val) localStorage.setItem(key, val);
        else localStorage.removeItem(key);
      });
    }
  }, []);

  return null;
}

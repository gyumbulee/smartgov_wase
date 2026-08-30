import axios from "axios";

// Central API client — talks to the Laravel backend at NEXT_PUBLIC_API_URL.
// Never trust frontend-only state for auth or payment confirmation;
// the backend is always the source of truth (spec §7, §11).
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("smartgov_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

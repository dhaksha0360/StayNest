import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: { Accept: "application/json" },
});
api.interceptors.request.use((c) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("staynest_token");
    if (token) c.headers.Authorization = `Bearer ${token}`;
  }
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("staynest_token");
      localStorage.removeItem("staynest_user");
    }
    return Promise.reject(e);
  },
);
export const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );
export const imageUrl = (path?: string) =>
  path?.startsWith("http")
    ? path
    : path
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/storage/${path}`
      : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

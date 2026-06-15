// API base-URL — instelbaar via .env (EXPO_PUBLIC_API_BASE_URL).
// Fallback op het dev-backend-IP zodat de app/tests zonder .env blijven werken.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://145.24.237.97/api";

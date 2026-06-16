/**
 * Auth service for client-side auth checks.
 *
 * Centralizes the `/api/auth/me` calls. Uses apiClient so all
 * requests go through the shared interceptors.
 */
import apiClient from "../apiClient";

interface AuthMeResponse {
  userId: string;
  accessToken: string;
  userName?: string;
  avatar?: string;
  role?: string;
}

/**
 * Fetch the current authenticated user's info from the Next.js API route.
 * Returns null if the user is not authenticated.
 *
 * Note: Uses a direct URL (not baseURL) since `/api/auth/me` is a
 * Next.js internal route, not the backend API.
 */
export async function getCurrentUser(): Promise<AuthMeResponse | null> {
  try {
    const res = await apiClient.get<AuthMeResponse>("/api/auth/me", {
      baseURL: "", // override baseURL to hit the Next.js internal route
    });
    if (res.data?.userId) {
      return res.data;
    }
    return null;
  } catch {
    return null;
  }
}

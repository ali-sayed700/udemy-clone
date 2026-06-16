/**
 * Shared Axios interceptor logic for auth token management.
 *
 * Both the REST `apiClient` and the GraphQL `graphqlClient` use this
 * module so the token-caching, auto-attach, and 401-handling logic
 * lives in exactly one place.
 */
import type { AxiosInstance } from "axios";
import { deleteSession } from "../session";

// ── Token cache (client-side only) ──
let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;

async function getClientToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  if (tokenFetchPromise) return tokenFetchPromise;

  tokenFetchPromise = (async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          cachedToken = data.accessToken as string;
          return cachedToken;
        }
      }
    } catch {
      // silently fail — unauthenticated requests are OK for public endpoints
    }
    return null;
  })();

  const token = await tokenFetchPromise;
  tokenFetchPromise = null;
  return token;
}

/** Clear the cached token (call on logout or 401). */
export function clearCachedToken() {
  cachedToken = null;
  tokenFetchPromise = null;
}

/**
 * Attach request + response interceptors to an Axios instance.
 *
 * - Request: auto-attaches `Authorization: Bearer <token>` client-side.
 * - Response: clears token + session on 401 errors.
 */
export function attachAuthInterceptors(instance: AxiosInstance): void {
  // Request interceptor — attach auth token client-side
  instance.interceptors.request.use(async (config) => {
    if (typeof window !== "undefined" && !config.headers.Authorization) {
      const token = await getClientToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Response interceptor — handle 401 errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        clearCachedToken();
        if (typeof window !== "undefined") {
          await deleteSession();
        }
      }
      return Promise.reject(error);
    },
  );
}

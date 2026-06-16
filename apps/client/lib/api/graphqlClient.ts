/**
 * Axios client for GraphQL requests.
 *
 * Targets the `/graphql` endpoint on the backend.
 * Used by client-side hooks (useCourseDetails, useLoadCourseData, etc.)
 * and server-side actions via `getApiClient()`.
 */
import axios from "axios";
import { getSession } from "../session";
import { GRAPHQL_ENDPOINT } from "../constants";
import { attachAuthInterceptors } from "./interceptors";

export const graphqlClient = axios.create({
  baseURL: GRAPHQL_ENDPOINT,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 5000,
});

// Attach shared auth interceptors (client-side token caching + 401 handling)
attachAuthInterceptors(graphqlClient);

/**
 * Get the GraphQL Axios client with server-side auth pre-configured.
 * On the server, reads the session cookie and sets the Authorization header.
 * On the client, the interceptor handles token attachment automatically.
 */
export async function getApiClient() {
  if (typeof window === "undefined") {
    const session = await getSession();
    graphqlClient.defaults.headers.Authorization = session
      ? `Bearer ${session?.accessToken}`
      : "";
  }

  return graphqlClient;
}

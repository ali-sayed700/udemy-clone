/**
 * Axios client for REST API calls (non-GraphQL).
 *
 * Targets the backend REST endpoints (e.g. /payment/*, /files-upload/*).
 * Uses the shared auth interceptors from interceptors.ts.
 */
import axios from "axios";
import { API_URL } from "../constants";
import { attachAuthInterceptors } from "./interceptors";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 60000,
});

// Attach shared auth interceptors (client-side token caching + 401 handling)
attachAuthInterceptors(apiClient);

export default apiClient;

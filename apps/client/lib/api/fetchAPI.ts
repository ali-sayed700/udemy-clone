import axios, { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";

interface RequestConfig extends AxiosRequestConfig {
  data?: unknown;
}

/**
 * Generic reusable REST API client using the shared apiClient.
 * Handles common REST operations with error handling and logging.
 */
export async function fetchAPI<T = unknown>(
  url: string,
  config?: RequestConfig,
): Promise<T> {
  try {
    const response = await apiClient({
      url,
      method: config?.method || "GET",
      ...config,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * POST request helper
 */
export function postAPI<T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<T> {
  return fetchAPI<T>(url, {
    ...config,
    method: "POST",
    data,
  });
}

/**
 * Centralized constants for the client application.
 */

// ── API Configuration ──
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const GRAPHQL_ENDPOINT = `${API_URL}/graphql`;

// ── Payment ──
export const PAYPAL_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD";

export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

/**
 * Barrel export for the API layer.
 *
 * Provides a clean public API so consumers can import from `@/lib/api`
 * instead of reaching into specific files.
 */

// ── Axios Clients ──
export { default as apiClient } from "./apiClient";
export { graphqlClient, getApiClient } from "./graphqlClient";

// ── Interceptors ──
export { clearCachedToken } from "./interceptors";

// ── Server-side GraphQL ──
export { fetchGraphqlServer, authFetchGraphQL } from "./fetchGraphqlServer";

// ── Services ──
export { getCurrentUser } from "./services/auth.service";
export {
  createStripeCheckout,
  confirmStripePayment,
  createPayPalOrder,
  capturePayPalOrder,
} from "./services/payment.service";
export {
  markLectureViewed,
  markLectureCompleted,
} from "./services/progress.service";
export { uploadImage, uploadVideo } from "./services/upload.service";

/**
 * Payment service — centralizes all Stripe and PayPal REST API calls.
 *
 * Replaces raw fetch() calls in useCheckout.ts, useCoursePayment.ts,
 * and payment-success/page.tsx.
 */
import apiClient from "../apiClient";

interface CheckoutItem {
  courseId: string | undefined;
  title: string;
  price: number;
  image?: string;
}

interface StripeCheckoutResponse {
  url: string;
}

interface PayPalCreateOrderResponse {
  orderId: string;
}

interface PayPalCaptureResponse {
  status: string;
  paymentId: string;
}

/**
 * Create a Stripe checkout session.
 */
export async function createStripeCheckout(
  items: CheckoutItem[],
  userId: string,
): Promise<StripeCheckoutResponse> {
  const { data } = await apiClient.post<StripeCheckoutResponse>(
    "/payment/stripe/create-checkout-session",
    { items, userId },
  );
  return data;
}

/**
 * Confirm a Stripe payment after redirect (called from payment-success page).
 */
export async function confirmStripePayment(params: {
  userId: string;
  courseIds: string;
  sessionId: string;
  amount: number;
}): Promise<void> {
  await apiClient.post("/payment/stripe/confirm-payment", params);
}

/**
 * Create a PayPal order.
 */
export async function createPayPalOrder(
  items: CheckoutItem[],
  userId: string,
): Promise<PayPalCreateOrderResponse> {
  const { data } = await apiClient.post<PayPalCreateOrderResponse>(
    "/payment/paypal/create-order",
    { items, userId },
  );
  return data;
}

/**
 * Capture a PayPal order after approval.
 */
export async function capturePayPalOrder(params: {
  orderId: string;
  userId: string;
  courseIds: string;
  amount: number;
}): Promise<PayPalCaptureResponse> {
  const { data } = await apiClient.post<PayPalCaptureResponse>(
    "/payment/paypal/capture-order",
    params,
  );
  return data;
}

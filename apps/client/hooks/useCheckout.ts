"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import { toast } from "react-toastify";
import type { Course } from "@/types/course.types";
import {
  createStripeCheckout,
  createPayPalOrder,
  capturePayPalOrder,
} from "@/lib/api/services/payment.service";

interface CheckoutItem {
  courseId: string | undefined;
  title: string;
  price: number;
}

function formatCartItems(items: Course[]): CheckoutItem[] {
  return items.map((item) => ({
    courseId: item._id,
    title: item.title,
    price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
  }));
}

/**
 * Hook encapsulating Stripe and PayPal checkout logic.
 */
export function useCheckout(
  cartItems: Course[],
  userId: string | null,
  totalPrice: number,
) {
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleStripeCheckout() {
    if (cartItems.length === 0 || !userId) return;
    setIsProcessing(true);
    try {
      const formattedItems = formatCartItems(cartItems);
      const data = await createStripeCheckout(formattedItems, userId);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      logger.error("Stripe checkout error:", error as Error);
      toast.error("Failed to initiate Stripe checkout.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCreatePayPalOrder(): Promise<string> {
    if (cartItems.length === 0 || !userId) {
      const errMsg = "Cart is empty or user not logged in";
      toast.error(errMsg);
      throw new Error(errMsg);
    }

    setIsProcessing(true);
    try {
      const formattedItems = formatCartItems(cartItems);
      const itemTotal = formattedItems.reduce(
        (sum, item) => sum + item.price,
        0,
      );

      if (itemTotal <= 0) {
        throw new Error(`Invalid total price: $${itemTotal}`);
      }

      const data = await createPayPalOrder(formattedItems, userId);
      if (!data.orderId) {
        throw new Error("PayPal did not return an order ID");
      }
      return data.orderId;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error creating PayPal order";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCapturePayPalOrder(orderId: string) {
    if (!orderId) {
      toast.error("No orderId provided to capture");
      return;
    }
    if (cartItems.length === 0 || !userId) {
      toast.error("Cart items or user ID missing");
      return;
    }

    setIsProcessing(true);
    try {
      const courseIds = cartItems.map((item) => item._id).join(",");
      const data = await capturePayPalOrder({
        orderId,
        userId,
        courseIds,
        amount: totalPrice,
      });

      if (data.status === "COMPLETED") {
        window.location.href = `/course/payment-success?method=paypal&courseId=${cartItems[0]._id}&session_id=${data.paymentId}`;
      } else {
        toast.error(`Payment not completed. Status: ${data.status}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    isProcessing,
    handleStripeCheckout,
    createPayPalOrder: handleCreatePayPalOrder,
    capturePayPalOrder: handleCapturePayPalOrder,
  };
}

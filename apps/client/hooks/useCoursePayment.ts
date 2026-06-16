import { useState } from "react";
import { toast } from "react-toastify";
import { Course } from "@/types/course.types";
import {
  createStripeCheckout,
  createPayPalOrder,
  capturePayPalOrder,
} from "@/lib/api/services/payment.service";

interface UseCoursePaymentReturn {
  paymentMethod: "stripe" | "paypal";
  setPaymentMethod: (method: "stripe" | "paypal") => void;
  isProcessingBuyNow: boolean;
  setIsProcessingBuyNow: (processing: boolean) => void;
  handleStripeCheckout: (course: Course, userId: string) => Promise<void>;
  createPayPalOrder: (course: Course, userId: string) => Promise<string>;
  capturePayPalOrder: (
    orderId: string,
    course: Course,
    userId: string,
  ) => Promise<void>;
}

export const useCoursePayment = (): UseCoursePaymentReturn => {
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">(
    "stripe",
  );
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState(false);

  const handleStripeCheckout = async (course: Course, userId: string) => {
    if (!course || !userId) return;

    setIsProcessingBuyNow(true);
    try {
      const formattedItems = [
        {
          courseId: course._id,
          title: course.title,
          price: course.price,
          image: course.image,
        },
      ];

      const data = await createStripeCheckout(formattedItems, userId);

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsProcessingBuyNow(false);
    }
  };

  const handleCreatePayPalOrder = async (
    course: Course,
    userId: string,
  ): Promise<string> => {
    if (!course || !userId) {
      const errMsg = "Course or user ID missing";

      toast.error(errMsg);
      throw new Error(errMsg);
    }

    try {
      const price =
        typeof course.price === "string"
          ? parseFloat(course.price)
          : course.price;

      if (isNaN(price) || price <= 0) {
        const errMsg = `Invalid course price: $${course.price}`;

        throw new Error(errMsg);
      }

      const formattedItems = [
        {
          courseId: course._id,
          title: course.title,
          price: price,
          image: course.image,
        },
      ];

      const data = await createPayPalOrder(formattedItems, userId);

      if (!data.orderId) {
        throw new Error("PayPal did not return an order ID");
      }

      return data.orderId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast.error(`Failed to create PayPal order: ${errorMessage}`);
      throw error;
    }
  };

  const handleCapturePayPalOrder = async (
    orderId: string,
    course: Course,
    userId: string,
  ) => {
    if (!orderId) {
      toast.error("PayPal order ID is missing");
      return;
    }

    if (!course || !userId) {
      toast.error("Course or user information missing");
      return;
    }

    setIsProcessingBuyNow(true);
    try {
      const data = await capturePayPalOrder({
        orderId,
        userId,
        courseIds: course._id!,
        amount: course.price,
      });

      if (data.status === "COMPLETED") {
        window.location.href = `/course/payment-success?method=paypal&courseIds=${course._id}&session_id=${data.paymentId}`;
      } else {
        toast.error(`Payment not completed. Status: ${data.status}`);
      }
    } catch (error) {
      toast.error(
        `Failed to complete payment: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessingBuyNow(false);
    }
  };

  return {
    paymentMethod,
    setPaymentMethod,
    isProcessingBuyNow,
    setIsProcessingBuyNow,
    handleStripeCheckout,
    createPayPalOrder: handleCreatePayPalOrder,
    capturePayPalOrder: handleCapturePayPalOrder,
  };
};

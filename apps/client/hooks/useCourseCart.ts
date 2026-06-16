import { useState } from "react";
import { toast } from "react-toastify";
import { useAddToCartMutation } from "@/service/cart/cart.useQuery";
import { Course } from "@/types/course.types";

interface UseCourseCartReturn {
  isProcessing: boolean;
  handleAddToCart: (course: Course, userId: string) => Promise<void>;
}

export const useCourseCart = (): UseCourseCartReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutateAsync: addToCart } = useAddToCartMutation();

  const handleAddToCart = async (course: Course, userId: string) => {
    if (!userId) {
      toast.error("Please sign in to add courses to cart.");
      return;
    }

    if (!course?._id) {
      toast.error(
        "Error: Could not identify the course. Please refresh and try again.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      const res = await addToCart(course?._id);
      if (res?.items) {
        toast.success("Course added to cart successfully!");
      } else {
        throw new Error("No items returned from cart");
      }
    } catch (error) {
      toast.error(
        `Failed to add course to cart: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleAddToCart,
  };
};

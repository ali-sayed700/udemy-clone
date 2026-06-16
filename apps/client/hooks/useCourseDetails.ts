import { useState, useEffect } from "react";
import { graphqlClient } from "@/lib/api/graphqlClient";
import { useGetCourseById } from "@/service/all-courses-service/coursesCrud.useQuery";
import { Course } from "@/types/course.types";
import { toast } from "react-toastify";
import router from "next/router";
import { IS_ENROLLED_QUERY } from "@/lib/graphql/enrollments";
import { GET_MY_CART } from "@/lib/graphql/cart";
import { getCurrentUser } from "@/lib/api/services/auth.service";

interface UseCourseDetailsReturn {
  course: Course | undefined;
  isLoading: boolean;
  isError: boolean;
  isEnrolled: boolean;
  userId: string | null;
  cartItems: Course[];
}

export const useCourseDetails = (id: string): UseCourseDetailsReturn => {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<Course[]>([]);

  const { data, isLoading, isError } = useGetCourseById(id);
  const course = data?.data?.course;

  // Step 1: Fetch current user ID from session
  useEffect(() => {
    let cancelled = false;

    async function fetchUserId() {
      try {
        const user = await getCurrentUser();
        if (!cancelled && user?.userId) {
          setUserId(user.userId);
        }
      } catch {
        // User is not authenticated — this is fine
        toast("You are not authenticated , please login", {
          type: "error",
        });
        router.push("/login");
      }
    }

    fetchUserId();

    return () => {
      cancelled = true;
    };
  }, []);

  // Step 2: Check enrollment status and fetch cart ONLY when user is authenticated
  useEffect(() => {
    if (!id || !userId) return;
    let cancelled = false;

    async function checkEnrollmentAndCart() {
      const enrollmentRequest = graphqlClient.post("", {
        query: IS_ENROLLED_QUERY,
        variables: { courseId: id },
      });

      const cartRequest = graphqlClient.post("", {
        query: GET_MY_CART,
      });

      const [enrollmentResult, cartResult] = await Promise.allSettled([
        enrollmentRequest,
        cartRequest,
      ]);

      if (cancelled) return;

      if (enrollmentResult.status === "fulfilled") {
        setIsEnrolled(
          enrollmentResult.value.data?.data?.isEnrolled?.enrolled || false,
        );
      } else {
        toast("Enrollment check error", {
          type: "error",
        });
      }

      if (cartResult.status === "fulfilled") {
        const items = cartResult.value.data?.data?.myCart?.items;
        if (items) {
          setCartItems(items);
        }
      } else {
        toast("Cart fetch error", {
          type: "error",
        });
      }
    }

    checkEnrollmentAndCart();

    return () => {
      cancelled = true;
    };
  }, [id, userId]);

  return {
    course,
    isLoading,
    isError,
    isEnrolled,
    userId,
    cartItems,
  };
};

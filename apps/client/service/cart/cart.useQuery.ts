"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCartAction,
  getCartCountAction,
  removeFromCartAction,
  addToCartAction,
} from "./cart.actions";
import { Cart } from "@/types/cart.types";
import { toast } from "react-toastify";

interface QueryOptions {
  enabled?: boolean;
}

export const useGetCartQuery = (options: QueryOptions = {}) => {
  return useQuery<Cart | null>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await getCartAction();
      return res;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: options.enabled ?? true,
    refetchOnWindowFocus: false,
  });
};

export const useGetCartCountQuery = (options: QueryOptions = {}) => {
  return useQuery<number>({
    queryKey: ["cart", "count"],
    queryFn: async () => {
      const res = await getCartCountAction();
      return res;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: options.enabled ?? true,
    refetchOnWindowFocus: false,
  });
};

export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!courseId) throw new Error("Course ID is required");
      const res = await removeFromCartAction(courseId);
      if (!res) throw new Error("Please sign in to manage your cart");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      toast.error(
        `Failed to remove course from cart: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!courseId) throw new Error("Course ID is required");
      const res = await addToCartAction(courseId);
      if (!res) throw new Error("Please sign in to add items to cart");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      toast.error(
        `Failed to add course to cart: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
};

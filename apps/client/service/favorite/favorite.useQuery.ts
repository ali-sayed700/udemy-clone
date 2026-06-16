"use client";
import { logger } from "@/lib/logger";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isFavoriteAction,
  toggleFavoriteAction,
  getMyFavoritesAction,
  getMyFavoriteCountAction,
} from "./favorite.actions";
import { Favorite } from "@/types/favorite.types";

interface QueryOptions {
  enabled?: boolean;
}

export const useGetMyFavoritesQuery = (options: QueryOptions = {}) => {
  return useQuery<Favorite[] | null>({
    queryKey: ["myFavorites"],
    queryFn: async () => {
      const res = await getMyFavoritesAction();
      return res || null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: options.enabled ?? true,
    refetchOnWindowFocus: false,
  });
};

export const useGetMyFavoriteCountQuery = (options: QueryOptions = {}) => {
  return useQuery<number>({
    queryKey: ["myFavorites", "count"],
    queryFn: async () => {
      const res = await getMyFavoriteCountAction();
      return res;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: options.enabled ?? true,
    refetchOnWindowFocus: false,
  });
};

export const useIsFavoriteQuery = (courseId: string) => {
  return useQuery<boolean | null>({
    queryKey: ["favorite", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const res = await isFavoriteAction(courseId);
      return res || null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!courseId, // Only run if courseId exists
  });
};

export const useToggleFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!courseId) throw new Error("Course ID is required");
      const res = await toggleFavoriteAction(courseId);
      if (res === undefined || res === null) {
        throw new Error("Please sign in to add favorites");
      }
      return res;
    },
    onSuccess: (_, courseId) => {
      // Invalidate the specific course favorite query
      queryClient.invalidateQueries({ queryKey: ["favorite", courseId] });
      // Invalidate the favorites list
      queryClient.invalidateQueries({ queryKey: ["myFavorites"] });
    },
    onError: (error: Error) => {
      logger.error("Toggle favorite error:", error);
    },
  });
};

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfileAction,
  updateProfileAction,
} from "./profileActions";

// ---- Query: fetch current user profile ----
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No userId");
      return getUserProfileAction(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// ---- Mutation: update profile ----
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-profile"],
    mutationFn: async (data: {
      _id: string;
      userName?: string;
      avatar?: string;
      password?: string;
    }) => {
      return updateProfileAction(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables._id],
      });
    },
  });
}

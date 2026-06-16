"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { toast } from "react-toastify";
import { getCurrentUser } from "@/lib/api/services/auth.service";

/**
 * Hook to fetch the current logged-in user's ID.
 * Uses the centralized auth service.
 */
export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        if (user?.userId) {
          setUserId(user.userId);
        }
      } catch (error) {
        logger.error("Failed to load user", error as Error);
        toast.error("Failed to load user session.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { userId, isLoading };
}

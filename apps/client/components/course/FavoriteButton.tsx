"use client";
import { logger } from "@/lib/logger";

import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetMyFavoritesQuery,
  useToggleFavoriteMutation,
} from "@/service/favorite/favorite.useQuery";
import { getCurrentUser } from "@/lib/api/services/auth.service";

interface FavoriteButtonProps {
  courseId: string;
}

export default function FavoriteButton({ courseId }: FavoriteButtonProps) {
  const { data: favorites, isLoading: isChecking } = useGetMyFavoritesQuery({
    enabled: !!courseId,
  });
  const { mutate: toggleFavorite, isPending: isTogglingFavorite } =
    useToggleFavoriteMutation();
  const isFavorite =
    favorites?.some((favorite) => favorite.course?._id === courseId) || false;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTogglingFavorite) return;

    try {
      // Check if user is logged in
      const user = await getCurrentUser();

      if (!user?.userId) {
        toast.error("Please log in to save favorites.");
        return;
      }

      toggleFavorite(courseId, {
        onError: (error) => {
          logger.error("Failed to toggle favorite:", error as Error);
          toast.error("Failed to update favorite. Please try again.");
        },
      });
    } catch (error) {
      logger.error("Auth check error:", error as Error);
      toast.error("Please log in to save favorites.");
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={!courseId || isTogglingFavorite || isChecking}
      className={`cursor-pointer p-2 rounded-full transition-all duration-200 shadow-sm border ${
        isFavorite
          ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100"
          : "bg-white/80 backdrop-blur-md border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200"
      }`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`  w-5 h-5 transition-transform duration-300 ${
          isFavorite ? "fill-current scale-110" : "scale-100"
        } ${isTogglingFavorite ? "animate-pulse" : ""}`}
      />
    </button>
  );
}

"use server";
import { logger } from "@/lib/logger";

import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { Favorite } from "@/types/favorite.types";
import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import { queryFav, GET_MY_FAVORITE_COUNT, IS_FAVORITE_QUERY, TOGGLE_FAVORITE_MUTATION } from "@/lib/graphql/favorites";

export async function getMyFavoritesAction(): Promise<Favorite[] | null> {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return null;
    }

    const data = await authFetchGraphQL(queryFav);
    if (!data?.myFavorites) {
      throw new Error("Failed to fetch favorites");
    }
    return data.myFavorites;
  } catch (error) {
    logger.error("getMyFavoritesAction error:", error as Error);
    throw new Error(
      `Failed to fetch favorites: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function getMyFavoriteCountAction(): Promise<number> {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return 0;
    }

    const data = await authFetchGraphQL(GET_MY_FAVORITE_COUNT);

    return data?.myFavorites?.length || 0;
  } catch (error) {
    logger.error("getMyFavoriteCountAction error:", error as Error);
    return 0;
  }
}

export async function isFavoriteAction(
  courseId: string,
): Promise<boolean | null> {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      logger.warn("⚠️ No session or access token found for isFavorite");
      return null;
    }

    if (!courseId) {
      throw new Error("Course ID is required");
    }

    const query = IS_FAVORITE_QUERY;

    const res = await authFetchGraphQL(query, { courseId });

    if (res?.isFavorite === undefined) {
      throw new Error("Failed to check favorite status");
    }
    return res.isFavorite;
  } catch (error) {
    logger.error("isFavoriteAction error:", error as Error);
    throw new Error(
      `Failed to check favorite: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function toggleFavoriteAction(
  courseId: string,
): Promise<boolean | null> {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      logger.warn("⚠️ No session or access token found for toggleFavorite");
      return null;
    }

    if (!courseId) {
      throw new Error("Course ID is required");
    }

    const query = TOGGLE_FAVORITE_MUTATION;

    const res = await authFetchGraphQL(query, { courseId });

    if (res?.toggleFavorite === undefined) {
      throw new Error("Failed to toggle favorite");
    }

    revalidatePath("/dashboard/favorites");
    revalidatePath("/favorites");
    revalidatePath(`/course/${courseId}/course_details`);

    return res.toggleFavorite;
  } catch (error) {
    logger.error("toggleFavoriteAction error:", error as Error);
    throw new Error(
      `Failed to toggle favorite: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

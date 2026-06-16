import { logger } from "@/lib/logger";
import { useState, useCallback } from "react";
import { graphqlClient } from "@/lib/api/graphqlClient";
import type { CourseProgress } from "@/types/enrollment.types";
import { GET_MY_COURSE_PROGRESS, MARK_LECTURE_VIEWED_MUTATION, MARK_LECTURE_COMPLETED_MUTATION } from "@/lib/graphql/progress";

interface UseCourseProgressReturn {
  progress: CourseProgress[];
  completionPercentage: number;
  isLoading: boolean;
  error: Error | null;
  markViewed: (lectureId: string) => Promise<CourseProgress | null>;
  markCompleted: (lectureId: string) => Promise<CourseProgress | null>;
  getProgress: (lectureId: string) => CourseProgress | undefined;
  fetchProgress: () => Promise<void>;
  isLectureCompleted: (lectureId: string) => boolean;
  isLectureViewed: (lectureId: string) => boolean;
  getCompletedCount: () => number;
  getRemainingCount: () => number;
}

/**
 * Reusable hook for managing course progress
 * Handles fetching, marking viewed, and marking completed
 */
export function useCourseProgress(
  courseId: string,
  totalLectures: number,
): UseCourseProgressReturn {
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Update completion percentage
  const updateCompletionPercentage = useCallback(
    (progressList: CourseProgress[]) => {
      if (totalLectures === 0) return;
      const completedCount = progressList.filter((p) => p.completed).length;
      const percentage = Math.round((completedCount / totalLectures) * 100);
      setCompletionPercentage(percentage);
    },
    [totalLectures],
  );

  // Fetch all progress for course
  const fetchProgress = useCallback(async () => {
    if (!courseId || totalLectures === 0) return;

    setIsLoading(true);
    try {
      const response = await graphqlClient.post("", {
        query: GET_MY_COURSE_PROGRESS,
        variables: { courseId },
      });

      const progressData = response.data?.data?.myCourseProgress || [];
      setProgress(progressData);
      updateCompletionPercentage(progressData);
      setError(null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch progress");
      setError(error);
      logger.error("Error fetching progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, totalLectures, updateCompletionPercentage]);

  // Mark lecture as viewed
  const markViewed = useCallback(
    async (lectureId: string): Promise<CourseProgress | null> => {
      try {
        const response = await graphqlClient.post("", {
          query: MARK_LECTURE_VIEWED_MUTATION,
          variables: { courseId, lectureId },
        });

        const updated = response.data?.data?.markLectureViewed;
        if (updated) {
          setProgress((prev) => {
            const existing = prev.findIndex((p) => p.lecture._id === lectureId);
            if (existing >= 0) {
              const copy = [...prev];
              copy[existing] = updated;
              return copy;
            }
            return [...prev, updated];
          });
        }
        return updated || null;
      } catch (err) {
        logger.error("Error marking lecture viewed:", err as Error);
        return null;
      }
    },
    [courseId],
  );

  // Mark lecture as completed
  const markCompleted = useCallback(
    async (lectureId: string): Promise<CourseProgress | null> => {
      try {
        const response = await graphqlClient.post("", {
          query: MARK_LECTURE_COMPLETED_MUTATION,
          variables: { courseId, lectureId },
        });

        const updated = response.data?.data?.markLectureCompleted;
        if (updated) {
          setProgress((prev) => {
            const newProgress = prev.find((p) => p.lecture._id === lectureId)
              ? prev.map((p) => (p.lecture._id === lectureId ? updated : p))
              : [...prev, updated];
            updateCompletionPercentage(newProgress);
            return newProgress;
          });
        }
        return updated || null;
      } catch (err) {
        logger.error("Error marking lecture completed:", err as Error);
        return null;
      }
    },
    [courseId, updateCompletionPercentage],
  );

  // Get progress for specific lecture
  const getProgress = useCallback(
    (lectureId: string): CourseProgress | undefined => {
      return progress.find((p) => p.lecture._id === lectureId);
    },
    [progress],
  );

  return {
    progress,
    completionPercentage,
    isLoading,
    error,
    markViewed,
    markCompleted,
    getProgress,
    fetchProgress,
    isLectureCompleted: (lectureId: string) => {
      return progress.some((p) => p.lecture._id === lectureId && p.completed);
    },
    isLectureViewed: (lectureId: string) => {
      return progress.some((p) => p.lecture._id === lectureId && p.viewed);
    },
    getCompletedCount: () => {
      return progress.filter((p) => p.completed).length;
    },
    getRemainingCount: () => {
      return totalLectures - progress.filter((p) => p.completed).length;
    },
  };
}

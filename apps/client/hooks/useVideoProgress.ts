import { useCallback } from "react";
import type { CourseProgress } from "@/types/enrollment.types";
import { Course } from "@/types/course.types";
import { toast } from "react-toastify";
import { logger } from "@/lib/logger";
import { markLectureCompleted } from "@/lib/api/services/progress.service";
import { getCourseLectures } from "@/lib/course-content";

interface UseVideoProgressReturn {
  handleMarkCompleted: (lectureId: string) => Promise<void>;
  getLectureProgress: (lectureId: string) => CourseProgress | undefined;
}

interface UseVideoProgressParams {
  courseId: string;
  course: Course | null;
  progress: CourseProgress[];
  setProgress: (
    progress: CourseProgress[] | ((prev: CourseProgress[]) => CourseProgress[]),
  ) => void;
  setShowCompletionBanner: (show: boolean) => void;
  onNextLecture: () => void;
}

export const useVideoProgress = ({
  courseId,
  course,
  progress,
  setProgress,
  setShowCompletionBanner,
  onNextLecture,
}: UseVideoProgressParams): UseVideoProgressReturn => {
  const lectures = getCourseLectures(course);

  const handleMarkCompleted = useCallback(
    async (lectureId: string) => {
      try {
        const updated = await markLectureCompleted(courseId, lectureId);

        if (updated) {
          setProgress((prev: CourseProgress[]) => {
            const existing = prev.findIndex(
              (p: CourseProgress) => p.lecture._id === lectureId,
            );
            let newProgress: CourseProgress[];
            if (existing >= 0) {
              const copy = [...prev];
              copy[existing] = updated as unknown as CourseProgress;
              newProgress = copy;
            } else {
              newProgress = [...prev, updated as unknown as CourseProgress];
            }

            try {
              localStorage.setItem(
                `course-${courseId}-progress-backup`,
                JSON.stringify(newProgress),
              );
            } catch (e) {
              logger.warn("Could not save progress to localStorage:", e as string);
            }

            return newProgress;
          });

          setShowCompletionBanner(true);

          const currentIndex = lectures.findIndex((l) => l._id === lectureId);
          const isLastLecture = currentIndex === lectures.length - 1;

          if (!isLastLecture) {
            setTimeout(() => {
              onNextLecture();
            }, 1500);
          }
        }
      } catch (error) {
        logger.error("Error marking lecture completed:", error as Error);
        toast.error("Error marking lecture completed");
      }
    },
    [courseId, lectures, setProgress, setShowCompletionBanner, onNextLecture],
  );

  const getLectureProgress = useCallback(
    (lectureId: string) => {
      return progress.find((p) => p.lecture._id === lectureId);
    },
    [progress],
  );

  return {
    handleMarkCompleted,
    getLectureProgress,
  };
};

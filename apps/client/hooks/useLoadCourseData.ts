import { useState, useCallback, useEffect } from "react";
import { graphqlClient } from "@/lib/api/graphqlClient";
import type { Course, Lecture } from "@/types/course.types";
import type { CourseProgress } from "@/types/enrollment.types";
import { toast } from "react-toastify";
import { GET_Course } from "@/lib/graphql/courses";
import { GET_MY_COURSE_PROGRESS } from "@/lib/graphql/progress";
import { markLectureViewed } from "@/lib/api/services/progress.service";
import { getCourseLectures } from "@/lib/course-content";

const calculateCompletionPercentage = (
  progressList: CourseProgress[],
  totalLectures: number,
) => {
  if (totalLectures === 0) return 0;

  const completedCount = progressList.filter((p) => p.completed).length;
  return Math.round((completedCount / totalLectures) * 100);
};

interface UseLoadCourseDataReturn {
  course: Course | null;
  progress: CourseProgress[];
  currentLecture: Lecture | null;
  completionPercentage: number;
  loading: boolean;
  setProgress: (
    progress: CourseProgress[] | ((prev: CourseProgress[]) => CourseProgress[]),
  ) => void;
  setCurrentLecture: (lecture: Lecture | null) => void;
  handleMarkViewed: (lectureId: string) => Promise<void>;
}

export const useLoadCourseData = (
  courseId: string,
): UseLoadCourseDataReturn => {
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lectures = getCourseLectures(course);
    setCompletionPercentage(
      calculateCompletionPercentage(progress, lectures.length),
    );
  }, [progress, course]);

  const handleMarkViewed = useCallback(
    async (lectureId: string) => {
      try {
        const updated = await markLectureViewed(courseId, lectureId);

        if (updated) {
          setProgress((prev) => {
            const existing = prev.findIndex((p) => p.lecture._id === lectureId);
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
            } catch {
              throw new Error("Could not save progress to localStorage");
            }

            return newProgress;
          });
        }
      } catch {
        toast.error(" Error marking lecture viewed");
      }
    },
    [courseId],
  );

  const loadData = useCallback(async () => {
    try {
      // Fetch course details
      const courseRes = await graphqlClient.post("", {
        query: GET_Course,
        variables: { id: courseId },
      });

      if (courseRes.data?.errors) {
        throw new Error("Failed to load course");
      }

      const courseData = courseRes.data?.data?.course;
      if (!courseData) throw new Error("No course data returned");
      const lectures = getCourseLectures(courseData);

      setCourse(courseData);

      // Fetch progress
      let progressData: CourseProgress[] = [];
      try {
        const progressRes = await graphqlClient.post("", {
          query: GET_MY_COURSE_PROGRESS,
          variables: { courseId },
        });

        if (progressRes.data?.errors) {
          toast.error(" Error fetching progress");
          progressData = [];
        } else {
          progressData = progressRes.data?.data?.myCourseProgress || [];
        }
      } catch {
        toast.error(" Error fetching progress");
        progressData = [];
      }

      // Use localStorage backup if backend returns empty
      let finalProgressData = progressData;
      if (progressData.length === 0) {
        try {
          const backup = localStorage.getItem(
            `course-${courseId}-progress-backup`,
          );
          if (backup) {
            const parsedBackup = JSON.parse(backup);
            finalProgressData = parsedBackup;
          }
        } catch {
          toast.error(" Error loading course");
        }
      }

      setProgress(finalProgressData);

      // Set current lecture
      if (lectures.length > 0) {
        const savedLectureId = localStorage.getItem(
          `course-${courseId}-last-lecture`,
        );

        let lectureToPlay = lectures[0];

        if (savedLectureId) {
          const saved = lectures.find(
            (l: Lecture) => l._id === savedLectureId,
          );
          if (saved) {
            lectureToPlay = saved;
          }
        }

        setCurrentLecture(lectureToPlay);

        if (lectureToPlay._id) {
          handleMarkViewed(lectureToPlay._id);
        }
      }

      setCompletionPercentage(
        calculateCompletionPercentage(finalProgressData, lectures.length),
      );
    } catch {
      toast.error(" Error loading course");
      setCompletionPercentage(0);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, handleMarkViewed]);

  // Load course data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    course,
    progress,
    currentLecture,
    completionPercentage,
    loading,
    setProgress,
    setCurrentLecture,
    handleMarkViewed,
  };
};

import { useCallback } from "react";
import type { Course, Lecture } from "@/types/course.types";
import { getCourseLectures } from "@/lib/course-content";

interface UseLectureNavigationReturn {
  handleSelectLecture: (lecture: Lecture) => void;
  goToNextLecture: () => void;
}

interface UseLectureNavigationParams {
  courseId: string;
  course: Course | null;
  currentLecture: Lecture | null;
  setCurrentLecture: (lecture: Lecture | null) => void;
  onLectureSelect: (lectureId: string) => void;
}

export const useLectureNavigation = ({
  courseId,
  course,
  currentLecture,
  setCurrentLecture,
  onLectureSelect,
}: UseLectureNavigationParams): UseLectureNavigationReturn => {
  const lectures = getCourseLectures(course);

  const handleSelectLecture = useCallback(
    (lecture: Lecture) => {
      setCurrentLecture(lecture);
      if (lecture._id) {
        // Save to localStorage
        localStorage.setItem(`course-${courseId}-last-lecture`, lecture._id);
        onLectureSelect(lecture._id);
      }
    },
    [courseId, setCurrentLecture, onLectureSelect],
  );

  const goToNextLecture = useCallback(() => {
    if (lectures.length === 0) return;
    const currentIndex = lectures.findIndex(
      (l: Lecture) => l._id === currentLecture?._id,
    );
    if (currentIndex >= 0 && currentIndex < lectures.length - 1) {
      const nextLecture = lectures[currentIndex + 1];
      handleSelectLecture(nextLecture);
    }
  }, [lectures, currentLecture?._id, handleSelectLecture]);

  return {
    handleSelectLecture,
    goToNextLecture,
  };
};

import type { Course, Lecture, Section } from "@/types/course.types";

export function getSortedSections(course: Course | null | undefined): Section[] {
  return (course?.sections || []).slice().sort((a, b) => a.order - b.order);
}

export function getSectionedLectureIds(
  course: Course | null | undefined,
): Set<string> {
  return new Set(
    getSortedSections(course).flatMap((section) =>
      (section.lectures || [])
        .map((lecture) => lecture._id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
}

export function getUnsectionedLectures(
  course: Course | null | undefined,
): Lecture[] {
  const sectionedLectureIds = getSectionedLectureIds(course);

  return (course?.lectures || []).filter(
    (lecture) => !lecture._id || !sectionedLectureIds.has(lecture._id),
  );
}

export function getCourseLectures(course: Course | null | undefined): Lecture[] {
  return [
    ...getSortedSections(course).flatMap((section) => section.lectures || []),
    ...getUnsectionedLectures(course),
  ];
}

export function getFreePreviewLectures(
  course: Course | null | undefined,
): Lecture[] {
  return getCourseLectures(course).filter((lecture) => lecture.freePreview);
}

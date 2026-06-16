"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getMyEnrollmentsAction,
  getAllCoursesStatusAction,
} from "./enrollment.actions";
import { Enrollment } from "@/types/enrollment.types";
import { CourseStatusInfo } from "@/types/course-progress.types";

interface EnrolledCourseWithStatus {
  enrollment: Enrollment;
  status: CourseStatusInfo | null;
}

/**
 * Fetch all courses the user is enrolled in
 */
export const useGetMyEnrollmentsQuery = () => {
  return useQuery({
    queryKey: ["myEnrollments"],
    queryFn: async () => {
      const result = await getMyEnrollmentsAction();
      return result || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Fetch progress status for all enrolled courses
 */
export const useGetAllCoursesStatusQuery = () => {
  return useQuery({
    queryKey: ["allMyCoursesStatus"],
    queryFn: async () => {
      const result = await getAllCoursesStatusAction();
      return result || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Combined hook to get enrolled courses with their progress status
 */
export const useGetMyCoursesWithProgressQuery = () => {
  const enrollmentsQuery = useGetMyEnrollmentsQuery();
  const statusQuery = useGetAllCoursesStatusQuery();

  const data = {
    courses: (enrollmentsQuery.data || [])
      .map((enrollment: Enrollment) => {
        const courseId =
          typeof enrollment.course === "object"
            ? enrollment.course._id
            : enrollment.course;
        const status = (statusQuery.data || []).find(
          (s: CourseStatusInfo) => s.courseId === courseId
        );
        return {
          enrollment,
          status: status || null,
        };
      })
      .sort((a: EnrolledCourseWithStatus, b: EnrolledCourseWithStatus) => {
        const dateA = new Date(a.enrollment.enrolledAt).getTime();
        const dateB = new Date(b.enrollment.enrolledAt).getTime();
        return dateB - dateA;
      }),
  };

  return {
    data,
    isLoading: enrollmentsQuery.isLoading || statusQuery.isLoading,
    isError: enrollmentsQuery.isError || statusQuery.isError,
    error: enrollmentsQuery.error || statusQuery.error,
  };
};

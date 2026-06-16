"use client";
import { CourseResponse, CoursesResponse } from "@/types/course.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetCourseAction, GetCourseByIdAction } from "./coursesCrud.action";

interface CoursesQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

const useGetAllCourses = (
  queryReq: Record<string, unknown> = {},
  options: CoursesQueryOptions = {},
) => {
  return useQuery<CoursesResponse>({
    queryKey: ["courses", queryReq],
    queryFn: async () => {
      const res = await GetCourseAction(queryReq);

      return res;
    },
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: options.staleTime ?? 60 * 60 * 1000,
  });
};

export default useGetAllCourses;

export const useGetCourseById = (id: string) => {
  return useQuery<CourseResponse>({
    queryKey: ["get-course", id],
    queryFn: async () => {
      const res = await GetCourseByIdAction(id);

      return res;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,

    staleTime: 60 * 60 * 1000,
  });
};

// export function useDashboardCoursesById() {
//   return useQuery<GETCoursesByInstructorID>({
//     queryKey: ["instructor-courses-by-id"],
//     queryFn: async () => {
//       const res = await getCoursesByInstructorIdAction();

//       return res;
//     },
//     refetchOnWindowFocus: true,
//     staleTime: 60 * 1000,
//   });
// }

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CoursesResponse,
  GETCoursesByInstructorID,
} from "@/types/course.types";
import {
  getInstructorCoursesAction,
  uploadCourseImageAction,
  createCourseAction,
  createSingleLectureAction,
  updateCourseAction,
  deleteCourseAction,
  getCoursesByInstructorIdAction,
} from "./courseCrud.actions";

// ---- Queries ----

export const DASHBOARD_COURSES_QUERY_KEY = ["instructor-courses-by-id"] as const;

export function useDashboardCourses() {
  return useQuery<CoursesResponse>({
    queryKey: ["All-instructor-courses"],
    queryFn: async () => {
      const res = await getInstructorCoursesAction();
      return res;
    },
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
}

//  get courses by instructor id
export function useDashboardCoursesById() {
  return useQuery<GETCoursesByInstructorID>({
    queryKey: DASHBOARD_COURSES_QUERY_KEY,
    queryFn: async () => {
      const res = await getCoursesByInstructorIdAction();

      return res;
    },
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
}

// ---- Upload Helpers ----

export async function uploadCourseImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  return uploadCourseImageAction(formData);
}

// ---- Create Course (no lectures) ----

interface CreateCourseVars {
  title: string;
  description: string;
  price: number;
  categories: string;
  level: string;
  primaryLanguage: string;
  objectives: string;
  welcomeMessage: string;
  isPublished: boolean;
  image?: string;
  instructor?: string;
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-course"],
    mutationFn: async (vars: CreateCourseVars) => {
      const createdCourse = await createCourseAction({
        title: vars.title,
        description: vars.description,
        price: vars.price,
        categories: vars.categories,
        level: vars.level,
        primaryLanguage: vars.primaryLanguage,
        objectives: vars.objectives,
        welcomeMessage: vars.welcomeMessage,
        isPublished: vars.isPublished,
        image: vars.image || "",

        lectures: [],
      });
      return createdCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_COURSES_QUERY_KEY });
    },
  });
}

// ---- Add Lecture to Existing Course ----

interface AddLectureVars {
  courseId: string;
  existingLectureIds: string[];
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  freePreview?: boolean;
}

export function useAddLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add-lecture"],
    mutationFn: async (vars: AddLectureVars) => {
      // Step 1: Create lecture in DB (video already uploaded)
      let lecture;
      try {
        lecture = await createSingleLectureAction({
          title: vars.title,
          description: vars.description,
          videoUrl: vars.videoUrl,
          duration: vars.duration,
          freePreview: vars.freePreview ?? false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown server error";
        throw new Error(`Could not create lecture: ${message}`);
      }

      if (!lecture?._id) {
        throw new Error("Could not create lecture: server did not return an ID");
      }

      // Step 2: Update the course's lectures array
      const allLectureIds = Array.from(
        new Set([...vars.existingLectureIds, lecture._id]),
      );

      try {
        await updateCourseAction({
          _id: vars.courseId,
          lectures: allLectureIds,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown server error";
        throw new Error(`Lecture created, but course was not updated: ${message}`);
      }

      return lecture;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_COURSES_QUERY_KEY });
    },
  });
}

// ---- Update Course ----

interface UpdateCourseVars {
  _id: string;
  title?: string;
  description?: string;
  price?: number;
  categories?: string;
  level?: string;
  primaryLanguage?: string;
  objectives?: string;
  welcomeMessage?: string;
  isPublished?: boolean;
  image?: string;
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: UpdateCourseVars) => {
      const updatedCourse = await updateCourseAction(vars);
      return updatedCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_COURSES_QUERY_KEY });
    },
  });
}

// ---- Delete Course ----

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const removedCourse = await deleteCourseAction(id);
      return removedCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_COURSES_QUERY_KEY });
    },
  });
}

"use server";

import type { CoursesResponse } from "@/types/course.types";
import {
  authFetchGraphQL,
  fetchGraphqlServer,
} from "@/lib/api/fetchGraphqlServer";
import {
  GET_Courses_By_Instructor,
  GET_INSTRUCTOR_COURSES,
  CREATE_COURSE_MUTATION,
  UPDATE_COURSE_MUTATION,
  DELETE_COURSE_MUTATION,
  CREATE_LECTURE_MUTATION,
} from "@/lib/graphql/courses";
import { print } from "graphql";
import { getApiClient } from "@/lib/api/graphqlClient";
import { uploadImage, uploadVideo } from "@/lib/api/services/upload.service";

// ---- GraphQL Queries & Mutations ----

// ---- Actions ----

export async function getInstructorCoursesAction(): Promise<CoursesResponse> {
  const data = await fetchGraphqlServer<{ courses: CoursesResponse }>(
    GET_INSTRUCTOR_COURSES,
  );

  return data.courses;
}

// get courses by instructor id
export async function getCoursesByInstructorIdAction() {
  const axios = await getApiClient();

  const { data } = await axios.post("", {
    query: GET_Courses_By_Instructor,
  });

  return data;
}

// export async function getCoursesByInstructorIdAction(): Promise<CoursesResponse> {
//   const data = await authFetchGraphQL(GET_Courses_By_Instructor);
//   logger.info("GET_Courses_By_Instructor", data);

//   return data.coursesByInstructor;
// }

export async function uploadCourseImageAction(
  formData: FormData,
): Promise<string> {
  return uploadImage(formData);
}

export async function uploadLectureVideoAction(
  formData: FormData,
): Promise<string> {
  // Extract the file from FormData and use the upload service
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");
  return uploadVideo(file);
}

export async function createCourseAction(data: {
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
  lectures?: string[];
}) {
  const result = await authFetchGraphQL(print(CREATE_COURSE_MUTATION), {
    createCourseInput: {
      title: data.title,
      description: data.description,
      price: data.price,
      categories: data.categories,
      level: data.level,
      primaryLanguage: data.primaryLanguage,
      objectives: data.objectives,
      welcomeMessage: data.welcomeMessage,
      isPublished: data.isPublished,

      image: data.image || "",
      lectures: data.lectures || [],
    },
  });
  return result;
}

export async function createSingleLectureAction(data: {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  freePreview?: boolean;
}) {
  const result = await authFetchGraphQL(CREATE_LECTURE_MUTATION, {
    createLectureInput: {
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      duration: data.duration,
      freePreview: data.freePreview ?? false,
    },
  });
  return result.createLecture;
}

export async function updateCourseAction(data: {
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
  lectures?: string[];
}) {
  const result = await authFetchGraphQL(UPDATE_COURSE_MUTATION, {
    updateCourseInput: data,
  });
  return result.updateCourse;
}

export async function deleteCourseAction(id: string) {
  const result = await authFetchGraphQL(DELETE_COURSE_MUTATION, { id });
  return result.removeCourse;
}

// *******************************************

// export async function getCourses() {
//   const axios = await getApiClient();

//   const { data } = await axios.post("", {
//     query: GET_Courses_By_Instructor,
//   });

//   return data;
// }

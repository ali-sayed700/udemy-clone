/**
 * Course progress service — centralizes calls to the Next.js API routes
 * for marking lectures as viewed or completed.
 *
 * Uses apiClient so all requests go through shared interceptors.
 * These call the internal /api/course-progress/* routes, which in turn
 * call the GraphQL backend with server-side auth.
 */
import apiClient from "../apiClient";

interface ProgressResponse {
  data?: {
    markLectureViewed?: CourseProgressData;
    markLectureCompleted?: CourseProgressData;
  };
  errors?: Array<{ message: string }>;
}

interface CourseProgressData {
  _id: string;
  lecture: { _id: string; title: string };
  viewed: boolean;
  viewedDate?: string;
  completed: boolean;
  completedDate?: string;
}

/**
 * Mark a lecture as viewed via the Next.js API route.
 */
export async function markLectureViewed(
  courseId: string,
  lectureId: string,
): Promise<CourseProgressData | null> {
  const { data } = await apiClient.post<ProgressResponse>(
    "/api/course-progress/mark-viewed",
    { courseId, lectureId },
    { baseURL: "" }, // override to hit Next.js internal route
  );

  if (data.errors) {
    throw new Error(data.errors.map((e) => e.message).join("; "));
  }

  return data.data?.markLectureViewed ?? null;
}

/**
 * Mark a lecture as completed via the Next.js API route.
 */
export async function markLectureCompleted(
  courseId: string,
  lectureId: string,
): Promise<CourseProgressData | null> {
  const { data } = await apiClient.post<ProgressResponse>(
    "/api/course-progress/mark-completed",
    { courseId, lectureId },
    { baseURL: "" }, // override to hit Next.js internal route
  );

  if (data.errors) {
    throw new Error(data.errors.map((e) => e.message).join("; "));
  }

  return data.data?.markLectureCompleted ?? null;
}

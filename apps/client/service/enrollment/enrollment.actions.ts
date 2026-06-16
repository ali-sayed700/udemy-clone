"use server";

import { getSession } from "@/lib/session";
import { Enrollment } from "@/types/enrollment.types";
import { CourseStatusInfo } from "@/types/course-progress.types";
import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import { queryEnroll } from "@/lib/graphql/enrollments";
import { All_Courses_Status } from "@/lib/graphql/progress";

/**
 * Fetch all courses the current user is enrolled in
 */
export async function getMyEnrollmentsAction(): Promise<Enrollment[] | null> {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      // logger.error("❌ No session or access token found");
      throw new Error("Unauthorized - please login to view enrollments");
      // return null;
    }

    const response = (await authFetchGraphQL(queryEnroll)) as {
      myEnrollments: Enrollment[];
    };

    return response?.myEnrollments || null;
  } catch (error) {
    throw new Error(
      `Failed to fetch enrollments: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Fetch progress status for all enrolled courses
 */
export async function getAllCoursesStatusAction(): Promise<
  CourseStatusInfo[] | null
> {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      throw new Error("Unauthorized - please login to view course status");
      // return null;
    }

    const response = (await authFetchGraphQL(All_Courses_Status)) as {
      allMyCoursesStatus: CourseStatusInfo[];
    };

    return response?.allMyCoursesStatus || null;
  } catch (error) {
    throw Error(
      `Failed to fetch course status`,
      error instanceof Error ? error : new Error("Unknown error"),
    );
    // throw  error;
  }
}

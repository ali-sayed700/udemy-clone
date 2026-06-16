"use server";
import { getApiClient } from "@/lib/api/graphqlClient";
import { GET_Course, GET_Courses } from "@/lib/graphql/courses";

// get all  courses
export async function GetCourseAction(queryReq: Record<string, unknown> = {}) {
  const axios = await getApiClient();

  const { data } = await axios.post("", {
    query: GET_Courses,
    variables: { queryReq: queryReq || {} },
    signal: AbortSignal.timeout(5000), // Set a timeout of 5 seconds
  });
  return data;
}

//  get course by id
export async function GetCourseByIdAction(id: string) {
  const axios = await getApiClient();

  const { data } = await axios.post("", {
    query: GET_Course,
    variables: { id },
    signal: AbortSignal.timeout(5000), // Set a timeout of 5 seconds
  });

  return data;
}

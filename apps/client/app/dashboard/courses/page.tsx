// import { getCoursesByInstructorIdAction } from "@/service/dashboard/courseCrud.actions";
// import { DASHBOARD_COURSES_QUERY_KEY } from "@/service/dashboard/courseCrud.service";
// import {
//   dehydrate,
//   HydrationBoundary,
//   QueryClient,
// } from "@tanstack/react-query";
import CourseDashboard from "./_component/CourseDashboard";

export default async function CoursesPage() {
  // const queryClient = new QueryClient();

  // await queryClient.prefetchQuery({
  //   queryKey: [DASHBOARD_COURSES_QUERY_KEY],
  //   queryFn: getCoursesByInstructorIdAction,
  // });

  return (
    // <HydrationBoundary state={dehydrate(queryClient)}>
    <CourseDashboard />
    // {/* </HydrationBoundary> */}
  );
}

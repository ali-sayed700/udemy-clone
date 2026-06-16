"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useGetAllCourses from "@/service/all-courses-service/coursesCrud.useQuery";
import CourseCard from "@/components/course/CourseCard";
import CoursesSidebar from "./_components/CoursesSidebar";
import CourseSearchHeader from "./_components/CourseSearchHeader";
import { BookOpen } from "lucide-react";
import { LottieLoading } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/error-state";
import type { Course } from "@/types/course.types";

export default function CoursesPage() {
  const searchParams = useSearchParams();

  const keyword = searchParams.get("keyword") || undefined;
  const categories = searchParams.get("categories") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const priceParam = searchParams.get("price") || undefined;

  const queryReq = useMemo(() => {
    const price =
      priceParam === "free"
        ? { eq: 0 }
        : priceParam === "paid"
          ? { gt: 0 }
          : undefined;

    return {
      limit: "24",
      fields:
        "_id,title,description,price,image,categories,level,primaryLanguage,instructor,isPublished,createdAt,updatedAt",
      ...(keyword && { keyword }),
      ...(categories && { categories }),
      ...(sort && { sort }),
      ...(price && { price }),
    };
  }, [categories, keyword, priceParam, sort]);

  const { data, isLoading, isError, error, refetch } =
    useGetAllCourses(queryReq);
  const courses = data?.data?.courses || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar for Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <CoursesSidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          <CourseSearchHeader />

          <div className="w-full">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <LottieLoading size="md" text="Searching courses..." />
              </div>
            ) : isError ? (
              <ErrorState
                error={error}
                title="Failed to load courses"
                type="generic"
                onRetry={() => refetch()}
              />
            ) : courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses match your filters"
                message="Try adjusting your search criteria or clearing some filters."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: Course) => (
                  <CourseCard key={course?._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import CourseCard from "@/components/course/CourseCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CarouselSkeleton, LottieLoading } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/error-state";
import { BookOpen } from "lucide-react";
import useGetAllCourses from "@/service/all-courses-service/coursesCrud.useQuery";
import type { Course } from "@/types/course.types";

const HomeCourse = () => {
  const { data, isLoading, isError, error, refetch } = useGetAllCourses({
    limit: "6",
    fields:
      "_id,title,description,price,image,categories,level,primaryLanguage,instructor,isPublished,createdAt,updatedAt",
  });
  if (isLoading) {
    return (
      <div className="space-y-4">
        <CarouselSkeleton count={3} showNavigation={true} />
        <LottieLoading size="sm" text="Fetching latest courses..." />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        title="Failed to load courses"
        type="generic"
        onRetry={() => refetch()}
      />
    );
  }

  const courses = data?.data?.courses || [];

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses available"
        message="There are no courses to display at the moment. Check back later!"
      />
    );
  }

  return (
    <Carousel className="w-full m-auto">
      <CarouselContent>
        {courses.map((course: Course) => (
          <CarouselItem key={course?._id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <CourseCard course={course} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 md:left-8" />
      <CarouselNext className="right-4 md:right-8" />
    </Carousel>
  );
};

export default HomeCourse;

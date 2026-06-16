"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shapes, BookOpen, Code, Palette, Database } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Course } from "@/types/course.types";
import FavoriteButton from "@/components/course/FavoriteButton";

interface CourseCardProps {
  course: Course;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ElementType> = {
    development: Code,
    design: Palette,
    business: BookOpen,
    database: Database,
  };
  const IconComponent = icons[category?.toLowerCase()] || Shapes;
  return <IconComponent className="h-5 w-5" />;
};

const CourseCard = ({ course }: CourseCardProps) => {
  const router = useRouter();
  const courseHref = `/course/${course?._id}/course_details`;

  return (
    <Card className="group relative w-full shadow-none gap-0 pt-0 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md focus-within:ring-2 focus-within:ring-primary/40">
      <Link
        href={courseHref}
        prefetch={false}
        onMouseEnter={() => router.prefetch(courseHref)}
        onFocus={() => router.prefetch(courseHref)}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={course?.title || "View course details"}
      >
        <span className="sr-only">
          {course?.title || "View course details"}
        </span>
      </Link>
      <CardHeader className="py-4 px-5 flex flex-row items-center gap-3 font-semibold">
        <div className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
          {getCategoryIcon(course?.categories || "")}
        </div>
        <span className="truncate">{course?.title}</span>
      </CardHeader>

      <CardContent className="mt-1 text-[15px] text-muted-foreground px-5">
        <p className="line-clamp-3">{course?.description}</p>
        {course?.image ? (
          <div className="mt-5 w-full aspect-video bg-muted rounded-xl overflow-hidden relative">
            <Image
              src={course.image}
              alt={course.title || "Course representation"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            <div className="absolute top-2 right-2 z-20">
              <FavoriteButton courseId={course?._id || ""} />
            </div>
          </div>
        ) : (
          <div className="mt-5 w-full aspect-video bg-muted rounded-xl flex items-center justify-center relative">
            <Shapes className="h-12 w-12 text-muted-foreground/30" />

            <div className="absolute top-2 right-2 z-20">
              <FavoriteButton courseId={course?._id || ""} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;

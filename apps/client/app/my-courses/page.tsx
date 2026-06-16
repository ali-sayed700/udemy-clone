"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGetMyCoursesWithProgressQuery } from "@/service/enrollment/enrollment.useQuery";
import {
  PlayCircle,
  CheckCircle,
  Clock,
  BookOpen,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Enrollment } from "@/types/enrollment.types";
import { CourseStatusInfo } from "@/types/course-progress.types";

type FilterType = "all" | "not_started" | "in_progress" | "completed";

interface EnrolledCourseWithStatus {
  enrollment: Enrollment;
  status: CourseStatusInfo | null;
}

export default function MyCoursesPage() {
  const { data, isLoading, isError, error } =
    useGetMyCoursesWithProgressQuery();
  const [filter, setFilter] = useState<FilterType>("all");

  const courses = data?.courses || [];

  const filteredCourses =
    filter === "all"
      ? courses
      : courses.filter(
          (c: EnrolledCourseWithStatus) => c.status?.status === filter,
        );

  const counts = {
    all: courses.length,
    not_started: courses.filter(
      (c: EnrolledCourseWithStatus) => c.status?.status === "not_started",
    ).length,
    in_progress: courses.filter(
      (c: EnrolledCourseWithStatus) => c.status?.status === "in_progress",
    ).length,
    completed: courses.filter(
      (c: EnrolledCourseWithStatus) => c.status?.status === "completed",
    ).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">
            Loading your courses...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md text-center border border-border">
          <BookOpen className="h-16 w-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Failed to Load Courses
          </h2>
          <p className="text-muted-foreground mb-2">
            {error instanceof Error
              ? error.message
              : "There was an error loading your courses."}
          </p>
          <p className="text-sm text-muted mb-6">Please try again later.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
              <p className="text-muted-foreground mt-2">
                Track your progress across all enrolled courses
              </p>
            </div>
            <Button
              asChild
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Link href="/">
                Browse Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "All Courses",
                value: counts.all,
                icon: BookOpen,
                color:
                  "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
              },
              {
                label: "Not Started",
                value: counts.not_started,
                icon: Clock,
                color:
                  "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
              },
              {
                label: "In Progress",
                value: counts.in_progress,
                icon: PlayCircle,
                color:
                  "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950",
              },
              {
                label: "Completed",
                value: counts.completed,
                icon: CheckCircle,
                color:
                  "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "not_started", label: "Not Started" },
              { key: "in_progress", label: "In Progress" },
              { key: "completed", label: "Completed" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === tab.key
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-card text-muted-foreground border border-border hover:bg-accent"
              }`}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-16 text-center">
            <BookOpen className="h-20 w-20 text-muted mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {filter === "all"
                ? "No courses yet"
                : `No ${filter.replace("_", " ")} courses`}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              {filter === "all"
                ? "You haven't enrolled in any courses yet. Start learning today!"
                : "Check other tabs to see your courses."}
            </p>
            {filter === "all" && (
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Link href="/course">Explore Courses</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(
              ({ enrollment, status }: EnrolledCourseWithStatus) => {
                const course = enrollment.course as {
                  _id: string;
                  title: string;
                  description?: string;
                  image?: string;
                  instructor?: { userName: string };
                };

                const percentage = status?.percentage ?? 0;
                const courseStatus = status?.status ?? "not_started";
                const completedLectures = status?.completedCount ?? 0;
                const totalLectures = status?.totalLectures ?? 0;

                return (
                  <Link
                    key={enrollment._id}
                    href={`/course/${course._id}/learn`}
                    className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* Course Image */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {course.image ? (
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950" />
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                            courseStatus === "completed"
                              ? "bg-emerald-500/90 text-white"
                              : courseStatus === "in_progress"
                                ? "bg-indigo-500/90 text-white"
                                : "bg-slate-800/70 text-white"
                          }`}
                        >
                          {courseStatus === "completed" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : courseStatus === "in_progress" ? (
                            <PlayCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {courseStatus === "not_started"
                            ? "Not Started"
                            : courseStatus === "in_progress"
                              ? "In Progress"
                              : "Completed"}
                        </span>
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Course Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-foreground line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors text-lg">
                        {course.title}
                      </h3>
                      {course.instructor && (
                        <p className="text-sm text-muted-foreground mb-4">
                          by {course.instructor.userName}
                        </p>
                      )}

                      {/* Progress Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {completedLectures} of {totalLectures} lectures
                            </span>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                            {percentage}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-700 ${
                              percentage === 100
                                ? "bg-linear-to-r from-emerald-400 to-green-500"
                                : "bg-linear-to-r from-indigo-500 to-purple-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button className="w-full mt-4 py-2 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200 flex items-center justify-center gap-2">
                        {percentage === 100 ? "Review" : "Continue Learning"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { logger } from "@/lib/logger";

import { useEffect, useState } from "react";
import { graphqlClient } from "@/lib/api/graphqlClient";
import { Enrollment } from "@/types/enrollment.types";
import { CourseStatusInfo } from "@/types/course-progress.types";
import Link from "next/link";
import {
  PlayCircle,
  CheckCircle,
  Clock,
  BookOpen,
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import { queryEnroll } from "@/lib/graphql/enrollments";
import { All_Courses_Status } from "@/lib/graphql/progress";

interface EnrolledCourse {
  enrollment: Enrollment;
  status: CourseStatusInfo | null;
}

export default function MyLearningPage() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "not_started" | "in_progress" | "completed"
  >("all");

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch enrollments
        const enrollRes = await graphqlClient.post("", {
          query: queryEnroll,
        });

        const enrollments: Enrollment[] =
          enrollRes.data?.data?.myEnrollments || [];

        // Fetch all course statuses
        const statusRes = await graphqlClient.post("", {
          query: All_Courses_Status,
        });

        const statuses: CourseStatusInfo[] =
          statusRes.data?.data?.allMyCoursesStatus || [];

        // Merge enrollments with statuses
        const merged = enrollments.map((enrollment) => {
          const courseId =
            typeof enrollment.course === "object"
              ? enrollment.course._id
              : enrollment.course;
          const status = statuses.find((s) => s.courseId === courseId) || null;
          return { enrollment, status };
        });

        setCourses(merged);
      } catch (error) {
        logger.error("Failed to load learning data", error as Error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCourses =
    filter === "all"
      ? courses
      : courses.filter((c) => c.status?.status === filter);

  const counts = {
    all: courses.length,
    not_started: courses.filter((c) => c.status?.status === "not_started")
      .length,
    in_progress: courses.filter((c) => c.status?.status === "in_progress")
      .length,
    completed: courses.filter((c) => c.status?.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">My Learning</h2>
        <p className="text-sm text-slate-500 mt-1">
          Track your progress across all enrolled courses.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "All Courses",
            value: counts.all,
            icon: BookOpen,
            color: "text-slate-600 bg-slate-100",
          },
          {
            label: "Not Started",
            value: counts.not_started,
            icon: Clock,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "In Progress",
            value: counts.in_progress,
            icon: PlayCircle,
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "Completed",
            value: counts.completed,
            icon: CheckCircle,
            color: "text-emerald-600 bg-emerald-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === tab.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Course grid */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-100 text-center">
          <BookOpen className="h-16 w-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            {filter === "all"
              ? "No courses enrolled yet"
              : `No ${filter.replace("_", " ")} courses`}
          </h3>
          <p className="text-slate-500 max-w-sm">
            {filter === "all"
              ? "Explore and enroll in courses to start learning!"
              : "Check other tabs to see your courses."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(({ enrollment, status }) => {
            const course = enrollment.course as {
              _id: string;
              title: string;
              image?: string;
              instructor?: { userName: string };
              lectures?: { _id: string }[];
            };

            const percentage = status?.percentage ?? 0;
            const courseStatus = status?.status ?? "not_started";

            return (
              <Link
                key={enrollment._id}
                href={`/course/${course._id}/learn`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                {/* Course image */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100" />
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
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
                </div>

                {/* Course info */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  {course.instructor && (
                    <p className="text-xs text-slate-500 mb-3">
                      {course.instructor.userName}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {status?.completedCount ?? 0} of{" "}
                          {status?.totalLectures ?? 0} lectures
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          percentage === 100
                            ? "bg-gradient-to-r from-emerald-400 to-green-500"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

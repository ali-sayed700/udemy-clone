"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Plus, Search, Pencil, Trash2, Video } from "lucide-react";
import Link from "next/link";
import CreateCourseModal from "@/components/dashboard/CreateCourseModal";
import EditCourseModal from "@/components/dashboard/EditCourseModal";
import DeleteCourseDialog from "@/components/dashboard/DeleteCourseDialog";
import ManageLecturesModal from "@/components/dashboard/ManageLecturesModal";
import type { Course } from "@/types/course.types";
import { DashboardPageSkeleton } from "@/components/dashboard/DashboardSkeleton";
import Image from "next/image";
import { useDashboardCoursesById } from "@/service/dashboard/courseCrud.service";

const EMPTY_COURSES: Course[] = [];

const CourseDashboard = () => {
  const { data, isLoading } = useDashboardCoursesById();

  const courses = data?.data?.coursesByInstructor ?? EMPTY_COURSES;

  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [manageLecturesCourse, setManageLecturesCourse] =
    useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(courses.map((course) => course.categories).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [courses],
  );

  const filtered = useMemo(
    () =>
      courses.filter((course) => {
        const matchSearch =
          !normalizedSearch ||
          course.title.toLowerCase().includes(normalizedSearch);
        const matchStatus =
          !statusFilter ||
          (statusFilter === "published"
            ? course.isPublished
            : !course.isPublished);
        const matchCategory =
          !categoryFilter || course.categories === categoryFilter;
        return matchSearch && matchStatus && matchCategory;
      }),
    [categoryFilter, courses, normalizedSearch, statusFilter],
  );

  if (isLoading) return <DashboardPageSkeleton />;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Courses
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and organize all your courses
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none w-full"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((course) => (
          <div
            key={course._id}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
              {course.image ? (
                <Image
                  loading="eager"
                  width={500}
                  height={500}
                  src={course?.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-950/20 dark:via-slate-900 dark:to-pink-950/20 flex items-center justify-center">
                  <span className="text-4xl font-bold text-indigo-300 dark:text-indigo-700">
                    {course.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${
                    course.isPublished
                      ? "bg-emerald-500/90 text-white"
                      : "bg-amber-500/90 text-white"
                  }`}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Lecture count badge */}
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <Video className="w-3.5 h-3.5" />
                <span>{course.lectures?.length || 0} lectures</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${course.price}
                  </span>
                  <span>
                    {course.studentCount ?? course.students?.length ?? 0} students
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/course/${course._id}/course_details`}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setManageLecturesCourse(course)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    title="Manage Lectures"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditCourse(course)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteCourse({ id: course._id!, title: course.title })
                    }
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {courses.length === 0 ? "No courses yet" : "No matching courses"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {courses.length === 0
              ? "Create your first course to get started"
              : "Try adjusting your filters"}
          </p>
        </div>
      )}

      {/* Modals */}
      <CreateCourseModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditCourseModal
        isOpen={!!editCourse}
        onClose={() => setEditCourse(null)}
        course={editCourse}
      />
      {deleteCourse && (
        <DeleteCourseDialog
          isOpen={!!deleteCourse}
          onClose={() => setDeleteCourse(null)}
          courseId={deleteCourse.id}
          courseTitle={deleteCourse.title}
        />
      )}
      {manageLecturesCourse && (
        <ManageLecturesModal
          isOpen={!!manageLecturesCourse}
          onClose={() => setManageLecturesCourse(null)}
          course={manageLecturesCourse}
        />
      )}
    </div>
  );
};

export default CourseDashboard;

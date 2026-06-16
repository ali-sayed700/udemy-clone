import { logger } from "@/lib/logger";
import { Users, UserPlus, TrendingUp, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import type { Course } from "@/types/course.types";
import DashboardMetricCard from "@/components/dashboard/DashboardMetricCard";

import { DASHBOARD_STUDENTS_QUERY } from "@/lib/graphql/dashboard";

interface CoursesData {
  coursesByInstructor: Course[];
}

export default async function StudentsPage() {
  let courses: Course[] = [];

  try {
    const data = (await authFetchGraphQL(
      DASHBOARD_STUDENTS_QUERY,
    )) as CoursesData;
    courses = data.coursesByInstructor || [];
  } catch (error) {
    logger.error("Failed to fetch courses:", error as Error);
  }

  const studentsList: {
    id: string;
    name: string;
    email: string;
    course: string;
    joinedAt: string;
  }[] = courses.flatMap((course) =>
    (course.students ?? []).map((student) => ({
      id: student._id,
      name: student.userName,
      email: student.email ?? "",
      course: course.title,
      joinedAt: course.createdAt,
    })),
  );

  const totalStudents = courses.reduce(
    (sum, course) => sum + (course.studentCount ?? course.students?.length ?? 0),
    0,
  );
  const activeCourses = courses.filter((course) => course.isPublished).length;

  const studentStats: {
    title: string;
    value: string;
    icon: LucideIcon;
    color: "indigo" | "emerald" | "violet" | "amber";
  }[] = [
    {
      title: "Total Students",
      value: totalStudents.toLocaleString(),
      icon: Users,
      color: "indigo",
    },
    {
      title: "Enrollments",
      value: studentsList.length.toLocaleString(),
      icon: UserPlus,
      color: "emerald",
    },
    {
      title: "Active Courses",
      value: activeCourses.toString(),
      icon: GraduationCap,
      color: "violet",
    },
    {
      title: "Growth",
      value: totalStudents > 0 ? `+${totalStudents}` : "0",
      icon: TrendingUp,
      color: "amber",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Students
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of your student base
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {studentStats.map((stat) => (
          <DashboardMetricCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Enrolled Students
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                  Student
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                  Course
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                  Enrolled
                </th>
              </tr>
            </thead>
            <tbody>
              {studentsList.length > 0 ? (
                studentsList.map((student, index) => (
                  <tr
                    key={`${student.id}-${index}`}
                    className="border-t border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {student.name}
                        </span>
                        {student.email && (
                          <span className="text-xs text-slate-400">
                            {student.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400">
                        {student.course}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(student.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No students enrolled yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

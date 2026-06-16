import { logger } from "@/lib/logger";
import RevenueChart from "@/components/dashboard/RevenueChart";
import EnrollmentChart from "@/components/dashboard/EnrollmentChart";
import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import type { Course } from "@/types/course.types";
import type { Order } from "@/types/order.types";
import {
  buildEnrollmentData,
  buildMonthlyRevenue,
  buildPurchaseRows,
  getCourseStudentCount,
} from "@/lib/dashboard-metrics";
import { BookOpen, DollarSign, Users, Video } from "lucide-react";

import {
  DASHBOARD_COURSES_QUERY,
  DASHBOARD_ORDERS_QUERY,
} from "@/lib/graphql/dashboard";

interface InstructorCoursesData {
  coursesByInstructor: Course[];
}

interface DashboardOrdersData {
  dashboardOrders: Order[];
}

const colorMap: Record<string, { bg: string; text: string }> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/50",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/50",
    text: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-600 dark:text-amber-400",
  },
};

export default async function AnalyticsPage() {
  let courses: Course[] = [];
  let orders: Order[] = [];

  try {
    const [coursesData, ordersData] = await Promise.all([
      authFetchGraphQL(DASHBOARD_COURSES_QUERY) as Promise<InstructorCoursesData>,
      authFetchGraphQL(DASHBOARD_ORDERS_QUERY) as Promise<DashboardOrdersData>,
    ]);
    courses = coursesData.coursesByInstructor || [];
    orders = ordersData.dashboardOrders || [];
  } catch (error) {
    logger.error("Failed to fetch analytics data:", error as Error);
  }

  const totalStudents = courses.reduce(
    (sum, c) => sum + getCourseStudentCount(c),
    0,
  );
  const purchases = buildPurchaseRows(orders);
  const revenueData = buildMonthlyRevenue(purchases);
  const totalRevenue = revenueData.total;
  const revenueByCourseId = purchases.reduce<Record<string, number>>(
    (totals, purchase) => {
      if (!purchase.courseId) return totals;
      totals[purchase.courseId] = (totals[purchase.courseId] ?? 0) + purchase.amount;
      return totals;
    },
    {},
  );
  const totalLectures = courses.reduce(
    (sum, c) => sum + (c.lectures?.length ?? 0),
    0,
  );
  const publishedCount = courses.filter((c) => c.isPublished).length;

  const topMetrics = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: `from ${purchases.length} paid purchases`,
      icon: DollarSign,
      color: "indigo",
    },
    {
      title: "Total Students",
      value: totalStudents.toLocaleString(),
      subtitle: `across ${courses.length} courses`,
      icon: Users,
      color: "emerald",
    },
    {
      title: "Published Courses",
      value: `${publishedCount}`,
      subtitle: `of ${courses.length} total`,
      icon: BookOpen,
      color: "violet",
    },
    {
      title: "Total Lectures",
      value: totalLectures.toLocaleString(),
      subtitle: `avg ${courses.length > 0 ? Math.round(totalLectures / courses.length) : 0} per course`,
      icon: Video,
      color: "amber",
    },
  ];

  const enrollmentData = buildEnrollmentData(courses);
  const topCourses = [...courses]
    .sort(
      (a, b) =>
        (revenueByCourseId[b._id ?? ""] ?? 0) -
        (revenueByCourseId[a._id ?? ""] ?? 0),
    )
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Performance insights for your courses
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {topMetrics.map((metric) => {
          const colors = colorMap[metric.color];
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {metric.title}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {metric.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {metric.subtitle}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <RevenueChart
          data={revenueData.monthly}
          total={totalRevenue}
          growth={revenueData.growth}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentChart
          data={enrollmentData.byCourse}
          total={enrollmentData.total}
        />

        {/* Course Performance Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Top Performing Courses
          </h3>
          <div className="space-y-4">
            {topCourses.map((course, i) => (
              <div
                key={course._id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getCourseStudentCount(course)} students ·{" "}
                    {course.lectures?.length ?? 0} lectures
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  $
                  {(revenueByCourseId[course._id ?? ""] ?? 0).toLocaleString()}
                </span>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No courses yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

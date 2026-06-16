import { logger } from "@/lib/logger";
import StatCard from "@/components/dashboard/StatCard";
import EnrollmentChart from "@/components/dashboard/EnrollmentChart";
import CoursesTable from "@/components/dashboard/CoursesTable";
import Image from "next/image";
import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import {
  buildEnrollmentData,
  buildMonthlyRevenue,
  buildPurchaseRows,
  getCourseStudentCount,
} from "@/lib/dashboard-metrics";
import type { Course } from "@/types/course.types";
import type { Order } from "@/types/order.types";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  DASHBOARD_COURSES_QUERY,
  DASHBOARD_ORDERS_QUERY,
} from "@/lib/graphql/dashboard";
import { getSession } from "@/lib/session";

interface InstructorCoursesData {
  coursesByInstructor: Course[];
}

interface DashboardOrdersData {
  dashboardOrders: Order[];
}

export default async function DashboardPage() {
  let courses: Course[] = [];
  let orders: Order[] = [];
  const session = await getSession();
  const isAdmin = session?.user?.role?.toLowerCase() === "admin";

  try {
    const [coursesData, ordersData] = await Promise.all([
      authFetchGraphQL(DASHBOARD_COURSES_QUERY) as Promise<InstructorCoursesData>,
      authFetchGraphQL(DASHBOARD_ORDERS_QUERY) as Promise<DashboardOrdersData>,
    ]);
    courses = coursesData.coursesByInstructor || [];
    orders = ordersData.dashboardOrders || [];
  } catch (error) {
    logger.error("Failed to fetch dashboard data:", error as Error);
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
  const publishedCount = courses.filter((c) => c.isPublished).length;
  const totalLectures = courses.reduce(
    (sum, c) => sum + (c.lectures?.length ?? 0),
    0,
  );

  const stats = [
    {
      title: isAdmin ? "All Courses" : "My Courses",
      value: courses.length,
      trend: publishedCount,
      trendLabel: "published",
      icon: "courses",
      color: "indigo",
    },
    {
      title: "Total Students",
      value: totalStudents.toLocaleString(),
      trend: totalLectures,
      trendLabel: "total lectures",
      icon: "students",
      color: "emerald",
    },
    {
      title: "Est. Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      trend: purchases.length,
      trendLabel: "paid course purchases",
      icon: "revenue",
      color: "violet",
    },
    {
      title: "Published",
      value: `${publishedCount}/${courses.length}`,
      trend:
        courses.length > 0
          ? Math.round((publishedCount / courses.length) * 100)
          : 0,
      trendLabel: "% publish rate",
      icon: "rating",
      color: "amber",
    },
  ];

  const enrollmentData = buildEnrollmentData(courses);
  const latestPurchases = purchases.slice(0, 6);
  const topCourses = [...courses]
    .sort(
      (a, b) =>
        (revenueByCourseId[b._id ?? ""] ?? 0) -
        (revenueByCourseId[a._id ?? ""] ?? 0),
    )
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Enrollment Chart + Course Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentChart
          data={enrollmentData.byCourse}
          total={enrollmentData.total}
        />

        {/* Course Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Course Breakdown
            </h3>
            <Link
              href="/dashboard/courses"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {topCourses.map((course, i) => (
              <div
                key={course._id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  {i + 1}
                </span>
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={40}
                    height={28}
                    className="w-10 h-7 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-7 rounded bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getCourseStudentCount(course)} students ·{" "}
                    {course.lectures?.length ?? 0} lectures
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    $
                    {(revenueByCourseId[course._id ?? ""] ?? 0).toLocaleString()}
                  </span>
                  <p className="text-xs text-slate-400">
                    {course.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No courses yet. Create your first course!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Courses Table + Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CoursesTable courses={courses} />
        </div>

        {/* Recent Purchases */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Purchases
            </h3>
            <Link
              href="/dashboard/orders"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {latestPurchases.length > 0 ? (
              latestPurchases.map((purchase, i) => (
                <div
                  key={`${purchase.orderId}-${purchase.courseId}-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {purchase.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {purchase.studentName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {purchase.courseTitle}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    +${purchase.amount.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No purchases yet</p>
                <p className="text-xs text-slate-300 dark:text-slate-500 mt-1">
                  Students will appear here once they enroll
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

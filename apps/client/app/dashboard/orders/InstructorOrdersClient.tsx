"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Search,
} from "lucide-react";
import StudentDetailsSheet, {
  StudentDetails,
} from "@/components/dashboard/StudentDetailsSheet";
import DashboardMetricCard from "@/components/dashboard/DashboardMetricCard";
import { buildPurchaseRows } from "@/lib/dashboard-metrics";
import type { Course } from "@/types/course.types";
import type { Order } from "@/types/order.types";

export default function InstructorOrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(
    null,
  );

  const courseOptions = useMemo(
    () =>
      Array.from(
        new Map(
          initialOrders.flatMap((order) =>
            order.courses.map((course) => [course._id, course] as const),
          ),
        ).values(),
      ).filter(
        (course): course is Course & { _id: string } => Boolean(course._id),
      ),
    [initialOrders],
  );

  const allPurchases = useMemo(
    () => buildPurchaseRows(initialOrders),
    [initialOrders],
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      allPurchases.filter((purchase) => {
        const matchSearch =
          !normalizedSearch ||
          purchase.studentName.toLowerCase().includes(normalizedSearch) ||
          purchase.courseTitle.toLowerCase().includes(normalizedSearch);
        const matchCourse = !courseFilter || purchase.courseId === courseFilter;
        return matchSearch && matchCourse;
      }),
    [allPurchases, courseFilter, normalizedSearch],
  );

  const stats = useMemo(() => {
    const totalRevenue = allPurchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0,
    );
    const uniqueStudents = new Set(
      allPurchases.map((purchase) => purchase.studentId ?? purchase.studentName),
    ).size;

    return [
      {
        title: "Total Purchases",
        value: allPurchases.length,
        icon: ShoppingBag,
        color: "indigo" as const,
      },
      {
        title: "Total Revenue",
        value: `$${totalRevenue.toLocaleString()}`,
        icon: DollarSign,
        color: "emerald" as const,
      },
      {
        title: "Unique Students",
        value: uniqueStudents,
        icon: Users,
        color: "violet" as const,
      },
      {
        title: "Courses Sold",
        value: courseOptions.length,
        icon: TrendingUp,
        color: "amber" as const,
      },
    ];
  }, [allPurchases, courseOptions.length]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Orders
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Students who purchased your courses
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <DashboardMetricCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or course..."
            className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none w-full"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none cursor-pointer"
        >
          <option value="">All Courses</option>
          {courseOptions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <ShoppingBag className="h-16 w-16 text-slate-200 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {allPurchases.length === 0
              ? "No purchases yet"
              : "No matching orders"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            {allPurchases.length === 0
              ? "When students purchase your courses, they will appear here."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Purchase History
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {filtered.length} purchase{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
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
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={`${row.orderId}-${row.courseId}-${idx}`}
                    onClick={() => setSelectedStudent(row)}
                    className="cursor-pointer border-t border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150"
                  >
                    {/* Student */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {row.studentInitial}
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {row.studentName}
                        </p>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {row.courseImage ? (
                          <Image
                            src={row.courseImage}
                            alt={row.courseTitle}
                            width={40}
                            height={28}
                            className="w-10 h-7 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-7 rounded bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 shrink-0" />
                        )}
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                          {row.courseTitle}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        +${row.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StudentDetailsSheet
        details={selectedStudent}
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      />
    </div>
  );
}

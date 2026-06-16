import type { Course } from "@/types/course.types";
import type { Order } from "@/types/order.types";
import type { ChartDataPoint, EnrollmentData } from "@/types/dashboard.types";
import { mockEnrollmentColors } from "@/lib/dashboard-mock-data";

export interface DashboardPurchase {
  orderId: string;
  studentId?: string;
  studentName: string;
  studentEmail?: string;
  studentInitial: string;
  courseTitle: string;
  courseImage?: string;
  amount: number;
  courseId: string | undefined;
  date?: string;
  status: Order["status"];
  paymentMethod: Order["paymentMethod"];
}

export function getCourseStudentCount(course: Course): number {
  return course.studentCount ?? course.students?.length ?? 0;
}

export function buildEnrollmentData(courses: Course[]): EnrollmentData {
  const byCourse = courses
    .map((course, index) => ({
      courseTitle:
        course.title.length > 20 ? `${course.title.slice(0, 20)}...` : course.title,
      count: getCourseStudentCount(course),
      color: mockEnrollmentColors[index % mockEnrollmentColors.length],
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    byCourse,
    total: courses.reduce((sum, course) => sum + getCourseStudentCount(course), 0),
  };
}

export function buildPurchaseRows(orders: Order[]): DashboardPurchase[] {
  return orders
    .flatMap((order) => {
      const amountPerCourse =
        order.courses.length > 0 ? order.totalAmount / order.courses.length : 0;
      const studentName = order.user?.userName || "Unknown Student";

      return order.courses.map((course) => ({
        orderId: order._id,
        studentId: order.user?._id,
        studentName,
        studentEmail: order.user?.email,
        studentInitial: studentName.charAt(0).toUpperCase() || "U",
        courseTitle: course.title || "Unknown Course",
        courseImage: course.image,
        amount: typeof course.price === "number" ? course.price : amountPerCourse,
        courseId: course._id,
        date: order.createdAt,
        status: order.status,
        paymentMethod: order.paymentMethod,
      }));
    })
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });
}

export function buildMonthlyRevenue(
  purchases: DashboardPurchase[],
  monthCount = 12,
): { monthly: ChartDataPoint[]; total: number; growth: number } {
  const now = new Date();
  const monthStarts = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const monthly = monthStarts.map((date) => ({
    label: date.toLocaleString("en-US", { month: "short" }),
    value: 0,
  }));

  purchases.forEach((purchase) => {
    if (!purchase.date) return;

    const purchaseDate = new Date(purchase.date);
    const monthIndex = monthStarts.findIndex(
      (monthStart) =>
        monthStart.getFullYear() === purchaseDate.getFullYear() &&
        monthStart.getMonth() === purchaseDate.getMonth(),
    );

    if (monthIndex >= 0) {
      monthly[monthIndex].value += purchase.amount;
    }
  });

  const previousMonthValue = monthly[monthly.length - 2]?.value ?? 0;
  const currentMonthValue = monthly[monthly.length - 1]?.value ?? 0;
  const growth =
    previousMonthValue > 0
      ? ((currentMonthValue - previousMonthValue) / previousMonthValue) * 100
      : currentMonthValue > 0
        ? 100
        : 0;

  return {
    monthly,
    total: purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
    growth: Number(growth.toFixed(1)),
  };
}

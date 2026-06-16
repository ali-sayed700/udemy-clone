import type { EnrollmentData } from "@/types/dashboard.types";

export const mockEnrollmentColors = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#818cf8",
  "#7c3aed",
  "#5b21b6",
  "#4f46e5",
];

export function generateEnrollmentData(courseTitles: string[]): EnrollmentData {
  const byCourse = courseTitles.slice(0, 8).map((title, i) => ({
    courseTitle: title.length > 20 ? title.slice(0, 20) + "..." : title,
    count: Math.floor(Math.random() * 150) + 20,
    color: mockEnrollmentColors[i % mockEnrollmentColors.length],
  }));

  return {
    byCourse,
    total: byCourse.reduce((sum, c) => sum + c.count, 0),
  };
}

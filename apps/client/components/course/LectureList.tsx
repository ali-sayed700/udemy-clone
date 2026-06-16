"use client";

import { memo, useCallback } from "react";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, Lecture } from "@/types/course.types";
import type { CourseProgress } from "@/types/enrollment.types";

type LectureWithId = Lecture & { _id: string };

interface LectureListProps {
  course: Course;
  progress: CourseProgress[];
  currentLectureId?: string;
  onSelectLecture: (lectureId: string) => void;
  completedCount: number;
  remainingCount: number;
}

/**
 * Best Practice Component: LectureList
 * Features:
 * - Shows all lectures with completion status
 * - Visual indicators for completed/incomplete/current
 * - Keyboard accessible
 * - Memoized for performance
 * - Clear separation of completed vs remaining
 */
export const LectureList = memo(function LectureList({
  course,
  progress,
  currentLectureId,
  onSelectLecture,
  completedCount,
  remainingCount,
}: LectureListProps) {
  const isLectureCompleted = useCallback(
    (lectureId: string) => {
      return progress.some((p) => p.lecture._id === lectureId && p.completed);
    },
    [progress],
  );

  const lectures = (course.lectures || []).filter(
    (lecture): lecture is LectureWithId => Boolean(lecture._id),
  );
  const completedLectures = lectures.filter((l) => isLectureCompleted(l._id!));
  const remainingLectures = lectures.filter((l) => !isLectureCompleted(l._id!));

  const renderLectureItem = (lecture: LectureWithId, isCompleted: boolean) => (
    <button
      key={lecture._id}
      onClick={() => onSelectLecture(lecture._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectLecture(lecture._id);
        }
      }}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        currentLectureId === lecture._id
          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
          : "border-l-4 border-transparent",
        isCompleted && "opacity-75",
      )}
      title={`${isCompleted ? "✓" : "○"} ${lecture.title}`}
      aria-current={currentLectureId === lecture._id ? "true" : "false"}
      aria-label={`${lecture.title}${isCompleted ? " - Completed" : " - Not completed"}`}
    >
      {isCompleted ? (
        <CheckCircle2
          className="w-5 h-5 text-green-500 flex-shrink-0"
          aria-hidden="true"
        />
      ) : (
        <Circle
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          aria-hidden="true"
        />
      )}

      <div className="flex-1 text-left min-w-0">
        <p
          className={cn(
            "truncate font-medium text-sm",
            currentLectureId === lecture._id
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-900 dark:text-gray-100",
            isCompleted && "line-through opacity-60",
          )}
        >
          {lecture.title}
        </p>
        {isCompleted && (
          <p className="text-xs text-green-600 dark:text-green-400">
            Completed
          </p>
        )}
      </div>

      {currentLectureId === lecture._id && (
        <ChevronRight
          className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0"
          aria-hidden="true"
        />
      )}
    </button>
  );

  return (
    <div className="space-y-4" role="navigation" aria-label="Course lectures">
      {/* Remaining Videos Section */}
      {remainingLectures.length > 0 && (
        <div>
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Remaining ({remainingCount})
            </h3>
          </div>
          <div className="space-y-1">
            {remainingLectures.map((l) => renderLectureItem(l, false))}
          </div>
        </div>
      )}

      {/* Completed Videos Section */}
      {completedLectures.length > 0 && (
        <div>
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
              Completed ({completedCount})
            </h3>
          </div>
          <div className="space-y-1">
            {completedLectures.map((l) => renderLectureItem(l, true))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {lectures.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">No lectures available</p>
        </div>
      )}
    </div>
  );
});

LectureList.displayName = "LectureList";

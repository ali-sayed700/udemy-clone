"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { CourseProgress } from "@/types/enrollment.types";
import type { Course } from "@/types/course.types";
import { getCourseLectures } from "@/lib/course-content";

interface ProgressHistoryProps {
  progress: CourseProgress[];
  completionPercentage: number;
  course: Course | null;
}

export function ProgressHistory({
  progress,
  completionPercentage,
  course,
}: ProgressHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  // Get completed lectures sorted by date (newest first) - memoized for performance
  const {
    completedLectures,
    viewedLectures,
    totalLectures,
    completedCount,
    firstCompletion,
    lastCompletion,
  } = useMemo(() => {
    const completed = progress
      .filter((p) => p.completed && p.completedDate)
      .sort((a, b) => {
        const dateA = new Date(a.completedDate || 0).getTime();
        const dateB = new Date(b.completedDate || 0).getTime();
        return dateB - dateA;
      });

    const viewed = progress.filter((p) => p.viewed || p.completed);
    const total = getCourseLectures(course).length;
    const completedCnt = completed.length;

    return {
      completedLectures: completed,
      viewedLectures: viewed,
      totalLectures: total,
      completedCount: completedCnt,
      firstCompletion:
        completedCnt > 0 ? completed[completedCnt - 1]?.completedDate : null,
      lastCompletion: completedCnt > 0 ? completed[0]?.completedDate : null,
    };
  }, [progress, course]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not started";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSinceCompletion = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 text-lg">
          Progress History
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium uppercase">
            Total Lectures
          </p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {totalLectures}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium uppercase">
            Completed
          </p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {completedCount}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-purple-600 font-medium uppercase">
            Viewed
          </p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {viewedLectures.length}
          </p>
        </div>

        <div className="bg-indigo-50 rounded-lg p-3">
          <p className="text-xs text-indigo-600 font-medium uppercase">
            Progress
          </p>
          <p className="text-2xl font-bold text-indigo-900 mt-1">
            {completionPercentage}%
          </p>
        </div>
      </div>

      {/* Expanded Timeline */}
      {expanded && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          {completedLectures.length > 0 ? (
            <>
              <p className="text-sm font-medium text-slate-700 mb-4">
                Completed Lectures ({completedCount})
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {completedLectures.map((item, index) => (
                  <div
                    key={item._id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {index + 1}. {item.lecture.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-xs text-slate-600">
                          {formatDate(item.completedDate)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {getTimeSinceCompletion(item.completedDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline Info */}
              {firstCompletion && lastCompletion && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium">
                        Started: {formatDate(firstCompletion)}
                      </p>
                      <p className="mt-1">Last: {formatDate(lastCompletion)}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">
              No lectures completed yet. Start watching to see your progress
              here!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

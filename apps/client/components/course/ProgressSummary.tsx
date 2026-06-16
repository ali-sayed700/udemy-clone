'use client';

import { memo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressSummaryProps {
  completedCount: number;
  remainingCount: number;
  completionPercentage: number;
  courseTitle: string;
}

/**
 * Best Practice Component: ProgressSummary
 * Features:
 * - Shows progress bar with visual feedback
 * - Displays completed/remaining count
 * - Memoized for performance
 * - Accessible progress indicators
 */
export const ProgressSummary = memo(function ProgressSummary({
  completedCount,
  remainingCount,
  completionPercentage,
  courseTitle,
}: ProgressSummaryProps) {
  const totalLectures = completedCount + remainingCount;
  const isComplete = completionPercentage === 100;

  return (
    <div className="space-y-3">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{courseTitle}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Progress Tracking</p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{completedCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Circle className="w-5 h-5 text-gray-400" aria-hidden="true" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Remaining</p>
            <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{remainingCount}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
          <p
            className={cn(
              'text-xs font-semibold',
              isComplete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400',
            )}
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Course completion: ${completionPercentage}%`}
          >
            {completionPercentage}%
          </p>
        </div>

        {/* Progress Bar Background */}
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Filled Portion */}
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              isComplete ? 'bg-green-500' : 'bg-blue-500',
            )}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Completion Message */}
      {isComplete && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">🎉 Course Completed!</p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            You've finished all {totalLectures} lectures. Ready for the next challenge?
          </p>
        </div>
      )}

      {/* Info Message */}
      {remainingCount > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            {remainingCount} lecture{remainingCount > 1 ? 's' : ''} remaining to complete this course
          </p>
        </div>
      )}
    </div>
  );
});

ProgressSummary.displayName = 'ProgressSummary';

'use client';

import { useState } from 'react';

interface EnrollmentItem {
  courseTitle: string;
  count: number;
  color: string;
}

interface EnrollmentChartProps {
  data: EnrollmentItem[];
  total: number;
}

export default function EnrollmentChart({ data, total }: EnrollmentChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Enrollment Distribution
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Students per course</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total students</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-400">No enrollment data yet</p>
          </div>
        )}
        {data.map((item, i) => {
          const pct = (item.count / maxCount) * 100;
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={i}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-sm font-medium truncate max-w-[200px] transition-colors duration-200 ${
                    isHovered ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.courseTitle}
                </span>
                <span
                  className={`text-sm font-semibold transition-all duration-200 ${
                    isHovered ? 'text-slate-900 dark:text-white scale-110' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                    opacity: isHovered ? 1 : 0.8,
                    transform: isHovered ? 'scaleY(1.2)' : 'scaleY(1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

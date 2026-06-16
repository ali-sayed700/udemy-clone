import { UserPlus, Star, RefreshCw, Trophy } from 'lucide-react';
import type { ActivityItem } from '@/types/dashboard.types';

const iconMap: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  enrollment: { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  review: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  course_update: {
    icon: RefreshCw,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  milestone: { icon: Trophy, color: 'text-violet-600', bg: 'bg-violet-50' },
};

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Recent Activity
        </h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer">
          View all
        </button>
      </div>

      <div className="space-y-1">
        {activities.map((activity, i) => {
          const config = iconMap[activity.type] || iconMap.enrollment;
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
            >
              {/* Timeline dot */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                {i < activities.length - 1 && (
                  <div className="w-px h-6 bg-slate-100 mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium text-slate-900">
                  {activity.title}
                </p>
                <p className="text-sm text-slate-500 mt-0.5 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

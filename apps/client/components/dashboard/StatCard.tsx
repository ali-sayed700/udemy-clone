import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Users,
  DollarSign,
  Star,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  courses: BookOpen,
  students: Users,
  revenue: DollarSign,
  rating: Star,
};

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon: string;
  color: string;
  index?: number;
}

export default function StatCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  color,
  index = 0,
}: StatCardProps) {
  const Icon = iconMap[icon] || BookOpen;
  const isPositive = trend >= 0;

  const colorClasses: Record<
    string,
    { bg: string; iconBg: string; border: string }
  > = {
    indigo: {
      bg: 'from-indigo-50 to-white dark:from-indigo-950/50 dark:to-slate-900',
      iconBg: 'from-indigo-500 to-indigo-600',
      border: 'hover:border-indigo-200 dark:hover:border-indigo-800',
    },
    emerald: {
      bg: 'from-emerald-50 to-white dark:from-emerald-950/50 dark:to-slate-900',
      iconBg: 'from-emerald-500 to-emerald-600',
      border: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    },
    violet: {
      bg: 'from-violet-50 to-white dark:from-violet-950/50 dark:to-slate-900',
      iconBg: 'from-violet-500 to-violet-600',
      border: 'hover:border-violet-200 dark:hover:border-violet-800',
    },
    amber: {
      bg: 'from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-900',
      iconBg: 'from-amber-500 to-amber-600',
      border: 'hover:border-amber-200 dark:hover:border-amber-800',
    },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800
        bg-gradient-to-br ${colors.bg}
        p-6 transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 ${colors.border}
        hover:-translate-y-0.5
      `}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
          <div className="flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span
              className={`text-xs font-semibold ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {trend}%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{trendLabel}</span>
          </div>
        </div>

        <div
          className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

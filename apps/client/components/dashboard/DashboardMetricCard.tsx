import type { LucideIcon } from "lucide-react";

type MetricColor = "indigo" | "emerald" | "violet" | "amber";

const colorMap: Record<MetricColor, { iconBg: string; textColor: string }> = {
  indigo: {
    iconBg: "bg-indigo-50 dark:bg-indigo-950/50",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  violet: {
    iconBg: "bg-violet-50 dark:bg-violet-950/50",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    textColor: "text-amber-600 dark:text-amber-400",
  },
};

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: MetricColor;
}

export default function DashboardMetricCard({
  title,
  value,
  icon: Icon,
  color,
}: DashboardMetricCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${colors.textColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

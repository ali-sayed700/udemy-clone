"use client";

import { useState } from "react";
import type { ChartDataPoint } from "@/types/dashboard.types";

interface RevenueChartProps {
  data: ChartDataPoint[];
  total: number;
  growth: number;
}

export default function RevenueChart({
  data,
  total,
  growth,
}: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = data.length > 0 ? data : [{ label: "No data", value: 0 }];
  const maxValue = Math.max(1, ...chartData.map((d) => d.value));
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 600;
  const height = 280;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = chartData.map((d, i) => ({
    x: padding.left + (i / Math.max(1, chartData.length - 1)) * chartWidth,
    y: padding.top + chartHeight - (d.value / maxValue) * chartHeight,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: Math.round(maxValue * pct),
    y: padding.top + chartHeight - pct * chartHeight,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Revenue Overview
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monthly revenue trends
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${total.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            +{growth}% growth
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map((l, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={l.y}
              x2={width - padding.right}
              y2={l.y}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={l.y + 4}
              textAnchor="end"
              className="text-[10px]"
              fill="#94a3b8"
            >
              ${(l.value / 1000).toFixed(1)}k
            </text>
          </g>
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#revenueGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 6 : 4}
              fill="#6366f1"
              stroke="white"
              strokeWidth="2.5"
              className="transition-all duration-200 cursor-pointer"
            />
            {/* X-axis label */}
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px]"
              fill="#94a3b8"
            >
              {p.label}
            </text>
            {/* Tooltip */}
            {hoveredIndex === i && (
              <g>
                <rect
                  x={p.x - 35}
                  y={p.y - 36}
                  width="70"
                  height="26"
                  rx="8"
                  fill="#1e293b"
                />
                <text
                  x={p.x}
                  y={p.y - 18}
                  textAnchor="middle"
                  fill="white"
                  className="text-[11px]"
                  fontWeight="600"
                >
                  ${p.value.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

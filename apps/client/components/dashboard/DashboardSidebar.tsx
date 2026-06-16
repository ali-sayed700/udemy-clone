"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ShoppingBag,
  X,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["admin", "instructor"],
  },
  {
    href: "/dashboard/courses",
    label: "Courses",
    icon: BookOpen,
    roles: ["admin", "instructor"],
  },
  {
    href: "/dashboard/students",
    label: "Students",
    icon: Users,
    roles: ["admin", "instructor"],
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: ShoppingBag,
    roles: ["admin", "instructor"],
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["admin", "instructor"],
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin", "instructor"],
  },
];

interface DashboardSidebarProps {
  userName?: string;
  avatar?: string;
  role?: string;
}

export default function DashboardSidebar({
  userName,
  avatar,
  role,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const normalizedRole = role?.toLowerCase() === "admin" ? "admin" : "instructor";
  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(normalizedRole),
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen
          flex flex-col
          bg-linear-to-b from-slate-900 via-slate-900 to-slate-950
          border-r border-slate-800/50
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800/50">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span
            className={`
              font-bold text-lg text-white tracking-tight
              transition-all duration-300
              ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
            `}
          >
            LearnHub
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium
                  transition-all duration-200 ease-out
                  ${
                    isActive
                      ? "bg-linear-to-r from-indigo-500/20 to-purple-500/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }
                `}
              >
                <div
                  className={`
                    shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-linear-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/30"
                        : "bg-slate-800/50 group-hover:bg-slate-700/50"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`
                    transition-all duration-300
                    ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
                  `}
                >
                  {item.label}
                </span>
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-800/50 px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="shrink-0 w-9 h-9 rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="avatar"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                userName?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div
              className={`
                flex-1 min-w-0 transition-all duration-300
                ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
              `}
            >
              <p className="text-sm font-medium text-white truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {normalizedRole}
              </p>
            </div>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full  items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50 cursor-pointer hidden lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Spacer to push content */}
      <div
        className={`shrink-0 transition-all duration-300 hidden lg:block ${collapsed ? "w-[72px]" : "w-64"}`}
      />
    </>
  );
}

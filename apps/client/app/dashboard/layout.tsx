import { getSession } from "@/lib/session";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Suspense } from "react";
import { DashboardPageSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { redirect } from "next/navigation";

export const metadata: { title: string; description: string } = {
  title: "Dashboard | LearnHub",
  description:
    "Manage your courses, track your students, and grow your teaching career.",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const role = session?.user?.role?.toLowerCase();

  if (!session?.user || (role !== "instructor" && role !== "admin")) {
    redirect("/my-courses");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar
        userName={session?.user?.userName}
        avatar={session?.user?.avatar}
        role={role}
      />
      <main className="flex-1 min-w-0 lg:ml-0 ml-12">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome back, {session?.user?.userName || "User"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {role === "admin"
                  ? "Manage courses, students, instructors, and orders."
                  : "Manage your courses, students, and orders."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 w-64">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none w-full"
                />
              </div>
              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <svg
                  className="w-5 h-5 text-slate-500 dark:text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <Suspense fallback={<DashboardPageSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}

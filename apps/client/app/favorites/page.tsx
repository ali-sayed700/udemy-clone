"use client";

import { Heart, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "@/components/course/FavoriteButton";
import { useGetMyFavoritesQuery } from "@/service/favorite/favorite.useQuery";
import { GridSkeleton } from "@/components/ui/skeleton";

export default function MyFavoritesPage() {
  const { data: favorites, isLoading, isError } = useGetMyFavoritesQuery();

  const favoritesList = favorites || [];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="mb-8">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-slate-100 rounded animate-pulse"></div>
        </div>
        <GridSkeleton count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Failed to Load Favorites
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          There was an error loading your favorite courses. Please try
          refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          My Favorites
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Courses you have saved for later.{" "}
          {favoritesList.length > 0 && `(${favoritesList.length} courses)`}
        </p>
      </div>

      {favoritesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-rose-200" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No favorites yet
          </h3>
          <p className="text-slate-500 max-w-sm mb-6">
            Explore our courses and hit the heart icon to save them here for
            easy access.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors gap-2"
          >
            <Search className="w-4 h-4" />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritesList.map((fav) => (
            <Link
              key={fav._id}
              href={`/course/${fav.course._id}/course_details`}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative cursor-pointer"
            >
              {/* Image container */}
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {fav.course.image ? (
                  <Image
                    src={fav.course.image}
                    alt={fav.course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-rose-200" />
                  </div>
                )}

                {/* Favorite button in absolute position */}
                <div
                  className="absolute top-3 right-3 z-10"
                  onClick={(e) => e.preventDefault()}
                >
                  {fav.course._id && (
                    <FavoriteButton courseId={fav.course._id} />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                    {fav.course.level}
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    ${fav.course.price.toFixed(2)}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-rose-600 transition-colors">
                  {fav.course.title}
                </h3>

                {fav.course.instructor?.userName && (
                  <p className="text-sm text-slate-500 mb-4">
                    by {fav.course.instructor.userName}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    Saved on {new Date(fav.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

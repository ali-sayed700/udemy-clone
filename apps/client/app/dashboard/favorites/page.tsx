"use client";
import { logger } from "@/lib/logger";

import { useEffect, useState } from "react";
import { graphqlClient } from "@/lib/api/graphqlClient";
import Link from "next/link";
import Image from "next/image";
import { Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteItem {
  _id: string;
  course: {
    _id: string;
    title: string;
    image: string;
    price: number;
    instructor: {
      userName: string;
    };
    description: string;
  };
  createdAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await graphqlClient.post("", {
          query: `query MyFavorites {
            myFavorites {
              _id
              course {
                _id
                title
                image
                price
                description
                instructor {
                  userName
                }
              }
              createdAt
            }
          }`,
        });

        if (res.data?.data?.myFavorites) {
          setFavorites(res.data.data.myFavorites);
        }
      } catch (error) {
        logger.error("Failed to load favorites", error as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">My Saved Courses</h2>
        <p className="text-sm text-slate-500 mt-1">
          Here are all your favorited courses. Start learning whenever
          you&apos;re ready.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-100 text-center">
          <Heart className="h-16 w-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No saved courses yet
          </h3>
          <p className="text-slate-500 max-w-sm mb-6">
            Start exploring courses and save your favorites to access them
            quickly.
          </p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/course">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
            >
              {/* Course Image */}
              <div className="relative w-full h-40 bg-slate-100 flex-shrink-0">
                {favorite.course.image ? (
                  <Image
                    src={favorite.course.image}
                    alt={favorite.course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-indigo-400" />
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="flex-1 flex flex-col p-4">
                <Link href={`/course/${favorite.course._id}/course_details`}>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                    {favorite.course.title}
                  </h3>
                </Link>

                <p className="text-sm text-slate-500 mb-3">
                  By {favorite.course.instructor?.userName}
                </p>

                <p className="text-sm text-slate-600 line-clamp-2 flex-1 mb-4">
                  {favorite.course.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xl font-bold font-mono text-slate-900">
                    ${favorite.course.price}
                  </span>
                  <Link href={`/course/${favorite.course._id}/course_details`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
                      View Course
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

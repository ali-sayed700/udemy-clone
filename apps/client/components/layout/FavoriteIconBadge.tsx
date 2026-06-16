"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGetMyFavoriteCountQuery } from "@/service/favorite/favorite.useQuery";

interface FavoriteIconBadgeProps {
  enabled?: boolean;
}

export default function FavoriteIconBadge({
  enabled = true,
}: FavoriteIconBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const shouldFetchCount = mounted && enabled;
  const { data: favoriteCount = 0 } = useGetMyFavoriteCountQuery({
    enabled: shouldFetchCount,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/favorites"
      className="text-gray-500 transition hover:text-rose-500 relative flex items-center cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-heart-icon lucide-heart"
      >
        <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
      </svg>
      {shouldFetchCount && favoriteCount > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500">
          {favoriteCount}
        </span>
      )}
    </Link>
  );
}

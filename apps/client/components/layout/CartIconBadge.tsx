"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGetCartCountQuery } from "@/service/cart/cart.useQuery";

interface CartIconBadgeProps {
  enabled?: boolean;
}

export default function CartIconBadge({ enabled = true }: CartIconBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const shouldFetchCount = mounted && enabled;
  const { data: cartCount = 0 } = useGetCartCountQuery({
    enabled: shouldFetchCount,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      className="text-gray-500 transition hover:text-indigo-600 relative flex items-center cursor-pointer"
      href="/cart"
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
        className="lucide lucide-shopping-cart-icon lucide-shopping-cart"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      {shouldFetchCount && cartCount > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600">
          {cartCount}
        </span>
      )}
    </Link>
  );
}

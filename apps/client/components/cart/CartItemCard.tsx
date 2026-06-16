"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/types/course.types";

interface CartItemCardProps {
  item: Course;
  onRemove: (courseId: string) => void;
}

export default function CartItemCard({ item, onRemove }: CartItemCardProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-slate-100 shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-indigo-100 to-purple-100" />
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <Link
            href={`/course/${item._id}/course_details`}
            className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2"
          >
            {item.title}
          </Link>
          <p className="text-sm text-slate-500 mt-1">
            By {item.instructor?.userName}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => item._id && onRemove(item._id)}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
          <span className="text-2xl font-bold font-mono text-slate-900">
            ${item.price}
          </span>
        </div>
      </div>
    </div>
  );
}

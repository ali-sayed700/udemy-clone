"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import useGetAllCourses from "@/service/all-courses-service/coursesCrud.useQuery";
import type { Course } from "@/types/course.types";

export default function NavbarSearch() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const normalizedKeyword = debouncedKeyword.trim();

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Fetch courses via Graphql action
  const { data, isLoading } = useGetAllCourses(
    normalizedKeyword
      ? {
          keyword: normalizedKeyword,
          limit: "6",
          fields: "_id,title,categories",
        }
      : {},
    {
      enabled: normalizedKeyword.length >= 2,
      staleTime: 10 * 60 * 1000,
    },
  );
  const suggestions =
    normalizedKeyword.length >= 2 ? data?.data?.courses || [] : [];

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form submit -> goes to search page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (keyword.trim()) {
      router.push(`/course_filter?keyword=${encodeURIComponent(keyword)}`);
    } else {
      router.push(`/course_filter`);
    }
  };

  // Autocomplete click -> navigate directly to course
  const handleSuggestionClick = (courseId: string, courseTitle: string) => {
    setKeyword(courseTitle);
    setShowDropdown(false);
    router.push(`/course/${courseId}/course_details`);
  };

  return (
    <div
      className="relative hidden lg:flex items-center ml-6 mr-4 min-w-[300px]"
      ref={dropdownRef}
    >
      <form onSubmit={handleSearch} className="relative w-full">
        <Input
          type="text"
          placeholder="Search for anything..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (keyword.trim()) setShowDropdown(true);
          }}
          className="w-full rounded-full bg-slate-100 border-none pl-10 h-10 focus-visible:ring-1 focus-visible:ring-teal-500"
        />
        <button
          type="submit"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && normalizedKeyword.length >= 2 && (
        <div className="absolute top-12 left-0 w-full bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading courses...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="flex flex-col py-2">
              {suggestions.map((course: Course) => (
                <li
                  key={course._id}
                  onClick={() =>
                    handleSuggestionClick(course._id as string, course.title)
                  }
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm line-clamp-1">
                      {course.title}
                    </span>
                    <span className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {course.categories}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No matches found for &quot;{debouncedKeyword}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import useGetAllCourses from "@/service/all-courses-service/coursesCrud.useQuery";
import { Search } from "lucide-react";
import type { Course } from "@/types/course.types";

export default function CourseSearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentKeyword = searchParams.get("keyword") || "";

  const [inputValue, setInputValue] = useState(currentKeyword);
  const [debouncedValue, setDebouncedValue] = useState(currentKeyword);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const normalizedValue = debouncedValue.trim();

  // Sync with URL if it changes externally
  useEffect(() => {
    setInputValue(currentKeyword);
  }, [currentKeyword]);

  // Debounce the input for the autocomplete query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Fetch suggestions based on debounced input
  const { data, isLoading } = useGetAllCourses(
    normalizedValue
      ? {
          keyword: normalizedValue,
          limit: "6",
          fields: "_id,title,categories",
        }
      : {},
    {
      enabled: normalizedValue.length >= 2,
      staleTime: 10 * 60 * 1000,
    },
  );

  const suggestions =
    normalizedValue.length >= 2 ? data?.data?.courses || [] : [];

  // Close dropdown when clicking outside
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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowDropdown(false);

    // Update the URL to filter the main grid
    const params = new URLSearchParams(searchParams.toString());
    if (inputValue.trim()) {
      params.set("keyword", inputValue);
    } else {
      params.delete("keyword");
    }
    router.push(`?${params.toString()}`);
  };

  const handleSuggestionClick = (courseTitle: string) => {
    // When a title is clicked, populate the input and perform the search
    setInputValue(courseTitle);
    setShowDropdown(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set("keyword", courseTitle);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center"
      >
        <Input
          type="text"
          placeholder="Search for courses..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (inputValue.trim()) setShowDropdown(true);
          }}
          className="w-full pr-10 border-muted-foreground/30 focus-visible:ring-primary h-12 text-lg"
        />
        <button
          type="submit"
          className="absolute right-3 text-muted-foreground hover:text-primary transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && normalizedValue.length >= 2 && (
        <div className="absolute top-14 left-0 w-full bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading suggestions...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="flex flex-col py-2">
              {suggestions.map((course: Course) => (
                <li
                  key={course._id}
                  onClick={() => handleSuggestionClick(course.title)}
                  className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium truncate">{course.title}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {course.categories}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No matches found for &quot;{debouncedValue}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

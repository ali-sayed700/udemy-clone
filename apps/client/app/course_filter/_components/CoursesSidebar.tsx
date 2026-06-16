"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["Web Development", "Data Science", "Mobile Development", "Design"];
const SORTS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
];

export default function CoursesSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("categories") || "";
  const currentSort = searchParams.get("sort") || "";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (filterName: string, value: string) => {
    router.push(`?` + createQueryString(filterName, value));
  };

  return (
    <div className="bg-muted/30 p-6 flex flex-col gap-6 rounded-lg sticky top-6">
      <h2 className="text-xl font-semibold border-b pb-2">Filters</h2>

      {/* Category Filter */}
      <div className="flex flex-col gap-3">
        <Label className="font-semibold text-md">Category</Label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="categories"
              checked={currentCategory === ""}
              onChange={() => handleFilterChange("categories", "")}
              className="accent-primary"
            />
            All Categories
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="categories"
                checked={currentCategory === cat}
                onChange={() => handleFilterChange("categories", cat)}
                className="accent-primary"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>


      {/* Price Filter */}
      <div className="flex flex-col gap-3">
        <Label className="font-semibold text-md">Price</Label>
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={searchParams.get("price") === null || searchParams.get("price") === ""}
              onChange={() => handleFilterChange("price", "")}
              className="accent-primary"
            />
            All Prices
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={searchParams.get("price") === "free"}
              onChange={() => handleFilterChange("price", "free")}
              className="accent-primary"
            />
            Free
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={searchParams.get("price") === "paid"}
              onChange={() => handleFilterChange("price", "paid")}
              className="accent-primary"
            />
            Paid
          </label>
        </div>
      </div>

      {/* Sort By Filter */}
      <div className="flex flex-col gap-3">
        <Label className="font-semibold text-md border-t pt-4 mt-2">Sort By</Label>
        <select
          value={currentSort}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Recommended</option>
          {SORTS.map((sortOption) => (
            <option key={sortOption.value} value={sortOption.value}>
              {sortOption.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}

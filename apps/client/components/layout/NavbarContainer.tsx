"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NavbarSignout from "./NavbarSignout";

const NavbarContainer = ({ img }: { img: string | undefined }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickedOutside = () => {
      if (open) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClickedOutside);

    return () => {
      window.removeEventListener("click", handleClickedOutside);
    };
  }, [open]);
  return (
    <div className="hidden md:relative md:block">
      <button
        type="button"
        className="overflow-hidden rounded-full border border-gray-300 dark:border-slate-700 shadow-inner cursor-pointer"
        onClick={(e) => {
          e.stopPropagation(); // Prevent immediate closing
          setOpen(!open);
        }}
      >
        <span className="sr-only">Toggle dashboard menu</span>

        <Image
          src={img || "/avatar.svg"}
          alt=""
          width={100}
          height={100}
          className="size-10 object-cover"
        />
      </button>
      {open && (
        <div
          className="absolute end-0 z-10 mt-0.5 w-56 divide-y divide-gray-100 dark:divide-slate-700 rounded-md border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
          role="menu"
        >
          <div className="p-2">
            <Link
              href="/my-courses"
              className="block rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-white"
              role="menuitem"
            >
              My Courses
            </Link>

            <Link
              href="/orders"
              className="block rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-white"
              role="menuitem"
            >
              My Orders
            </Link>

            <Link
              href="/settings"
              className="block rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-white"
              role="menuitem"
            >
              Settings
            </Link>
          </div>
          <NavbarSignout />
        </div>
      )}
    </div>
  );
};

export default NavbarContainer;


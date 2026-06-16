"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import NavbarSearch from "./NavbarSearch";
import CartIconBadge from "./CartIconBadge";
import FavoriteIconBadge from "./FavoriteIconBadge";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import NavbarContainer from "./NavbarContainer";
import {
  Menu,
  X,
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  LogOut,
  Heart,
} from "lucide-react";
import Image from "next/image";

interface SessionData {
  accessToken?: string;
  user?: {
    role?: string;
    userName?: string;
    avatar?: string;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavbarClientProps {
  session: SessionData | null;
}

const navLinks: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-courses", label: "My Courses", icon: BookOpen },
  { href: "/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function NavbarClient({ session }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const pathname = usePathname();

  const user = session?.user;
  const isAuthenticated = Boolean(session?.accessToken && session?.user);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-white dark:bg-slate-900 py-2 border-b border-transparent dark:border-slate-800 fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link className="block text-teal-600 dark:text-teal-400" href="/">
              <span className="sr-only">Home</span>
              <Image
                src="/logoo.svg"
                alt="Logo"
                width={100}
                height={100}
                className="w-10 h-10 object-contain"
              />
            </Link>
          </div>

          <div className="hidden md:block flex-1 px-4">
            <NavbarSearch />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4 lg:gap-12">
            <nav aria-label="Global">
              <ul className="flex items-center gap-4 lg:gap-6 text-sm">
                {session?.accessToken &&
                  (user?.role?.toLowerCase() === "instructor" ||
                    user?.role?.toLowerCase() === "admin") && (
                    <li>
                      <Link
                        className="text-gray-500 dark:text-gray-400 transition hover:text-gray-500/75 dark:hover:text-gray-300 font-medium"
                        href="/dashboard"
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}
                {session?.accessToken && (
                  <li>
                    <Link
                      className="text-gray-500 dark:text-gray-400 transition hover:text-gray-500/75 dark:hover:text-gray-300 font-medium"
                      href="/my-courses"
                    >
                      My Courses
                    </Link>
                  </li>
                )}
                <li>
                  <a
                    className="text-gray-500 dark:text-gray-400 transition hover:text-gray-500/75 dark:hover:text-gray-300"
                    href="#"
                  >
                    About
                  </a>
                </li>
                <li>
                  <CartIconBadge enabled={isAuthenticated} />
                </li>
                <li>
                  <FavoriteIconBadge enabled={isAuthenticated} />
                </li>
                <li>
                  <ThemeToggle />
                </li>
              </ul>
            </nav>

            {session?.accessToken && session?.user ? (
              <NavbarContainer img={session?.user?.avatar} />
            ) : (
              <Button
                asChild
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Link href={"/auth/signin"}>Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <MobileSlideMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          session={session}
        />
      )}
    </header>
  );
}

function MobileSlideMenu({
  isOpen,
  onClose,
  session,
}: {
  isOpen: boolean;
  onClose: () => void;
  session: SessionData | null;
}) {
  const user = session?.user;
  const isAuthenticated = session?.accessToken && session?.user;

  const instructorLinks = navLinks.filter(
    (link) =>
      link.href === "/dashboard" ||
      (session?.user?.role?.toLowerCase() !== "instructor" &&
        session?.user?.role?.toLowerCase() !== "admin" &&
        link.href !== "/dashboard"),
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Menu
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/course"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                  onClick={onClose}
                >
                  <BookOpen className="h-5 w-5" />
                  Browse Courses
                </Link>
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 px-3">
                    Sign in to access your courses
                  </p>
                  <Button
                    asChild
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Link href="/auth/signin" onClick={onClose}>
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <nav className="flex flex-col gap-1">
                {instructorLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                    onClick={onClose}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}

                <div className="flex items-center gap-3 px-3 py-2 mt-2">
                  <CartIconBadge enabled={Boolean(isAuthenticated)} />
                  <FavoriteIconBadge enabled={Boolean(isAuthenticated)} />
                  <ThemeToggle />
                </div>
              </nav>
            )}
          </div>

          {isAuthenticated && (
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    user?.userName?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.userName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role || "Student"}
                  </p>
                </div>
              </div>
              <SignoutButton />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SignoutButton() {
  return (
    <a
      href="/api/auth/signout"
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left font-medium"
    >
      <LogOut className="h-5 w-5" />
      Sign Out
    </a>
  );
}

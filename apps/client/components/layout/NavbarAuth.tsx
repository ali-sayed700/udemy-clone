import Link from 'next/link';
import { Button } from '@/components/ui/button';
const NavbarAuth = () => {
  return (
    <div className="p-2">
      <Button
        asChild
        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50 cursor-pointer"
        role="menuitem"
      >
        <Link href={'/auth/signin'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            ></path>
          </svg>
          Sign In
        </Link>
      </Button>

      <Button
        asChild
        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50 cursor-pointer"
        role="menuitem"
      >
        <Link href={'/auth/signup'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            ></path>
          </svg>
          Sign Up
        </Link>
      </Button>
    </div>
  );
};

export default NavbarAuth;

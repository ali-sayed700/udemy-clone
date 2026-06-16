import { Button } from '@/components/ui/button';


const NavbarSignout = () => {
  return (
    <div className="p-2 ">
      <Button
        asChild
        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-500 bg-slate hover:bg-slate-50 cursor-pointer "
      >
        <a href="/api/auth/signout">
          Logout
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
        </a>
      </Button>
    </div>
  );
};

export default NavbarSignout;

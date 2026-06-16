import Link from 'next/link';
import SignInForm from './signinForm';
import { Button } from '@/components/ui/button';

const SignInPage = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col justify-center items-center">
      <h1 className="text-center text-slate-900 dark:text-white text-2xl font-bold mb-4">Sign In</h1>
      <SignInForm />
      <div className="flex justify-between text-sm mt-4 gap-2 text-slate-600 dark:text-slate-400">
        <p>Don&apos;t have an account?</p>
        <Link className="underline text-purple-600 dark:text-purple-400" href="/auth/signup">
          Sign Up
        </Link>
      </div>
      <Button className="mt-4 w-full" asChild>
        <Link href={`http://localhost:3001/api/google/login`}>
          Sign In With Google
        </Link>
      </Button>
    </div>
  );
};

export default SignInPage;

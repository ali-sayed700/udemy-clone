import Link from 'next/link';

import SignUpForm from './signupForm';

const SignUpPage = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col justify-center items-center">
      <h1 className="text-center text-slate-900 dark:text-white text-2xl font-bold mb-4">Sign Up</h1>
      <SignUpForm />
      <div className="flex justify-between text-sm mt-4 gap-2 text-slate-600 dark:text-slate-400">
        <p>Already have an account?</p>
        <Link className="underline text-purple-600 dark:text-purple-400" href={'/auth/signin'}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;

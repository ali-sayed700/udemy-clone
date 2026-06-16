import { getSession } from '@/lib/session';
import EditProfileForm from '@/components/dashboard/EditProfileForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Settings | LearnHub',
  description: 'Edit your profile and account settings',
};

export default async function StudentSettingsPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[700px] mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your profile and account preferences
          </p>
        </div>

        <EditProfileForm
          userId={session?.user?.userId}
          currentUserName={session?.user?.userName}
          currentAvatar={session?.user?.avatar}
          currentRole={session?.user?.role}
        />
      </div>
    </div>
  );
}

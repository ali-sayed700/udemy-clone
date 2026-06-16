import { getSession } from '@/lib/session';
import EditProfileForm from '@/components/dashboard/EditProfileForm';

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="p-6 space-y-6 max-w-[700px]">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Edit your profile information
        </p>
      </div>

      <EditProfileForm
        userId={session?.user?.userId}
        currentUserName={session?.user?.userName}
        currentAvatar={session?.user?.avatar}
        currentRole={session?.user?.role}
      />
    </div>
  );
}

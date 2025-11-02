'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserSearch from '@/app/components/UserSearch';

export default function UsersPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Discover Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Search for users by username or display name to follow them and see their watchlists.
          <br />
          <span className="text-sm text-gray-500 dark:text-gray-500">
            Note: Users need to create profiles first. Make sure you've created your profile too!
          </span>
        </p>
        <UserSearch showAllUsers={true} />
      </main>
    </div>
  );
}


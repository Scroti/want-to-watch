'use client';

import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const [mediaTitle, setMediaTitle] = useState<string | null>(null);

  useEffect(() => {
    // If we're on a media page, fetch the title
    if (pathname?.startsWith('/media/')) {
      const mediaId = pathname.split('/media/')[1];
      if (mediaId) {
        fetch(`/api/media/${mediaId}`)
          .then(res => res.json())
          .then(data => setMediaTitle(data.title || null))
          .catch(() => setMediaTitle(null));
      }
    } else {
      setMediaTitle(null);
    }
  }, [pathname]);

  if (!isSignedIn || !user) {
    return null;
  }

  const displayName = user.fullName || user.firstName || user.username || user.primaryEmailAddress?.emailAddress || 'User';
  const avatarUrl = user.imageUrl || '/placeholder-avatar.png';

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex-1"></div>
          <div className="flex-1 flex justify-center items-center gap-2">
            <Link href="/" className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
              Want To Watch
            </Link>
            {mediaTitle && (
              <span className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                {' • '}
              </span>
            )}
            {mediaTitle && (
              <span className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px] md:max-w-[250px] lg:max-w-none">
                {mediaTitle}
              </span>
            )}
          </div>
          <div className="flex-1 flex justify-end">
            <Link
              href={user.username ? `/profile/${user.username}` : '/profile/edit'}
              className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px] md:max-w-none">
                {displayName}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}


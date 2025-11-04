'use client';

import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function BottomNav() {
  const { userId } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  

  useEffect(() => {
    if (userId) {
      loadWishlistCount();
    }
  }, [userId]);

  const loadWishlistCount = async () => {
    if (!userId) return;
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlistCount(data.length || 0);
      }
    } catch (error) {
      console.error('Failed to load wishlist count:', error);
    }
  };

  // Load app profile for correct profile link and avatar
  useEffect(() => {
    if (!userId) return;
    let isCancelled = false;
    fetch(`/api/profiles?userId=${userId}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!isCancelled && data) {
          setProfileUsername(data.username || null);
          setProfileAvatarUrl(data.avatar_url || null);
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const profileHref = `/profile/${profileUsername || userId || ''}`;


  const isActive = (path: string) => pathname?.startsWith(path);

  // Refresh wishlist count when other pages modify it
  useEffect(() => {
    const onWishlistChanged = () => {
      loadWishlistCount();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('wishlist:changed', onWishlistChanged as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('wishlist:changed', onWishlistChanged as EventListener);
      }
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/list"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/list')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-xs font-medium">List {wishlistCount > 0 && `(${wishlistCount})`}</span>
        </Link>
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/search')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-medium">Search</span>
        </Link>
        <Link
          href={profileHref || '/profile/edit'}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            pathname?.includes('/profile')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          <div className="relative w-6 h-6 mb-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {(profileAvatarUrl || user?.imageUrl) ? (
              <Image
                src={profileAvatarUrl || user?.imageUrl || ''}
                alt={user?.fullName || user?.username || 'Profile'}
                fill
                className="object-cover"
              />
            ) : (
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}


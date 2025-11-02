'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserProfile, UserStats, MediaItem } from '@/lib/types';
import FollowButton from '@/app/components/FollowButton';
import StatusFilter from '@/app/components/StatusFilter';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [wishlist, setWishlist] = useState<MediaItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadStats();
    loadWishlist();
    checkFollowStatus();
  }, [username]);

  const loadProfile = async () => {
    try {
      // Try username first, then try user_id (in case username is actually a user_id)
      let res = await fetch(`/api/profiles?username=${username}`);
      if (!res.ok || res.status === 404) {
        // If username lookup fails, try as user_id
        res = await fetch(`/api/profiles?userId=${username}`);
      }
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        console.error('Failed to load profile:', await res.text());
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadStats = async () => {
    if (!profile?.user_id) return;
    try {
      const res = await fetch(`/api/profiles/${profile.user_id}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadWishlist = async () => {
    if (!profile?.user_id) return;
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await fetch(`/api/users/${profile.user_id}/wishlist${statusParam}`);
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!profile?.user_id || !userId) return;
    try {
      const res = await fetch(`/api/follows/check?userId=${profile.user_id}`);
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  useEffect(() => {
    if (profile?.user_id) {
      loadWishlist();
    }
  }, [statusFilter, profile?.user_id]);

  const getImageUrl = (path?: string) => {
    if (!path) return '/placeholder-poster.png';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = userId === profile.user_id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-start gap-3 sm:gap-6">
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name || profile.username || profile.user_id || 'User'} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                  {(profile.display_name || profile.username || profile.user_id || 'U')?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {profile.display_name || profile.username || `User ${profile.user_id?.substring(0, 8)}` || 'User'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                {profile.username ? `@${profile.username}` : `ID: ${profile.user_id?.substring(0, 12)}...`}
              </p>
              {profile.bio && (
                <p className="mt-2 text-gray-700 dark:text-gray-300">{profile.bio}</p>
              )}
              <div className="mt-4 flex gap-4">
                {!isOwnProfile && userId && (
                  <FollowButton
                    userId={profile.user_id}
                    isFollowing={isFollowing}
                    onToggle={(following) => setIsFollowing(following)}
                  />
                )}
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_items}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.watched_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Watched</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.followers_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.following_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.reviews_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reviews</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6">
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {isOwnProfile ? 'Your wishlist is empty.' : 'This user has no items in their wishlist.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/media/${item.tmdb_id}-${item.media_type}`)}
              >
                <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={getImageUrl(item.poster_path)}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    unoptimized
                  />
                </div>
                <div className="p-2 sm:p-3 lg:p-4">
                  <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-1 line-clamp-2 text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                    {item.media_type === 'tv' ? 'TV' : 'Movie'} • <span className="hidden sm:inline">{item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span><span className="sm:hidden">{item.status.replace('_', ' ').split(' ')[0]}</span>
                  </p>
                  {item.rating && (
                    <div className="flex items-center gap-0.5 sm:gap-1 text-yellow-500 text-xs sm:text-sm mb-1 sm:mb-2">
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


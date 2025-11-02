'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import FollowButton from './FollowButton';
import { UserProfile } from '@/lib/types';

interface UserSearchProps {
  initialQuery?: string;
  showAllUsers?: boolean;
}

export default function UserSearch({ initialQuery = '', showAllUsers = true }: UserSearchProps) {
  const { userId } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (query.trim().length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [query]);

  useEffect(() => {
    if (showAllUsers && query.trim().length < 2) {
      loadAllUsers();
    }
  }, [showAllUsers]);

  const loadAllUsers = async () => {
    setLoadingAll(true);
    try {
      const res = await fetch('/api/users?limit=20');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
        if (userId) {
          checkFollowStatuses(data.map((u: UserProfile) => u.user_id));
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingAll(false);
    }
  };

  const searchUsers = async () => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        // Check follow status for each user
        if (userId) {
          checkFollowStatuses(data.map((u: UserProfile) => u.user_id));
        }
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatuses = async (userIds: string[]) => {
    if (!userId || userIds.length === 0) return;

    try {
      const followChecks = await Promise.all(
        userIds.map(async (targetUserId) => {
          const res = await fetch(`/api/follows/check?userId=${targetUserId}`);
          if (res.ok) {
            const data = await res.json();
            return { userId: targetUserId, isFollowing: data.isFollowing };
          }
          return { userId: targetUserId, isFollowing: false };
        })
      );

      const statusMap: Record<string, boolean> = {};
      followChecks.forEach(({ userId: uid, isFollowing }) => {
        statusMap[uid] = isFollowing;
      });
      setFollowingStatus(statusMap);
    } catch (error) {
      console.error('Failed to check follow statuses:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users by username or name..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && query.trim().length >= 2 && users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No users found matching "{query}"
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Make sure users have created profiles. They need to sign in at least once.
          </p>
        </div>
      )}

      {!loading && query.trim().length < 2 && showAllUsers && (
        <div>
          {loadingAll ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                No users found yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Users need to sign in and create profiles to appear here. Start by creating your own profile!
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Or browse all users ({allUsers.length}):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {allUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link href={`/profile/${user.username || user.user_id}`}>
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.display_name || user.username || 'User'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                              {(user.display_name || user.username || user.user_id || 'U')?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 dark:text-gray-100 truncate">
                            {user.display_name || user.username || `User ${user.user_id?.substring(0, 8)}`}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.username ? `@${user.username}` : `ID: ${user.user_id?.substring(0, 8)}...`}
                          </p>
                        </div>
                      </div>
                    </Link>
                    {user.bio && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    {userId && userId !== user.user_id && user.user_id && (
                      <FollowButton
                        userId={user.user_id}
                        isFollowing={followingStatus[user.user_id] || false}
                        onToggle={(following) => {
                          setFollowingStatus((prev) => ({
                            ...prev,
                            [user.user_id]: following,
                          }));
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && query.trim().length < 2 && !showAllUsers && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Type at least 2 characters to search for users
          </p>
        </div>
      )}

      {!loading && query.trim().length >= 2 && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.user_id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Link href={`/profile/${user.username || user.user_id}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.display_name || user.username || 'User'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                        {(user.display_name || user.username || 'U')?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                      {user.display_name || user.username || 'User'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      @{user.username || 'no-username'}
                    </p>
                  </div>
                </div>
              </Link>
              {user.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {user.bio}
                </p>
              )}
              {userId && userId !== user.user_id && (
                <FollowButton
                  userId={user.user_id}
                  isFollowing={followingStatus[user.user_id] || false}
                  onToggle={(following) => {
                    setFollowingStatus((prev) => ({
                      ...prev,
                      [user.user_id]: following,
                    }));
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


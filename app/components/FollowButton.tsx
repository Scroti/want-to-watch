'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onToggle?: (following: boolean) => void;
}

export default function FollowButton({ userId, isFollowing, onToggle }: FollowButtonProps) {
  const { userId: currentUserId } = useAuth();
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  if (!currentUserId || currentUserId === userId) {
    return null;
  }

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (following) {
        // Unfollow
        const res = await fetch(`/api/follows?userId=${userId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setFollowing(false);
          onToggle?.(false);
        }
      } else {
        // Follow
        const res = await fetch('/api/follows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingId: userId }),
        });
        if (res.ok) {
          setFollowing(true);
          onToggle?.(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        following
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50`}
    >
      {loading ? '...' : following ? 'Following' : 'Follow'}
    </button>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { Activity } from '@/lib/types';
import Link from 'next/link';

export default function ActivityFeed() {
  const { userId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadActivities();
    }
  }, [userId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatActivity = (activity: Activity) => {
    const userName = activity.user?.display_name || activity.user?.username || 'User';
    const metadata = activity.metadata || {};

    switch (activity.activity_type) {
      case 'added_item':
        return `${userName} added "${metadata.title}" to their watchlist`;
      case 'watched_item':
        return `${userName} watched "${metadata.title}"`;
      case 'reviewed':
        return `${userName} reviewed "${metadata.title}" and rated it ${metadata.rating}★`;
      case 'followed_user':
        return `${userName} followed a new user`;
      case 'created_list':
        return `${userName} created a list: "${metadata.name}"`;
      case 'added_to_list':
        return `${userName} added an item to their list`;
      default:
        return `${userName} did something`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No activity yet. Follow some users to see their activity!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <Link href={`/profile/${activity.user?.username || activity.user_id}`}>
              <div className="relative w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {activity.user?.avatar_url ? (
                  <Image
                    src={activity.user.avatar_url}
                    alt={activity.user.display_name || activity.user.username || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                    {(activity.user?.display_name || activity.user?.username || 'U')?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-gray-100">
                {formatActivity(activity)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


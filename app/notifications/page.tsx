'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadNotifications();
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      if (res.ok) {
        loadNotifications();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        loadNotifications();
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatNotification = (notification: Notification) => {
    const fromUser = notification.from_user?.display_name || notification.from_user?.username || 'Someone';
    
    switch (notification.notification_type) {
      case 'follow':
        return { message: `${fromUser} started following you`, link: `/profile/${notification.from_user?.username || notification.from_user_id}` };
      case 'review':
        return { message: `${fromUser} reviewed "${notification.message}"`, link: notification.target_id ? `/media/${notification.target_id}` : '#' };
      case 'comment':
        return { message: `${fromUser} commented on "${notification.message}"`, link: notification.target_id ? `/media/${notification.target_id}` : '#' };
      case 'like_review':
        return { message: `${fromUser} liked your review`, link: notification.target_id ? `/media/${notification.target_id}` : '#' };
      case 'like_comment':
        return { message: `${fromUser} liked your comment`, link: notification.target_id ? `/media/${notification.target_id}` : '#' };
      case 'recommendation':
        return { message: `${fromUser} recommended "${notification.message}" to you`, link: notification.target_id ? `/media/${notification.target_id}` : '#' };
      default:
        return { message: notification.message || 'New notification', link: '#' };
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-lg font-normal text-blue-600 dark:text-blue-400">
                ({unreadCount} unread)
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No notifications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const { message, link } = formatNotification(notification);
              return (
                <Link
                  key={notification.id}
                  href={link}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead([notification.id]);
                    }
                  }}
                  className={`block bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                    !notification.read ? 'border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {notification.from_user?.avatar_url ? (
                      <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        <Image
                          src={notification.from_user.avatar_url}
                          alt={notification.from_user.display_name || notification.from_user.username || 'User'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        {(notification.from_user?.display_name || notification.from_user?.username || 'U')?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-gray-100">{message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


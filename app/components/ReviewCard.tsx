'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Review } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
  onDelete?: () => void;
  mediaTitle?: string;
}

export default function ReviewCard({ review, onDelete, mediaTitle }: ReviewCardProps) {
  const { userId } = useAuth();
  const [liked, setLiked] = useState(review.liked || false);
  const [likesCount, setLikesCount] = useState(review.likes_count || 0);
  const [loading, setLoading] = useState(false);

  const isOwnReview = userId === review.user_id;

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      });
      if (res.ok && onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Link href={`/profile/${review.user?.username || review.user_id}`}>
          <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
            {review.user?.avatar_url ? (
              <Image
                src={review.user.avatar_url}
                alt={review.user.display_name || review.user.username || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                {(review.user?.display_name || review.user?.username || 'U')?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={`/profile/${review.user?.username || review.user_id}`}
              className="font-semibold text-gray-900 dark:text-gray-100 hover:underline"
            >
              {review.user?.display_name || review.user?.username || 'User'}
            </Link>
            <div className="flex items-center gap-1 text-yellow-500">
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </div>
            {review.contains_spoilers && (
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                Spoilers
              </span>
            )}
          </div>
          
          {review.title && (
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{review.title}</h4>
          )}
          
          {review.content && (
            <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{review.content}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={handleLike}
              disabled={loading || !userId}
              className={`flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                liked ? 'text-blue-600 dark:text-blue-400' : ''
              } disabled:opacity-50`}
            >
              <span>❤️</span>
              <span>{likesCount}</span>
            </button>
            <span>{new Date(review.created_at).toLocaleDateString()}</span>
            {isOwnReview && (
              <button
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


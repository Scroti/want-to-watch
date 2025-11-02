'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Comment } from '@/lib/types';

interface CommentSectionProps {
  mediaId: string;
}

export default function CommentSection({ mediaId }: CommentSectionProps) {
  const { userId } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [mediaId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?mediaId=${mediaId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id: mediaId,
          content: newComment.trim(),
          parent_id: parentId,
          contains_spoilers: containsSpoilers,
        }),
      });

      if (res.ok) {
        setNewComment('');
        setParentId(null);
        setContainsSpoilers(false);
        loadComments();
      } else {
        alert('Failed to post comment');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment');
    }
  };

  const renderComment = (comment: Comment, depth = 0) => {
    return (
      <div key={comment.id} className={depth > 0 ? 'ml-8 mt-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-start gap-4">
            <Link href={`/profile/${comment.user?.username || comment.user_id}`}>
              <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {comment.user?.avatar_url ? (
                  <Image
                    src={comment.user.avatar_url}
                    alt={comment.user.display_name || comment.user.username || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                    {(comment.user?.display_name || comment.user?.username || 'U')?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/profile/${comment.user?.username || comment.user_id}`}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:underline"
                >
                  {comment.user?.display_name || comment.user?.username || 'User'}
                </Link>
                {comment.contains_spoilers && (
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                    Spoilers
                  </span>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                {depth === 0 && userId && (
                  <button
                    onClick={() => setParentId(comment.id)}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {comment.replies && comment.replies.map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Comments</h3>
      
      {userId && (
        <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          {parentId && (
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Replying to comment...
              <button
                type="button"
                onClick={() => setParentId(null)}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="rounded"
              />
              <span>Contains spoilers</span>
            </label>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div>{comments.map((comment) => renderComment(comment))}</div>
      )}
    </div>
  );
}


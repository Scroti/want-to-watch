'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import StatusSelector from '@/app/components/StatusSelector';
import RatingInput from '@/app/components/RatingInput';
import { MediaItem } from '@/lib/types';

export default function MediaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const id = params.id as string;
  const [tmdb_id, media_type] = id.split('-');

  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [status, setStatus] = useState('want_to_watch');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    loadMediaInfo();
    loadMediaItem();
    loadWishlistCount();
    loadCurrentUserProfile();
  }, [id, userId]);

  const loadCurrentUserProfile = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/profiles?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUserProfile(data);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadMediaInfo = async () => {
    try {
      setLoading(true);
      // Get media info from TMDB
      const res = await fetch(`/api/media/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMediaInfo(data);
      }
    } catch (error) {
      console.error('Failed to load media info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMediaItem = async () => {
    if (!userId) return;
    try {
      // Check if item is in wishlist
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        const item = data.find((item: MediaItem) => 
          item.tmdb_id === parseInt(tmdb_id) && item.media_type === media_type
        );
        if (item) {
          setMediaItem(item);
          setIsInWishlist(true);
          setStatus(item.status || 'want_to_watch');
          setRating(item.rating || 0);
        } else {
          setIsInWishlist(false);
          setMediaItem(null);
        }
      }
    } catch (error) {
      console.error('Failed to load media item:', error);
    }
  };

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

  const handleUpdateStatus = async () => {
    if (!userId || !mediaItem) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/wishlist/${mediaItem.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          rating: rating || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMediaItem(data);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!userId || !mediaInfo) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: parseInt(tmdb_id),
          title: mediaInfo.title,
          overview: mediaInfo.overview,
          poster_path: mediaInfo.poster_path,
          release_date: mediaInfo.release_date,
          first_air_date: mediaInfo.first_air_date,
          media_type: media_type as 'movie' | 'tv',
          status: 'want_to_watch',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMediaItem(data);
        setIsInWishlist(true);
        loadMediaItem();
        loadWishlistCount(); // Update count after adding
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      alert('Failed to add to wishlist');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getImageUrl = (path?: string) => {
    if (!path) return '/placeholder-poster.png';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20">
        {mediaInfo && (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Poster Image - Responsive */}
                <div className="relative w-full sm:w-32 md:w-40 lg:w-48 h-auto sm:h-48 md:h-60 lg:h-72 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                  <div className="relative aspect-[2/3] w-full h-full">
                    <Image
                      src={getImageUrl(mediaInfo.poster_path)}
                      alt={mediaInfo.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 200px, 300px"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                    {mediaInfo.title}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                    {mediaInfo.media_type === 'tv' ? 'TV Series' : 'Movie'} • {mediaInfo.release_date?.substring(0, 4) || mediaInfo.first_air_date?.substring(0, 4) || 'N/A'}
                  </p>
                  
                  {/* Trailer Button */}
                  {mediaInfo.trailer && mediaInfo.trailer.site === 'YouTube' && (
                    <div className="mb-3 sm:mb-4">
                      <button
                        onClick={() => {
                          setShowTrailer(!showTrailer);
                          // Scroll to trailer when showing
                          if (!showTrailer) {
                            setTimeout(() => {
                              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            }, 100);
                          }
                        }}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm md:text-base"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        <span className="hidden sm:inline">{showTrailer ? 'Hide Trailer' : 'Watch Trailer'}</span>
                        <span className="sm:hidden">{showTrailer ? 'Hide' : 'Trailer'}</span>
                      </button>
                    </div>
                  )}
                  
                  {mediaInfo.overview && (
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">{mediaInfo.overview}</p>
                  )}
                  
                  {/* Add to wishlist button if not in wishlist */}
                  {!isInWishlist && userId && (
                    <button
                      onClick={handleAddToWishlist}
                      disabled={updating}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
                    >
                      {updating ? 'Adding...' : 'Add to Want to Watch'}
                    </button>
                  )}

                  {/* Status and Rating Controls - Only show if in wishlist */}
                  {isInWishlist && mediaItem && (
                    <div className="space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
                      <StatusSelector value={status} onChange={setStatus} />
                      <RatingInput value={rating} onChange={setRating} />
                      <button
                        onClick={handleUpdateStatus}
                        disabled={updating}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
                      >
                        {updating ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trailer Video - At the bottom */}
            {showTrailer && mediaInfo.trailer && mediaInfo.trailer.site === 'YouTube' && (
              <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Trailer
                  </h2>
                  <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${mediaInfo.trailer.key}?controls=1&rel=0`}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${mediaInfo.title} Trailer`}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {!mediaInfo && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Could not load media details.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}


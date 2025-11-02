'use client';

import { MediaItem } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import StatusFilter from './StatusFilter';
import { useState } from 'react';

interface WishlistProps {
  items: MediaItem[];
  onRemove: (id: string) => void;
  isLoading: boolean;
  showFilter?: boolean;
}

export default function Wishlist({ items, onRemove, isLoading, showFilter = true }: WishlistProps) {
  const [statusFilter, setStatusFilter] = useState('all');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredItems = statusFilter === 'all' 
    ? items 
    : items.filter(item => item.status === statusFilter);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Your wishlist is empty. Search for movies or TV shows to add them!
        </p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          No items with this status.
        </p>
        {showFilter && (
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        )}
      </div>
    );
  }

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '/placeholder-poster.png';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getDate = (item: MediaItem) => {
    return item.release_date || item.first_air_date || '';
  };

  return (
    <div>
      {showFilter && (
        <div className="mb-6">
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link href={`/media/${item.tmdb_id}-${item.media_type}`}>
              <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700 cursor-pointer">
                <Image
                  src={getImageUrl(item.poster_path)}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  unoptimized
                />
              </div>
            </Link>
            <div className="p-2 sm:p-3 lg:p-4">
              <Link href={`/media/${item.tmdb_id}-${item.media_type}`}>
                <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-1 line-clamp-2 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                  {item.title}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                {item.media_type === 'tv' ? 'TV' : 'Movie'} • {getDate(item).substring(0, 4) || 'N/A'}
              </p>
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                  item.status === 'watched' || item.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                  item.status === 'currently_watching' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                  item.status === 'dropped' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                  'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                }`}>
                  <span className="hidden sm:inline">{item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span className="sm:hidden">{item.status.replace('_', ' ').split(' ')[0]}</span>
                </span>
                {item.rating && (
                  <div className="flex items-center gap-0.5 sm:gap-1 text-yellow-500 text-xs sm:text-sm">
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
                {item.overview || 'No overview available'}
              </p>
              <button
                onClick={() => onRemove(item.id)}
                className="w-full py-1.5 sm:py-2 px-2 sm:px-4 bg-red-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


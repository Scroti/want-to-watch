'use client';

import { TMDBSearchResult } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResultsProps {
  results: TMDBSearchResult[];
  onAdd: (item: TMDBSearchResult) => void;
  addedIds: Set<string>;
  isLoading: boolean;
}

export default function SearchResults({ results, onAdd, addedIds, isLoading }: SearchResultsProps) {

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  const getImageUrl = (path: string | null) => {
    if (!path) return '/placeholder-poster.png';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getTitle = (item: TMDBSearchResult) => {
    return 'title' in item ? item.title : item.name;
  };

  const getDate = (item: TMDBSearchResult) => {
    return 'release_date' in item ? item.release_date : item.first_air_date;
  };

  const handleAdd = (item: TMDBSearchResult) => {
    onAdd(item);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6 mt-4 sm:mt-8">
      {results.map((item) => {
        const itemId = `${item.id}-${item.media_type || 'movie'}`;
        const isAdded = addedIds.has(itemId);

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link href={`/media/${item.id}-${item.media_type || 'movie'}`}>
              <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700 cursor-pointer">
                <Image
                  src={getImageUrl(item.poster_path)}
                  alt={getTitle(item)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  unoptimized
                />
              </div>
            </Link>
            <div className="p-2 sm:p-3 lg:p-4">
              <Link href={`/media/${item.id}-${item.media_type || 'movie'}`}>
                <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-1 line-clamp-2 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                  {getTitle(item)}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                {item.media_type === 'tv' ? 'TV' : 'Movie'} • {getDate(item)?.substring(0, 4) || 'N/A'}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
                {item.overview || 'No overview available'}
              </p>
              
              {!isAdded && (
                <button
                  onClick={() => handleAdd(item)}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-4 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="hidden sm:inline">Add to Want to Watch</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}

              {isAdded && (
                <Link href={`/media/${item.id}-${item.media_type || 'movie'}`}>
                  <button className="w-full py-1.5 sm:py-2 px-2 sm:px-4 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs sm:text-sm font-medium cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
                    View
                  </button>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

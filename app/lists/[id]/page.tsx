'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CustomList, MediaItem } from '@/lib/types';

export default function ListDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [list, setList] = useState<CustomList | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadList();
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, id]);

  const loadList = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/lists/${id}`);
      if (res.ok) {
        const data = await res.json();
        setList({
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          description: data.description,
          is_public: data.is_public,
          cover_image_url: data.cover_image_url,
          items_count: data.items_count,
          followers_count: data.followers_count,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          user: data.profiles,
        });
        setItems(data.items?.map((item: any) => ({
          id: item.media_id,
          userId: item.user_id || '',
          title: item.wishlist?.title || '',
          overview: item.wishlist?.overview,
          poster_path: item.wishlist?.poster_path,
          release_date: item.wishlist?.release_date,
          first_air_date: item.wishlist?.first_air_date,
          media_type: item.wishlist?.media_type,
          tmdb_id: item.wishlist?.tmdb_id || 0,
          status: item.wishlist?.status || 'want_to_watch',
          rating: item.wishlist?.rating,
          addedAt: new Date(item.added_at),
          updatedAt: new Date(item.added_at),
        })) || []);
      }
    } catch (error) {
      console.error('Failed to load list:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return '/placeholder-poster.png';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">List Not Found</h1>
          <Link href="/lists" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{list.name}</h1>
          {list.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{list.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{list.items_count} items</span>
            <span>{list.followers_count} followers</span>
            <Link href={`/profile/${list.user?.username || list.user_id}`}>
              <span className="hover:text-blue-600 dark:hover:text-blue-400">
                by {list.user?.display_name || list.user?.username || 'User'}
              </span>
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              This list is empty.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/media/${item.tmdb_id}-${item.media_type}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={getImageUrl(item.poster_path)}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.media_type === 'tv' ? 'TV Series' : 'Movie'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


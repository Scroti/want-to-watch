'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { TMDBSearchResult, MediaItem } from '@/lib/types';

export default function SearchPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Preload user's wishlist to mark already-added items
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data: MediaItem[] = await res.json();
          setAddedIds(new Set(data.map((item) => item.id)));
        }
      } catch {
        // ignore
      }
    };
    if (isLoaded && isSignedIn) {
      loadWishlist();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAdd = async (item: TMDBSearchResult) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: item.id,
          title: 'title' in item ? item.title : item.name,
          overview: item.overview,
          poster_path: item.poster_path,
          release_date: 'release_date' in item ? item.release_date : undefined,
          first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
          media_type: item.media_type || ('release_date' in item ? 'movie' : 'tv'),
          status: 'want_to_watch',
        }),
      });

      if (res.ok) {
        const itemId = `${item.id}-${item.media_type || 'movie'}`;
        setAddedIds((prev) => new Set([...prev, itemId]));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist:changed'));
        }
      } else if (res.status === 409) {
        alert('This item is already in your wishlist!');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to add item to wishlist');
      }
    } catch (error) {
      alert('Failed to add item to wishlist');
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20">
        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
        </div>
        {searchQuery ? (
          <SearchResults
            results={searchResults}
            onAdd={handleAdd}
            addedIds={addedIds}
            isLoading={isSearching}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Start searching for movies and TV shows to add to your wishlist!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}



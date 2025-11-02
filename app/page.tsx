'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Wishlist from './components/Wishlist';
import { TMDBSearchResult, MediaItem } from '@/lib/types';

export default function Home() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [wishlist, setWishlist] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'wishlist'>('search');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  // Check URL hash for tab preference
  useEffect(() => {
    if (window.location.hash === '#wishlist') {
      setActiveTab('wishlist');
    } else if (window.location.hash === '#search') {
      setActiveTab('search');
    }
  }, []);

  // Load wishlist on mount and auto-create profile
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadWishlist();
      // Auto-create profile if it doesn't exist
      autoCreateProfile();
      loadCurrentUserProfile();
    }
  }, [isLoaded, isSignedIn]);

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

  const autoCreateProfile = async () => {
    try {
      await fetch('/api/users/auto-create-profile', {
        method: 'POST',
      });
      // Silently create profile, don't show errors
    } catch (error) {
      // Ignore errors, profile might already exist
    }
  };

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const loadWishlist = async () => {
    try {
      setIsLoadingWishlist(true);
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
        setAddedIds(new Set(data.map((item: MediaItem) => item.id)));
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (item: TMDBSearchResult) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tmdb_id: item.id,
          title: item.title,
          overview: item.overview,
          poster_path: item.poster_path,
          release_date: 'release_date' in item ? item.release_date : undefined,
          first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
          media_type: item.media_type || ('release_date' in item ? 'movie' : 'tv'),
          status: 'want_to_watch', // Always add as "want to watch" initially
        }),
      });

      if (res.ok) {
        const newItem = await res.json();
        setWishlist((prev) => [newItem, ...prev]);
        const itemId = `${item.id}-${item.media_type || 'movie'}`;
        setAddedIds((prev) => new Set([...prev, itemId]));
      } else if (res.status === 409) {
        alert('This item is already in your wishlist!');
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item to wishlist');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
        setAddedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item from wishlist');
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
        <div className="mb-6 hidden sm:block">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('search');
                window.location.hash = 'search';
              }}
              className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => {
                setActiveTab('wishlist');
                window.location.hash = 'wishlist';
              }}
              className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'wishlist'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="hidden sm:inline">My Wishlist</span>
              <span className="sm:hidden">List</span>
              <span className="ml-1">({wishlist.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'search' && (
          <div>
            <div className="flex justify-center mb-8">
              <SearchBar onSearch={handleSearch} isLoading={isSearching} />
            </div>
            {searchQuery && (
              <SearchResults
                results={searchResults}
                onAdd={handleAdd}
                addedIds={addedIds}
                isLoading={isSearching}
              />
            )}
            {!searchQuery && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Start searching for movies and TV shows to add to your wishlist!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <Wishlist
              items={wishlist}
              onRemove={handleRemove}
              isLoading={isLoadingWishlist}
            />
          </div>
        )}

      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Wishlist from '../components/Wishlist';
import { MediaItem } from '@/lib/types';

export default function ListPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<MediaItem[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadWishlist();
    }
  }, [isLoaded, isSignedIn]);

  const loadWishlist = async () => {
    try {
      setIsLoadingWishlist(true);
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.id !== id));
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
        <Wishlist items={wishlist} onRemove={handleRemove} isLoading={isLoadingWishlist} />
      </main>
    </div>
  );
}



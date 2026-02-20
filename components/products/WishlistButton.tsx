'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  productId: string;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if product is in wishlist
    fetch(`/api/customer/products/${productId}/wishlist`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInWishlist(data.data.inWishlist);
        }
      })
      .catch(err => console.error('Error checking wishlist:', err))
      .finally(() => setChecking(false));
  }, [productId]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const method = inWishlist ? 'DELETE' : 'POST';
      const response = await fetch(`/api/customer/products/${productId}/wishlist`, {
        method,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update wishlist');
      }

      setInWishlist(!inWishlist);
      router.refresh();
    } catch (error) {
      console.error('Wishlist error:', error);
      alert('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-lg"
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-lg transition ${
        inWishlist
          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
      } disabled:opacity-50`}
    >
      {loading ? '...' : inWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
    </button>
  );
}

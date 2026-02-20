'use client';

import { useEffect } from 'react';

interface ProductViewTrackerProps {
  productId: string;
}

export default function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  useEffect(() => {
    // Track product view
    fetch(`/api/customer/products/${productId}/view`, {
      method: 'POST',
    }).catch((error) => {
      console.error('Failed to track product view:', error);
    });
  }, [productId]);

  return null; // This component doesn't render anything
}

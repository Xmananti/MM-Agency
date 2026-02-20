'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BrandDeleteButtonProps {
  brandId: string;
  brandName: string;
  productCount: number;
}

export default function BrandDeleteButton({ brandId, brandName, productCount }: BrandDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (productCount > 0) {
      alert(`Cannot delete brand "${brandName}". It is being used by ${productCount} product(s).`);
      return;
    }

    if (!confirm(`Are you sure you want to delete brand "${brandName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete brand');
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete brand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading || productCount > 0}
      className={`text-sm font-medium ${
        productCount > 0
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
      } disabled:opacity-50`}
      title={productCount > 0 ? `Cannot delete: ${productCount} products use this brand` : 'Delete brand'}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}

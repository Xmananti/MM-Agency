'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VendorVerificationButtonProps {
  vendorId: string;
  isVerified: boolean;
}

export default function VendorVerificationButton({ vendorId, isVerified }: VendorVerificationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_verified: !isVerified }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vendor status');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating vendor:', error);
      alert('Failed to update vendor status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1 text-xs rounded ${
        isVerified
          ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
      } disabled:opacity-50`}
    >
      {loading ? '...' : isVerified ? 'Suspend' : 'Approve'}
    </button>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddToCartFormProps {
  productId: string;
  vendorId: string;
  price: number;
  maxQuantity: number;
}

export default function AddToCartForm({ productId, vendorId, price, maxQuantity }: AddToCartFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            product_id: productId,
            vendor_id: vendorId,
            quantity,
            price,
          }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      router.push('/customer/orders');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-sm font-medium">
          Quantity:
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        />
        <span className="text-sm text-gray-500">
          Total: ${(price * quantity).toFixed(2)}
        </span>
      </div>

      <button
        type="submit"
        disabled={loading || maxQuantity === 0}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}

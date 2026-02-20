'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  brands?: Brand[]; // Make optional with default
  vendorId: string;
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category_id: string | null;
    brand_id?: string | null;
    image_urls: string[];
    is_active: boolean;
  };
}

export default function ProductForm({ categories, brands = [], vendorId, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category_id: product?.category_id || '',
    brand_id: product?.brand_id || '',
    brand_name: '', // For new brand creation
    is_active: product?.is_active !== undefined ? product.is_active : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate brand is selected or new brand name is provided
    if (!formData.brand_id && !formData.brand_name?.trim()) {
      setError('Brand is required. Please select an existing brand or create a new one.');
      setLoading(false);
      return;
    }

    try {
      const url = product 
        ? `/api/vendor/products/${product.id}`
        : '/api/vendor/products';
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          vendor_id: vendorId,
          // If brand_name is provided, use it; otherwise use brand_id
          brand_id: formData.brand_name?.trim() ? null : formData.brand_id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      router.push('/vendor/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            step="0.01"
            min="0"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            id="stock"
            min="0"
            required
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium mb-2">
            Category
          </label>
          <select
            id="category_id"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="brand_id" className="block text-sm font-medium mb-2">
            Brand *
          </label>
          <div className="space-y-2">
            {!showNewBrand ? (
              <>
                <select
                  id="brand_id"
                  required
                  value={formData.brand_id}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setShowNewBrand(true);
                      setFormData({ ...formData, brand_id: '', brand_name: '' });
                    } else {
                      setFormData({ ...formData, brand_id: e.target.value, brand_name: '' });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="">Select a brand (required)</option>
                  {brands && brands.length > 0 && brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                  <option value="new">+ Create New Brand</option>
                </select>
                <p className="text-xs text-gray-500">
                  Brand is required. Select an existing brand or create a new one.
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="brand_name"
                    required
                    placeholder="Enter new brand name"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewBrand(false);
                      setFormData({ ...formData, brand_id: '', brand_name: '' });
                    }}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter the name of the new brand you want to create.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm font-medium">
          Product is active
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

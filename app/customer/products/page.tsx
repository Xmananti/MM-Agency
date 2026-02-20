import DashboardLayout from '@/components/layouts/DashboardLayout';
import sql from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import Link from 'next/link';

export default async function CustomerProductsPage() {
  await requireRole(['CUSTOMER']);
  
  const products = await sql`
    SELECT p.*, v.name as vendor_name, b.name as brand_name, c.name as category_name
    FROM products p
    JOIN vendors v ON v.id = p.vendor_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = true AND p.stock > 0
    ORDER BY p.created_at DESC
    LIMIT 50
  `;

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Browse Products</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover products from our vendors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                {product.brand_name && (
                  <p className="text-sm text-gray-500 mb-1">Brand: {product.brand_name}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {product.vendor_name}
                </p>
                {product.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">${parseFloat(product.price || '0').toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                </div>
                <Link
                  href={`/customer/products/${product.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

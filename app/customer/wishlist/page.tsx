import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireRole } from '@/lib/rbac';
import sql from '@/lib/db';
import Link from 'next/link';

export default async function CustomerWishlistPage() {
  const customer = await requireRole(['CUSTOMER']);
  
  const wishlistItems = await sql`
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.image_urls,
      v.name as vendor_name,
      b.name as brand_name,
      c.name as category_name,
      cpr.created_at as added_at
    FROM customer_product_relations cpr
    JOIN products p ON p.id = cpr.product_id
    JOIN vendors v ON v.id = p.vendor_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE cpr.customer_id = ${customer.userId}
      AND cpr.relation_type = 'WISHLIST'
      AND p.is_active = true
    ORDER BY cpr.created_at DESC
  `;

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Products you've saved for later
          </p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item: any) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                  {item.brand_name && (
                    <p className="text-sm text-gray-500 mb-1">Brand: {item.brand_name}</p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.vendor_name}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">${parseFloat(item.price || '0').toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock'}
                    </p>
                  </div>
                  <Link
                    href={`/customer/products/${item.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Your wishlist is empty</p>
            <Link
              href="/customer/products"
              className="text-blue-600 hover:underline"
            >
              Browse products
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

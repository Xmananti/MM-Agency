import DashboardLayout from '@/components/layouts/DashboardLayout';
import sql from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { notFound } from 'next/navigation';
import AddToCartForm from '@/components/orders/AddToCartForm';
import WishlistButton from '@/components/products/WishlistButton';
import ProductViewTracker from '@/components/products/ProductViewTracker';

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await requireRole(['CUSTOMER']);
  
  const products = await sql`
    SELECT p.*, v.name as vendor_name, v.id as vendor_id, b.name as brand_name, c.name as category_name
    FROM products p
    JOIN vendors v ON v.id = p.vendor_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ${params.id} AND p.is_active = true
  `;

  if (products.length === 0) {
    notFound();
  }

  const product = products[0];

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <ProductViewTracker productId={product.id} />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          {product.brand_name && (
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              Brand: <span className="font-medium">{product.brand_name}</span>
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Sold by: <span className="font-medium">{product.vendor_name}</span>
          </p>
          {product.category_name && (
            <p className="text-sm text-gray-500 mb-4">
              Category: {product.category_name}
            </p>
          )}
          
          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
            </div>
          )}

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">${parseFloat(product.price || '0').toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {product.stock > 0 ? (
                    <span className="text-green-600">In Stock ({product.stock} available)</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              {product.stock > 0 && (
                <AddToCartForm 
                  productId={product.id}
                  vendorId={product.vendor_id}
                  price={parseFloat(product.price)}
                  maxQuantity={parseInt(product.stock)}
                />
              )}
              <WishlistButton productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

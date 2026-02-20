import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireVendor } from '@/lib/rbac';
import sql from '@/lib/db';
import ProductForm from '@/components/products/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const vendor = await requireVendor();
  
  const products = await sql`
    SELECT *
    FROM products
    WHERE id = ${params.id} AND vendor_id = ${vendor.vendorId}
  `;

  if (products.length === 0) {
    notFound();
  }

  const product = products[0];
  
  let categoriesResult: any[] = [];
  let brandsResult: any[] = [];
  
  try {
    [categoriesResult, brandsResult] = await Promise.all([
      sql`SELECT id, name FROM categories ORDER BY name`,
      sql`SELECT id, name FROM brands ORDER BY name`,
    ]);
  } catch (error) {
    console.error('Error fetching categories/brands:', error);
    // Continue with empty arrays if tables don't exist yet
  }
  
  const categories = (categoriesResult || []).map((row: any) => ({
    id: row.id,
    name: row.name,
  }));

  const brands = (brandsResult || []).map((row: any) => ({
    id: row.id,
    name: row.name,
  }));

  return (
    <DashboardLayout allowedRoles={['VENDOR']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update product information
          </p>
        </div>

        <ProductForm 
          categories={categories}
          brands={brands}
          vendorId={vendor.vendorId}
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: parseInt(product.stock),
            category_id: product.category_id,
            brand_id: product.brand_id,
            image_urls: product.image_urls || [],
            is_active: product.is_active,
          }}
        />
      </div>
    </DashboardLayout>
  );
}

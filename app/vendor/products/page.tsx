import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireVendor } from '@/lib/rbac';
import sql from '@/lib/db';
import Link from 'next/link';
import DataTable from '@/components/ui/DataTable';

export default async function VendorProductsPage() {
  const vendor = await requireVendor();
  
  const products = await sql`
    SELECT id, name, price, stock, is_active, created_at
    FROM products
    WHERE vendor_id = ${vendor.vendorId}
    ORDER BY created_at DESC
  `;

  return (
    <DashboardLayout allowedRoles={['VENDOR']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your product catalog
            </p>
          </div>
          <Link
            href="/vendor/products/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Product
          </Link>
        </div>

        {products.length > 0 ? (
          <DataTable
            data={products}
            columns={[
              { key: 'name', header: 'Product Name', sortable: true },
              {
                key: 'price',
                header: 'Price',
                sortable: true,
                render: (row: any) => `$${parseFloat(row.price || '0').toFixed(2)}`,
              },
              {
                key: 'stock',
                header: 'Stock',
                sortable: true,
                render: (row: any) => (
                  <span className={parseInt(row.stock || '0') < 10 ? 'text-red-600 font-medium' : ''}>
                    {row.stock} units
                  </span>
                ),
              },
              {
                key: 'is_active',
                header: 'Status',
                sortable: true,
                render: (row: any) => (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    row.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                key: 'id',
                header: 'Actions',
                render: (row: any) => (
                  <Link
                    href={`/vendor/products/${row.id}`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </Link>
                ),
              },
            ]}
            searchable={true}
            searchPlaceholder="Search products..."
            pagination={true}
            itemsPerPage={20}
            filters={[
              {
                key: 'is_active',
                label: 'Status',
                options: [
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ],
              },
            ]}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No products yet.</p>
            <Link href="/vendor/products/new" className="text-blue-600 hover:underline">
              Create your first product
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireSuperAdmin } from '@/lib/rbac';
import sql from '@/lib/db';
import DataTable from '@/components/ui/DataTable';

export default async function AdminProductsPage() {
  await requireSuperAdmin();
  
  const products = await sql`
    SELECT 
      p.id,
      p.name,
      p.price,
      p.stock,
      p.is_active,
      p.created_at,
      v.name as vendor_name,
      b.name as brand_name,
      c.name as category_name
    FROM products p
    JOIN vendors v ON v.id = p.vendor_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.created_at DESC
  `;

  // Get unique vendors and categories for filters
  const vendors = await sql`SELECT DISTINCT name FROM vendors ORDER BY name`;
  const categories = await sql`SELECT DISTINCT name FROM categories WHERE name IS NOT NULL ORDER BY name`;

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all products across all vendors
          </p>
        </div>

        <DataTable
          data={products}
          columns={[
            { key: 'name', header: 'Product Name', sortable: true },
            { key: 'brand_name', header: 'Brand', sortable: true },
            { key: 'vendor_name', header: 'Vendor', sortable: true },
            { key: 'category_name', header: 'Category', sortable: true },
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
          ]}
          searchable={true}
          searchPlaceholder="Search products..."
          pagination={true}
          itemsPerPage={20}
          filters={[
            {
              key: 'vendor_name',
              label: 'Vendor',
              options: vendors.map((v: any) => ({ value: v.name, label: v.name })),
            },
            {
              key: 'category_name',
              label: 'Category',
              options: categories.map((c: any) => ({ value: c.name, label: c.name })),
            },
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
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireSuperAdmin } from '@/lib/rbac';
import sql from '@/lib/db';
import BrandForm from '@/components/admin/BrandForm';
import BrandDeleteButton from '@/components/admin/BrandDeleteButton';

export default async function AdminBrandsPage() {
  await requireSuperAdmin();
  
  const brands = await sql`
    SELECT 
      b.id,
      b.name,
      b.description,
      b.logo_url,
      b.created_at,
      COUNT(DISTINCT p.id) as product_count
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id
    GROUP BY b.id, b.name, b.description, b.logo_url, b.created_at
    ORDER BY b.created_at DESC
  `;

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Brands</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage product brands
            </p>
          </div>
        </div>

        {/* Create Brand Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Brand</h2>
          <BrandForm />
        </div>

        {/* Brands List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">All Brands</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Brand Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {brands.length > 0 ? (
                  brands.map((brand: any) => (
                    <tr key={brand.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {brand.logo_url && (
                            <img 
                              src={brand.logo_url} 
                              alt={brand.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="text-sm font-medium">{brand.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          {brand.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{parseInt(brand.product_count || '0')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(brand.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <BrandDeleteButton 
                          brandId={brand.id}
                          brandName={brand.name}
                          productCount={parseInt(brand.product_count || '0')}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No brands yet. Create your first brand above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

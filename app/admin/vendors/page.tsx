import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireSuperAdmin } from '@/lib/rbac';
import sql from '@/lib/db';
import VendorVerificationButton from '@/components/admin/VendorVerificationButton';

export default async function AdminVendorsPage() {
  await requireSuperAdmin();
  
  const vendors = await sql`
    SELECT v.*, COUNT(DISTINCT u.id) as user_count, COUNT(DISTINCT p.id) as product_count
    FROM vendors v
    LEFT JOIN users u ON u.vendor_id = v.id
    LEFT JOIN products p ON p.vendor_id = v.id
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `;

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendors</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage vendor accounts and verifications
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vendor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Commission Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {vendors.map((vendor: any) => (
                  <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{vendor.name}</div>
                      {vendor.description && (
                        <div className="text-xs text-gray-500 mt-1">{vendor.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{parseFloat(vendor.commission_rate || '0').toFixed(2)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{parseInt(vendor.product_count || '0')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vendor.is_verified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {vendor.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <VendorVerificationButton 
                        vendorId={vendor.id} 
                        isVerified={vendor.is_verified}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

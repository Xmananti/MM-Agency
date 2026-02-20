import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireVendor } from '@/lib/rbac';
import sql from '@/lib/db';
import VendorSettingsForm from '@/components/vendor/VendorSettingsForm';

export default async function VendorSettingsPage() {
  const vendor = await requireVendor();
  
  const vendors = await sql`
    SELECT *
    FROM vendors
    WHERE id = ${vendor.vendorId}
  `;

  if (vendors.length === 0) {
    return (
      <DashboardLayout allowedRoles={['VENDOR']}>
        <div className="text-center py-12">
          <p className="text-gray-500">Vendor not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const vendorData = vendors[0];

  return (
    <DashboardLayout allowedRoles={['VENDOR']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your vendor account settings
          </p>
        </div>

        <VendorSettingsForm vendor={vendorData} />
      </div>
    </DashboardLayout>
  );
}

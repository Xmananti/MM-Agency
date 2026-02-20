import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireSuperAdmin } from '@/lib/rbac';
import sql from '@/lib/db';
import DataTable from '@/components/ui/DataTable';

export default async function AdminCustomersPage() {
  await requireSuperAdmin();
  
  const customers = await sql`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.is_active,
      u.created_at,
      COUNT(DISTINCT o.id) as order_count,
      COALESCE(SUM(o.total_amount), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON o.customer_id = u.id AND o.status != 'CANCELLED'
    WHERE u.role = 'CUSTOMER'
    GROUP BY u.id, u.name, u.email, u.is_active, u.created_at
    ORDER BY u.created_at DESC
  `;

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer accounts
          </p>
        </div>

        <DataTable
          data={customers}
          columns={[
            { key: 'name', header: 'Customer Name', sortable: true },
            { key: 'email', header: 'Email', sortable: true },
            {
              key: 'order_count',
              header: 'Orders',
              sortable: true,
              render: (row: any) => parseInt(row.order_count || '0'),
            },
            {
              key: 'total_spent',
              header: 'Total Spent',
              sortable: true,
              render: (row: any) => `$${parseFloat(row.total_spent || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
            {
              key: 'is_active',
              header: 'Status',
              sortable: true,
              render: (row: any) => (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  row.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {row.is_active ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              key: 'created_at',
              header: 'Joined',
              sortable: true,
              render: (row: any) => new Date(row.created_at).toLocaleDateString(),
            },
          ]}
          searchable={true}
          searchPlaceholder="Search customers..."
          pagination={true}
          itemsPerPage={25}
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
      </div>
    </DashboardLayout>
  );
}

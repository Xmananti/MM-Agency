import DashboardLayout from '@/components/layouts/DashboardLayout';
import { requireSuperAdmin } from '@/lib/rbac';
import sql from '@/lib/db';
import DataTable from '@/components/ui/DataTable';

export default async function AdminOrdersPage() {
  await requireSuperAdmin();
  
  const orders = await sql`
    SELECT 
      o.id,
      o.total_amount,
      o.platform_commission,
      o.status,
      o.created_at,
      u.name as customer_name,
      u.email as customer_email,
      COUNT(DISTINCT oi.id) as item_count
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id, o.total_amount, o.platform_commission, o.status, o.created_at, u.name, u.email
    ORDER BY o.created_at DESC
  `;

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all orders across the platform
          </p>
        </div>

        <DataTable
          data={orders}
          columns={[
            {
              key: 'id',
              header: 'Order ID',
              render: (row: any) => (
                <span className="font-mono text-xs">{row.id.substring(0, 8)}...</span>
              ),
            },
            { key: 'customer_name', header: 'Customer', sortable: true },
            {
              key: 'created_at',
              header: 'Date',
              sortable: true,
              render: (row: any) => new Date(row.created_at).toLocaleDateString(),
            },
            { key: 'item_count', header: 'Items', sortable: true },
            {
              key: 'total_amount',
              header: 'Total',
              sortable: true,
              render: (row: any) => `$${parseFloat(row.total_amount || '0').toFixed(2)}`,
            },
            {
              key: 'platform_commission',
              header: 'Commission',
              sortable: true,
              render: (row: any) => `$${parseFloat(row.platform_commission || '0').toFixed(2)}`,
            },
            {
              key: 'status',
              header: 'Status',
              sortable: true,
              render: (row: any) => (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  row.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  row.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  row.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {row.status}
                </span>
              ),
            },
          ]}
          searchable={true}
          searchPlaceholder="Search orders..."
          pagination={true}
          itemsPerPage={25}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'PENDING', label: 'Pending' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'SHIPPED', label: 'Shipped' },
                { value: 'DELIVERED', label: 'Delivered' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ],
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}

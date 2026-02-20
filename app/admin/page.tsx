import DashboardLayout from '@/components/layouts/DashboardLayout';
import KPICard from '@/components/ui/KPICard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import { 
  getPlatformRevenue, 
  getActiveVendorsCount, 
  getTopVendors,
  getSalesOverTime 
} from '@/lib/analytics';
import sql from '@/lib/db';

export default async function AdminDashboard() {
  const [revenue, vendorsCount, topVendors, salesOverTime] = await Promise.all([
    getPlatformRevenue(),
    getActiveVendorsCount(),
    getTopVendors(10),
    getSalesOverTime(30),
  ]);

  const totalRevenue = parseFloat(revenue.total_revenue || '0');
  const totalCommission = parseFloat(revenue.total_commission || '0');
  const totalOrders = parseInt(revenue.total_orders || '0');

  // Get pending vendor approvals
  const pendingVendors = await sql`
    SELECT COUNT(*) as count
    FROM vendors
    WHERE is_verified = false
  `;
  const pendingCount = parseInt(pendingVendors[0].count);

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Platform overview and analytics
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="💰"
          />
          <KPICard
            title="Platform Commission"
            value={`$${totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="💵"
          />
          <KPICard
            title="Total Orders"
            value={totalOrders.toLocaleString()}
            icon="🛒"
          />
          <KPICard
            title="Active Vendors"
            value={vendorsCount}
            icon="🏪"
            subtitle={`${pendingCount} pending approval`}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Sales Over Time (30 days)</h2>
            <LineChart
              data={salesOverTime.map((row: any) => ({
                date: row.date,
                revenue: parseFloat(row.revenue || '0'),
              }))}
              dataKey="revenue"
              name="Revenue"
              color="#3b82f6"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performing Vendors</h2>
            <BarChart
              data={topVendors.map((vendor: any) => ({
                name: vendor.name.length > 15 ? vendor.name.substring(0, 15) + '...' : vendor.name,
                sales: parseFloat(vendor.total_sales || '0'),
              }))}
              dataKey="sales"
              name="Total Sales"
              color="#10b981"
            />
          </div>
        </div>

        {/* Top Vendors Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Top Vendors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Sales
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topVendors.map((vendor: any) => (
                  <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{vendor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{parseInt(vendor.order_count || '0')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        ${parseFloat(vendor.total_sales || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
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

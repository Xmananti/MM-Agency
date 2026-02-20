import DashboardLayout from '@/components/layouts/DashboardLayout';
import KPICard from '@/components/ui/KPICard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import { requireVendor } from '@/lib/rbac';
import { 
  getVendorSales, 
  getVendorRevenueOverTime,
  getVendorBestSellingProducts,
  getVendorLowStockProducts,
  getVendorConversionRate,
  getVendorMonthlyGrowth
} from '@/lib/analytics';

export default async function VendorAnalyticsPage() {
  const vendor = await requireVendor();
  
  const [sales, revenueOverTime, bestSelling, lowStock, conversionRate, monthlyGrowth] = await Promise.all([
    getVendorSales(vendor.vendorId),
    getVendorRevenueOverTime(vendor.vendorId, 90),
    getVendorBestSellingProducts(vendor.vendorId, 10),
    getVendorLowStockProducts(vendor.vendorId, 10),
    getVendorConversionRate(vendor.vendorId),
    getVendorMonthlyGrowth(vendor.vendorId),
  ]);

  const totalSales = parseFloat(sales.total_sales || '0');
  const totalOrders = parseInt(sales.total_orders || '0');
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <DashboardLayout allowedRoles={['VENDOR']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed analytics and insights for your store
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Sales"
            value={`$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="💰"
          />
          <KPICard
            title="Total Orders"
            value={totalOrders.toLocaleString()}
            icon="🛒"
          />
          <KPICard
            title="Conversion Rate"
            value={`${conversionRate.toFixed(1)}%`}
            icon="📊"
            subtitle="Orders per product"
          />
          <KPICard
            title="Monthly Growth"
            value={`${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`}
            icon="📈"
            trend={{
              value: Math.abs(monthlyGrowth),
              isPositive: monthlyGrowth >= 0,
            }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Over Time (90 days)</h2>
            <LineChart
              data={revenueOverTime.map((row: any) => ({
                date: row.date,
                revenue: parseFloat(row.revenue || '0'),
              }))}
              dataKey="revenue"
              name="Revenue"
              color="#10b981"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Best Selling Products</h2>
            <BarChart
              data={bestSelling.map((product: any) => ({
                name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
                sales: parseFloat(product.revenue || '0'),
              }))}
              dataKey="sales"
              name="Revenue"
              color="#3b82f6"
            />
          </div>
        </div>

        {/* Best Selling Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Top Performing Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bestSelling.length > 0 ? (
                  bestSelling.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{parseInt(product.total_sold || '0')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          ${parseFloat(product.revenue || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No sales data yet
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

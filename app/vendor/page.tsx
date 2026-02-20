import DashboardLayout from '@/components/layouts/DashboardLayout';
import KPICard from '@/components/ui/KPICard';
import LineChart from '@/components/charts/LineChart';
import { requireVendor } from '@/lib/rbac';
import { 
  getVendorSales, 
  getVendorRevenueOverTime,
  getVendorBestSellingProducts,
  getVendorLowStockProducts 
} from '@/lib/analytics';

export default async function VendorDashboard() {
  const vendor = await requireVendor();
  
  const [sales, revenueOverTime, bestSelling, lowStock] = await Promise.all([
    getVendorSales(vendor.vendorId),
    getVendorRevenueOverTime(vendor.vendorId, 30),
    getVendorBestSellingProducts(vendor.vendorId, 5),
    getVendorLowStockProducts(vendor.vendorId, 10),
  ]);

  const totalSales = parseFloat(sales.total_sales || '0');
  const totalOrders = parseInt(sales.total_orders || '0');

  return (
    <DashboardLayout allowedRoles={['VENDOR']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your store analytics and overview
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
            title="Low Stock Items"
            value={lowStock.length}
            icon="⚠️"
            subtitle={`${lowStock.length} products need restocking`}
          />
          <KPICard
            title="Best Sellers"
            value={bestSelling.length}
            icon="⭐"
            subtitle="Top performing products"
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Over Time (30 days)</h2>
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

        {/* Best Selling Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Best Selling Products</h2>
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

        {/* Low Stock Alerts */}
        {lowStock.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800 dark:text-yellow-200">
              ⚠️ Low Stock Alert
            </h2>
            <div className="space-y-2">
              {lowStock.map((product: any) => (
                <div key={product.id} className="flex justify-between items-center">
                  <span className="text-sm">{product.name}</span>
                  <span className="text-sm font-medium">
                    {product.stock} units remaining
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

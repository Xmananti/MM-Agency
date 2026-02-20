import DashboardLayout from '@/components/layouts/DashboardLayout';
import KPICard from '@/components/ui/KPICard';
import { requireRole } from '@/lib/rbac';
import { getCustomerOrderHistory, getCustomerTotalSpent, getCustomerRecentlyViewed } from '@/lib/analytics';
import Link from 'next/link';

export default async function CustomerDashboard() {
  const customer = await requireRole(['CUSTOMER']);
  
  const [orderHistory, totalSpent, recentlyViewed] = await Promise.all([
    getCustomerOrderHistory(customer.userId),
    getCustomerTotalSpent(customer.userId),
    getCustomerRecentlyViewed(customer.userId, 6),
  ]);

  const recentOrders = orderHistory.slice(0, 5);

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your account overview
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Total Spent"
            value={`$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="💰"
          />
          <KPICard
            title="Total Orders"
            value={orderHistory.length}
            icon="🛒"
          />
          <KPICard
            title="Recent Orders"
            value={recentOrders.length}
            icon="📋"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono">{order.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{parseInt(order.item_count || '0')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          ${parseFloat(order.total_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No orders yet. <a href="/customer/products" className="text-blue-600 hover:underline">Start shopping!</a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Recently Viewed</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentlyViewed.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/customer/products/${product.id}`}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-md transition"
                  >
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    {product.brand_name && (
                      <p className="text-sm text-gray-500 mb-1">Brand: {product.brand_name}</p>
                    )}
                    <p className="text-lg font-bold">${parseFloat(product.price || '0').toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Viewed {new Date(product.viewed_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

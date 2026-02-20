import sql from './db';
import { UserRole } from '@/types';

// SUPER_ADMIN Analytics
export async function getPlatformRevenue() {
  const result = await sql`
    SELECT 
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COALESCE(SUM(platform_commission), 0) as total_commission,
      COUNT(*) as total_orders
    FROM orders
    WHERE status != 'CANCELLED'
  `;
  return result[0];
}

export async function getActiveVendorsCount() {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM vendors
    WHERE is_verified = true
  `;
  return parseInt(result[0].count);
}

export async function getTopVendors(limit: number = 10) {
  return sql`
    SELECT 
      v.id,
      v.name,
      COUNT(DISTINCT o.id) as order_count,
      COALESCE(SUM(oi.price * oi.quantity), 0) as total_sales
    FROM vendors v
    LEFT JOIN order_items oi ON oi.vendor_id = v.id
    LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'CANCELLED'
    WHERE v.is_verified = true
    GROUP BY v.id, v.name
    ORDER BY total_sales DESC
    LIMIT ${limit}
  `;
}

export async function getSalesOverTime(days: number = 30) {
  return sql`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue,
      COALESCE(SUM(platform_commission), 0) as commission
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '1 day' * ${days}::integer
      AND status != 'CANCELLED'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
}

export async function getNewUsersPerMonth(months: number = 12) {
  return sql`
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as user_count,
      COUNT(*) FILTER (WHERE role = 'CUSTOMER') as customers,
      COUNT(*) FILTER (WHERE role = 'VENDOR') as vendors
    FROM users
    WHERE created_at >= NOW() - INTERVAL '1 month' * ${months}::integer
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC
  `;
}

// VENDOR Analytics
export async function getVendorSales(vendorId: string) {
  const result = await sql`
    SELECT 
      COALESCE(SUM(oi.price * oi.quantity), 0) as total_sales,
      COUNT(DISTINCT o.id) as total_orders
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.vendor_id = ${vendorId}
      AND o.status != 'CANCELLED'
  `;
  return result[0];
}

export async function getVendorRevenueOverTime(vendorId: string, days: number = 30) {
  return sql`
    SELECT 
      DATE(o.created_at) as date,
      COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
      COUNT(DISTINCT o.id) as order_count
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.vendor_id = ${vendorId}
      AND o.created_at >= NOW() - INTERVAL '1 day' * ${days}::integer
      AND o.status != 'CANCELLED'
    GROUP BY DATE(o.created_at)
    ORDER BY date ASC
  `;
}

export async function getVendorBestSellingProducts(vendorId: string, limit: number = 10) {
  return sql`
    SELECT 
      p.id,
      p.name,
      SUM(oi.quantity) as total_sold,
      COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
    FROM products p
    JOIN order_items oi ON oi.product_id = p.id
    JOIN orders o ON o.id = oi.order_id
    WHERE p.vendor_id = ${vendorId}
      AND o.status != 'CANCELLED'
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT ${limit}
  `;
}

export async function getVendorLowStockProducts(vendorId: string, threshold: number = 10) {
  return sql`
    SELECT id, name, stock, price
    FROM products
    WHERE vendor_id = ${vendorId}
      AND stock <= ${threshold}
      AND is_active = true
    ORDER BY stock ASC
  `;
}

// CUSTOMER Analytics
export async function getCustomerOrderHistory(customerId: string) {
  return sql`
    SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.created_at,
      COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.customer_id = ${customerId}
    GROUP BY o.id, o.total_amount, o.status, o.created_at
    ORDER BY o.created_at DESC
  `;
}

export async function getCustomerTotalSpent(customerId: string) {
  const result = await sql`
    SELECT COALESCE(SUM(total_amount), 0) as total_spent
    FROM orders
    WHERE customer_id = ${customerId}
      AND status != 'CANCELLED'
  `;
  return parseFloat(result[0].total_spent);
}

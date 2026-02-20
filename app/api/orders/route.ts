import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import sql from '@/lib/db';
import { z } from 'zod';

const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const customer = await requireRole(['CUSTOMER']);
    const body = await request.json();
    
    const { items } = createOrderSchema.parse(body);

    // Validate products exist and are in stock
    for (const item of items) {
      const products = await sql`
        SELECT stock, is_active, vendor_id
        FROM products
        WHERE id = ${item.product_id}
      `;

      if (products.length === 0) {
        return NextResponse.json(
          { success: false, error: `Product ${item.product_id} not found` },
          { status: 404 }
        );
      }

      const product = products[0];
      
      if (!product.is_active) {
        return NextResponse.json(
          { success: false, error: `Product ${item.product_id} is not active` },
          { status: 400 }
        );
      }

      if (parseInt(product.stock) < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for product ${item.product_id}` },
          { status: 400 }
        );
      }

      if (product.vendor_id !== item.vendor_id) {
        return NextResponse.json(
          { success: false, error: `Product vendor mismatch` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let totalAmount = 0;
    let totalCommission = 0;

    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      // Get vendor commission rate
      const vendors = await sql`
        SELECT commission_rate
        FROM vendors
        WHERE id = ${item.vendor_id}
      `;
      
      const commissionRate = parseFloat(vendors[0]?.commission_rate || '10');
      totalCommission += itemTotal * (commissionRate / 100);
    }

    // Create order
    const orders = await sql`
      INSERT INTO orders (customer_id, total_amount, platform_commission, status)
      VALUES (${customer.userId}, ${totalAmount}, ${totalCommission}, 'PENDING')
      RETURNING id, total_amount, platform_commission
    `;

    const order = orders[0];

    // Create order items and update stock
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, vendor_id, quantity, price)
        VALUES (${order.id}, ${item.product_id}, ${item.vendor_id}, ${item.quantity}, ${item.price})
      `;

      // Update product stock
      await sql`
        UPDATE products
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.product_id}
      `;
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: order.id,
        total_amount: parseFloat(order.total_amount),
        platform_commission: parseFloat(order.platform_commission),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['CUSTOMER', 'VENDOR', 'SUPER_ADMIN']);
    
    if (user.role === 'CUSTOMER') {
      const orders = await sql`
        SELECT o.*, COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.customer_id = ${user.userId}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;

      return NextResponse.json({
        success: true,
        data: orders,
      });
    } else if (user.role === 'VENDOR' && user.vendorId) {
      const orders = await sql`
        SELECT DISTINCT o.*, COUNT(DISTINCT oi.id) as item_count
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.vendor_id = ${user.vendorId}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;

      return NextResponse.json({
        success: true,
        data: orders,
      });
    } else {
      // SUPER_ADMIN - all orders
      const orders = await sql`
        SELECT o.*, COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;

      return NextResponse.json({
        success: true,
        data: orders,
      });
    }
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

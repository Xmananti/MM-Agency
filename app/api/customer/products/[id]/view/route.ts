import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import sql from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await requireRole(['CUSTOMER']);
    
    // Check if product exists
    const products = await sql`
      SELECT id FROM products WHERE id = ${params.id} AND is_active = true
    `;

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Record view (upsert - update timestamp if already exists)
    await sql`
      INSERT INTO customer_product_relations (customer_id, product_id, relation_type, created_at)
      VALUES (${customer.userId}, ${params.id}, 'VIEWED', NOW())
      ON CONFLICT (customer_id, product_id, relation_type) 
      DO UPDATE SET created_at = NOW()
    `;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('View tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

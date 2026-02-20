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

    // Add to wishlist (or update if exists)
    const relations = await sql`
      INSERT INTO customer_product_relations (customer_id, product_id, relation_type)
      VALUES (${customer.userId}, ${params.id}, 'WISHLIST')
      ON CONFLICT (customer_id, product_id, relation_type) 
      DO NOTHING
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist',
      data: { added: relations.length > 0 },
    });
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await requireRole(['CUSTOMER']);
    
    const result = await sql`
      DELETE FROM customer_product_relations
      WHERE customer_id = ${customer.userId}
        AND product_id = ${params.id}
        AND relation_type = 'WISHLIST'
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
    });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await requireRole(['CUSTOMER']);
    
    const relations = await sql`
      SELECT id FROM customer_product_relations
      WHERE customer_id = ${customer.userId}
        AND product_id = ${params.id}
        AND relation_type = 'WISHLIST'
    `;

    return NextResponse.json({
      success: true,
      data: { inWishlist: relations.length > 0 },
    });
  } catch (error) {
    console.error('Wishlist check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

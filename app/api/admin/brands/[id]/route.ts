import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac';
import sql from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    
    // Check if brand is used by any products
    const products = await sql`
      SELECT COUNT(*) as count
      FROM products
      WHERE brand_id = ${params.id}
    `;

    if (parseInt(products[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete brand. It is being used by products.' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM brands
      WHERE id = ${params.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.error('Brand deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

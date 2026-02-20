import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac';
import sql from '@/lib/db';
import { z } from 'zod';

const brandSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    
    const data = brandSchema.parse(body);

    // Check if brand already exists
    const existing = await sql`
      SELECT id FROM brands WHERE LOWER(name) = LOWER(${data.name.trim()})
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Brand with this name already exists' },
        { status: 400 }
      );
    }

    const brands = await sql`
      INSERT INTO brands (name, description)
      VALUES (${data.name.trim()}, ${data.description?.trim() || null})
      RETURNING id, name, description, created_at
    `;

    return NextResponse.json({
      success: true,
      data: brands[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Brand creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();
    
    const brands = await sql`
      SELECT 
        b.*,
        COUNT(DISTINCT p.id) as product_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id
      GROUP BY b.id
      ORDER BY b.name
    `;

    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Brands fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireVendor } from '@/lib/rbac';
import sql from '@/lib/db';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  category_id: z.string().uuid().nullable().optional(),
  brand_id: z.string().uuid().nullable().optional(),
  brand_name: z.string().optional(), // For creating new brand
  vendor_id: z.string().uuid(),
  is_active: z.boolean().default(true),
}).refine(
  (data) => data.brand_id || (data.brand_name && data.brand_name.trim()),
  {
    message: "Brand is required. Please provide either brand_id or brand_name",
    path: ["brand_id"],
  }
);

export async function POST(request: NextRequest) {
  try {
    const vendor = await requireVendor();
    const body = await request.json();
    
    const data = productSchema.parse({
      ...body,
      vendor_id: vendor.vendorId,
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
    });

    let brandId = data.brand_id;

    // If brand_name is provided, create or get existing brand
    if (data.brand_name && data.brand_name.trim()) {
      const existingBrands = await sql`
        SELECT id FROM brands WHERE LOWER(name) = LOWER(${data.brand_name.trim()})
      `;
      
      if (existingBrands.length > 0) {
        brandId = existingBrands[0].id;
      } else {
        // Create new brand
        const newBrands = await sql`
          INSERT INTO brands (name)
          VALUES (${data.brand_name.trim()})
          RETURNING id
        `;
        brandId = newBrands[0].id;
      }
    }

    // Ensure brandId is set (should be validated by schema, but double-check)
    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'Brand is required' },
        { status: 400 }
      );
    }

    const products = await sql`
      INSERT INTO products (name, description, price, stock, vendor_id, category_id, brand_id, is_active)
      VALUES (${data.name}, ${data.description || null}, ${data.price}, ${data.stock}, ${data.vendor_id}, ${data.category_id || null}, ${brandId}, ${data.is_active})
      RETURNING id, name, price, stock, is_active
    `;

    return NextResponse.json({
      success: true,
      data: products[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Product creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const vendor = await requireVendor();
    
    const products = await sql`
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE p.vendor_id = ${vendor.vendorId}
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

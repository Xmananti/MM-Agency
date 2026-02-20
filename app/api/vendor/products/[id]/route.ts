import { NextRequest, NextResponse } from 'next/server';
import { requireVendor } from '@/lib/rbac';
import sql from '@/lib/db';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  category_id: z.string().uuid().nullable().optional(),
  brand_id: z.string().uuid().nullable().optional(),
  brand_name: z.string().optional(),
  is_active: z.boolean().optional(),
}).refine(
  (data) => {
    // If brand_id or brand_name is provided, ensure at least one is valid
    if (data.brand_id !== undefined || data.brand_name !== undefined) {
      return data.brand_id || (data.brand_name && data.brand_name.trim());
    }
    // If neither is provided, that's okay for updates (keeping existing brand)
    return true;
  },
  {
    message: "If updating brand, please provide either brand_id or brand_name",
    path: ["brand_id"],
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await requireVendor();
    
    const products = await sql`
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE p.id = ${params.id} AND p.vendor_id = ${vendor.vendorId}
    `;

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: products[0],
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await requireVendor();
    const body = await request.json();
    
    // Verify product belongs to vendor
    const existing = await sql`
      SELECT id FROM products WHERE id = ${params.id} AND vendor_id = ${vendor.vendorId}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const data = productSchema.parse({
      ...body,
      price: body.price !== undefined ? parseFloat(body.price) : undefined,
      stock: body.stock !== undefined ? parseInt(body.stock) : undefined,
    });

    // Handle brand creation if brand_name is provided
    let brandId = data.brand_id;
    if (data.brand_name && data.brand_name.trim()) {
      const existingBrands = await sql`
        SELECT id FROM brands WHERE LOWER(name) = LOWER(${data.brand_name.trim()})
      `;
      
      if (existingBrands.length > 0) {
        brandId = existingBrands[0].id;
      } else {
        const newBrands = await sql`
          INSERT INTO brands (name)
          VALUES (${data.brand_name.trim()})
          RETURNING id
        `;
        brandId = newBrands[0].id;
      }
    }

    // If brand is being updated, ensure brandId is set
    if (data.brand_id !== undefined || data.brand_name !== undefined) {
      if (!brandId) {
        return NextResponse.json(
          { success: false, error: 'Brand is required when updating brand field' },
          { status: 400 }
        );
      }
    }

    // Build update query - update only provided fields
    const updateFields: any = {};
    
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.description !== undefined) updateFields.description = data.description;
    if (data.price !== undefined) updateFields.price = data.price;
    if (data.stock !== undefined) updateFields.stock = data.stock;
    if (data.category_id !== undefined) updateFields.category_id = data.category_id;
    if (brandId !== undefined) updateFields.brand_id = brandId;
    if (data.is_active !== undefined) updateFields.is_active = data.is_active;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Use postgres template syntax with conditional updates
    let products;
    if (updateFields.name && updateFields.description && updateFields.price && updateFields.stock && updateFields.category_id !== undefined && updateFields.is_active !== undefined) {
      products = await sql`
        UPDATE products
        SET name = ${updateFields.name},
            description = ${updateFields.description},
            price = ${updateFields.price},
            stock = ${updateFields.stock},
            category_id = ${updateFields.category_id},
            is_active = ${updateFields.is_active}
        WHERE id = ${params.id} AND vendor_id = ${vendor.vendorId}
        RETURNING id, name, price, stock, is_active
      `;
    } else {
      // For partial updates, we'll need to build the query dynamically
      // This is a simplified version - in production, use a proper query builder or handle each case
      const updates: string[] = [];
      if (updateFields.name) updates.push(`name = '${updateFields.name.replace(/'/g, "''")}'`);
      if (updateFields.description !== undefined) updates.push(`description = ${updateFields.description === null ? 'NULL' : `'${String(updateFields.description).replace(/'/g, "''")}'`}`);
      if (updateFields.price !== undefined) updates.push(`price = ${updateFields.price}`);
      if (updateFields.stock !== undefined) updates.push(`stock = ${updateFields.stock}`);
      if (updateFields.category_id !== undefined) updates.push(`category_id = ${updateFields.category_id === null ? 'NULL' : `'${updateFields.category_id}'`}`);
      if (updateFields.brand_id !== undefined) updates.push(`brand_id = ${updateFields.brand_id === null ? 'NULL' : `'${updateFields.brand_id}'`}`);
      if (updateFields.is_active !== undefined) updates.push(`is_active = ${updateFields.is_active}`);

      products = await sql.unsafe(
        `UPDATE products SET ${updates.join(', ')} WHERE id = $1 AND vendor_id = $2 RETURNING id, name, price, stock, is_active`,
        [params.id, vendor.vendorId]
      );
    }

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
    console.error('Product update error:', error);
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
    const vendor = await requireVendor();
    
    const result = await sql`
      DELETE FROM products
      WHERE id = ${params.id} AND vendor_id = ${vendor.vendorId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

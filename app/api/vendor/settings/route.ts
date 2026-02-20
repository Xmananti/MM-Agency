import { NextRequest, NextResponse } from 'next/server';
import { requireVendor } from '@/lib/rbac';
import sql from '@/lib/db';
import { z } from 'zod';

const settingsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export async function PUT(request: NextRequest) {
  try {
    const vendor = await requireVendor();
    const body = await request.json();
    
    const data = settingsSchema.parse(body);

    const vendors = await sql`
      UPDATE vendors
      SET name = ${data.name},
          description = ${data.description || null}
      WHERE id = ${vendor.vendorId}
      RETURNING id, name, description, commission_rate, is_verified
    `;

    if (vendors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendors[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

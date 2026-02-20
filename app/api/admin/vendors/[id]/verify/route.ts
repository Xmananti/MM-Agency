import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac';
import sql from '@/lib/db';
import { z } from 'zod';

const verifySchema = z.object({
  is_verified: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    
    const { is_verified } = verifySchema.parse(body);

    const vendors = await sql`
      UPDATE vendors
      SET is_verified = ${is_verified}
      WHERE id = ${params.id}
      RETURNING id, name, is_verified
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
    console.error('Vendor verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

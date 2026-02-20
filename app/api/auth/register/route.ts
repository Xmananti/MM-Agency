import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { hashPassword, generateToken, setAuthToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['CUSTOMER', 'VENDOR']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = registerSchema.parse(body);

    // Check if user exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    let vendorId = null;
    
    // If registering as vendor, create vendor record
    if (role === 'VENDOR') {
      const vendors = await sql`
        INSERT INTO vendors (name, description, commission_rate, is_verified)
        VALUES (${name}, NULL, 10.00, false)
        RETURNING id
      `;
      vendorId = vendors[0].id;
    }

    // Create user
    const users = await sql`
      INSERT INTO users (name, email, password_hash, role, vendor_id)
      VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${vendorId})
      RETURNING id, email, role, vendor_id
    `;

    const user = users[0];

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'VENDOR' | 'CUSTOMER',
      vendorId: user.vendor_id,
    });

    // Set cookie
    await setAuthToken(token);

    // Determine redirect
    let redirectUrl = '/customer';
    if (role === 'VENDOR') {
      redirectUrl = '/vendor';
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        redirectUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

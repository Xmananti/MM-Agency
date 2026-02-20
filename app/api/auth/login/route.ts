import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyPassword, generateToken, setAuthToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const users = await sql`
      SELECT id, email, password_hash, role, vendor_id, is_active
      FROM users
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'SUPER_ADMIN' | 'VENDOR' | 'CUSTOMER',
      vendorId: user.vendor_id,
    });

    // Set cookie
    await setAuthToken(token);

    // Determine redirect based on role
    let redirectUrl = '/';
    if (user.role === 'SUPER_ADMIN') {
      redirectUrl = '/admin';
    } else if (user.role === 'VENDOR') {
      redirectUrl = '/vendor';
    } else if (user.role === 'CUSTOMER') {
      redirectUrl = '/customer';
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
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

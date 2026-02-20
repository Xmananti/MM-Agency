import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/', '/api/auth/login', '/api/auth/register'];

// Protected routes with role requirements
const protectedRoutes: Record<string, UserRole[]> = {
  '/admin': ['SUPER_ADMIN'],
  '/vendor': ['VENDOR'],
  '/api/admin': ['SUPER_ADMIN'],
  '/api/vendor': ['VENDOR'],
};

function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('auth_token')?.value || null;
}

function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route));
}

function getRequiredRole(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for protected routes
  const requiredRoles = getRequiredRole(pathname);
  if (requiredRoles) {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const payload = verifyToken(token);
    if (!payload || !requiredRoles.includes(payload.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }

    // For vendor routes, ensure vendorId exists
    if (requiredRoles.includes('VENDOR') && !payload.vendorId) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

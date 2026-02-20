import { getCurrentUser } from './auth';
import { UserRole } from '@/types';
import { redirect } from 'next/navigation';

export async function requireAuth(): Promise<{ userId: string; email: string; role: UserRole; vendorId: string | null }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<{ userId: string; email: string; role: UserRole; vendorId: string | null }> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }
  return user;
}

export async function requireVendor(): Promise<{ userId: string; email: string; role: 'VENDOR'; vendorId: string }> {
  const user = await requireRole(['VENDOR']);
  if (!user.vendorId) {
    redirect('/unauthorized');
  }
  return {
    ...user,
    role: 'VENDOR' as const,
    vendorId: user.vendorId,
  };
}

export async function requireSuperAdmin(): Promise<{ userId: string; email: string; role: 'SUPER_ADMIN'; vendorId: null }> {
  const user = await requireRole(['SUPER_ADMIN']);
  return {
    ...user,
    role: 'SUPER_ADMIN' as const,
    vendorId: null,
  };
}

// Helper to check if user has access to vendor data
export function canAccessVendorData(userVendorId: string | null, targetVendorId: string): boolean {
  // SUPER_ADMIN can access all vendor data
  // VENDOR can only access their own data
  return userVendorId === targetVendorId;
}

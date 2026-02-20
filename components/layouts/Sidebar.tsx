'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { useState } from 'react';

function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition disabled:opacity-50"
    >
      <span>🚪</span>
      <span>{loading ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
}

interface SidebarProps {
  role: UserRole;
  vendorId?: string | null;
}

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/vendors', label: 'Vendors', icon: '🏪' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/brands', label: 'Brands', icon: '🏷️' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

const vendorLinks = [
  { href: '/vendor', label: 'Dashboard', icon: '📊' },
  { href: '/vendor/products', label: 'Products', icon: '📦' },
  { href: '/vendor/orders', label: 'Orders', icon: '🛒' },
  { href: '/vendor/analytics', label: 'Analytics', icon: '📈' },
  { href: '/vendor/settings', label: 'Settings', icon: '⚙️' },
];

const customerLinks = [
  { href: '/customer', label: 'Dashboard', icon: '🏠' },
  { href: '/customer/products', label: 'Browse', icon: '🛍️' },
  { href: '/customer/orders', label: 'My Orders', icon: '📋' },
  { href: '/customer/wishlist', label: 'Wishlist', icon: '❤️' },
];

export default function Sidebar({ role, vendorId }: SidebarProps) {
  const pathname = usePathname();
  
  const links = 
    role === 'SUPER_ADMIN' ? adminLinks :
    role === 'VENDOR' ? vendorLinks :
    customerLinks;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">MM Agency</h1>
        <p className="text-sm text-gray-400 mt-1">
          {role === 'SUPER_ADMIN' && 'Admin Portal'}
          {role === 'VENDOR' && 'Vendor Portal'}
          {role === 'CUSTOMER' && 'Customer Portal'}
        </p>
      </div>
      
      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <LogoutButton />
      </div>
    </aside>
  );
}

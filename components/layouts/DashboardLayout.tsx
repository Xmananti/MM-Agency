import { getCurrentUser } from '@/lib/auth';
import Sidebar from './Sidebar';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ('SUPER_ADMIN' | 'VENDOR' | 'CUSTOMER')[];
}

export default async function DashboardLayout({ 
  children, 
  allowedRoles 
}: DashboardLayoutProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={user.role} vendorId={user.vendorId} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

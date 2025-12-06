'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/lib/contexts/AdminAuthContext';
import AdminLayout from '@/components/AdminLayout';

function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Get secret admin path from environment
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH;

  // Check if we're on the login page
  const isLoginPage = pathname === `/${adminPath}/auth`;

  useEffect(() => {
    // Only redirect to login if not authenticated AND not already on login page
    if (!isAuthenticated && !isLoginPage) {
      router.push(`/${adminPath}/auth`);
    }
    
    // Redirect to admin dashboard if authenticated and on login page
    if (isAuthenticated && isLoginPage) {
      router.push(`/${adminPath}`);
    }
  }, [isAuthenticated, isLoginPage, router, adminPath]);

  // If on login page, render it directly without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, show loading
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </AdminAuthProvider>
  );
}

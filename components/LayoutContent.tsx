'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Get secret admin path from environment
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || 'x-admin-control';
  
  // Check if current route is under admin routes (old /admin or new secret path) or registration forms
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith(`/${adminPath}`);
  const isRegistrationForm = pathname?.startsWith('/register/');

  // If it's an admin route or registration form, render without Header and Footer
  if (isAdminRoute || isRegistrationForm) {
    return <>{children}</>;
  }

  // For non-admin routes, render with Header and Footer
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}

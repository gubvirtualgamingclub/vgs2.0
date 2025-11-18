import { AdminAuthProvider } from '@/lib/contexts/AdminAuthContext';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}

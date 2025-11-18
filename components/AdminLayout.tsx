'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/lib/contexts/AdminAuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get the secret admin path from environment variable
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || 'x-admin-control';

  const handleLogout = () => {
    logout();
    router.push(`/${adminPath}/auth`);
  };

  const navigation = [
    { name: 'Dashboard', href: `/${adminPath}`, icon: '📊' },
    { name: 'Updates', href: `/${adminPath}/updates`, icon: '📢' },
    { name: 'Activities', href: `/${adminPath}/activities`, icon: '🎮' },
    { name: 'Games', href: `/${adminPath}/games`, icon: '🎲' },
    { name: 'Tournaments', href: `/${adminPath}/tournaments`, icon: '🏆' },
    { name: 'Registration Forms', href: `/${adminPath}/registration-forms`, icon: '📋' },
    { name: 'Email Management', href: `/${adminPath}/emails`, icon: '📧' },
    { name: 'Committee', href: `/${adminPath}/committee`, icon: '👥' },
    { name: 'Sponsors', href: `/${adminPath}/sponsors`, icon: '💼' },
    { name: 'Settings', href: `/${adminPath}/settings`, icon: '⚙️' },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button & Logo */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu - Mobile Only */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-400 hover:text-white focus:outline-none focus:text-white"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {sidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              {/* Logo/Brand */}
              <Link href={`/${adminPath}`} className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">🛡️</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-white font-bold text-base sm:text-lg">VGS Secure Panel</h1>
                  <p className="text-gray-400 text-xs hidden md:block">Protected Access</p>
                </div>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors p-2"
                title="View Site"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-gray-800 border-r border-gray-700
            transform transition-transform duration-300 ease-in-out
            lg:transform-none lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            top-16 lg:top-0
            flex flex-col
            h-[calc(100vh-4rem)] lg:h-screen
          `}
        >
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800">
            <div className="text-xs text-gray-500 text-center">
              <p>VGS Admin Panel</p>
              <p className="mt-1">Version 2.0</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-900 w-full overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

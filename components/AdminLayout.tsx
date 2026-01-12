'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/lib/contexts/AdminAuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  PuzzlePieceIcon, 
  TrophyIcon, 
  ClipboardDocumentCheckIcon, 
  EnvelopeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || 'admin';

const navigation = [
  { name: 'Dashboard', href: `/${adminPath}`, icon: ChartBarIcon },
  { name: 'Activities', href: `/${adminPath}/activities`, icon: CalendarIcon },
  { name: 'Games', href: `/${adminPath}/games`, icon: PuzzlePieceIcon },
  { name: 'Tournaments', href: `/${adminPath}/tournaments`, icon: TrophyIcon },
  { name: 'Registration', href: `/${adminPath}/registration-forms`, icon: ClipboardDocumentCheckIcon },
  { name: 'Emails', href: `/${adminPath}/emails`, icon: EnvelopeIcon },
  { name: 'Committee', href: `/${adminPath}/committee`, icon: UserGroupIcon },
  { name: 'Sponsors', href: `/${adminPath}/sponsors`, icon: CurrencyDollarIcon },
  { name: 'Settings', href: `/${adminPath}/settings`, icon: Cog6ToothIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push(`/${adminPath}/auth`);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 font-sans text-white">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gray-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">VGS Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="flex relative items-start">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            lg:sticky lg:top-0 lg:h-screen
            w-72 bg-gray-900/95 backdrop-blur-xl border-r border-white/10
            transform transition-transform duration-300 ease-in-out
            lg:transform-none lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            flex flex-col
          `}
        >
          {/* Sidebar Header */}
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
               <span className="font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">VGS Admin</h1>
              <p className="text-xs text-gray-400 font-medium">Control Center</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              // Exact match for dashboard, startsWith for others to handle subpages
              const isActive = item.href === `/${adminPath}` 
                ? pathname === `/${adminPath}`
                : pathname?.startsWith(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                     <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all font-medium border border-red-500/20 group"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
            <p className="mt-4 text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">VGS System v2.0</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-h-screen overflow-x-hidden p-4 sm:p-6 lg:p-8">
           <div className="max-w-7xl mx-auto space-y-8">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

const navigation = [
  { 
    name: 'Home', 
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    name: 'Activities', 
    href: '/activities',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    submenu: [
      { name: 'Event', href: '/activities', icon: '📅' },
      { name: 'Games', href: '/games', icon: '🎮' }
    ]
  },
  { 
    name: 'Tournaments', 
    href: '/tournaments',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  },

  { 
    name: 'Committee', 
    href: '/committee',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },

];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileSubmenus, setExpandedMobileSubmenus] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  const toggleMobileSubmenu = (name: string) => {
    setExpandedMobileSubmenus(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsVisible(false);
        setMobileMenuOpen(false); // Close mobile menu when hiding
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Helper function to check if link is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50
      bg-white/90 dark:bg-gray-900/60 
      backdrop-blur-2xl backdrop-saturate-150
      border-b border-slate-200/80 dark:border-gray-700/20
      shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-lg dark:shadow-black/5
      transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-y-0' : '-translate-y-full'}
    `}>
      <nav className="mx-auto max-w-full px-1 sm:px-3 lg:px-6" aria-label="Top">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex-shrink-0 transform group-hover:scale-105 transition-transform duration-300">
                {/* Wide logo for desktop */}
                <Image
                  src="/logos/VGSwide.png"
                  alt="VGS Logo"
                  width={160}
                  height={40}
                  className="hidden md:block h-10 w-auto object-contain"
                  priority
                />
                {/* Compact logo for mobile */}
                <Image
                  src="/logos/vgs.png"
                  alt="VGS Logo"
                  width={40}
                  height={40}
                  className="md:hidden h-10 w-auto object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              
              if (hasSubmenu) {
                return (
                  <div key={item.name} className="relative group">
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        active
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                          : 'text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50 dark:text-gray-300 dark:hover:text-cyan-400 dark:hover:bg-cyan-900/20'
                      }`}
                    >
                      <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      {item.name}
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200 dark:border-gray-700">
                      {item.submenu.map((subitem) => {
                        const subActive = isActive(subitem.href);
                        return (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                              subActive
                                ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <span className="text-lg">{subitem.icon}</span>
                            {subitem.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/50 dark:text-gray-300 dark:hover:text-cyan-400 dark:hover:bg-cyan-900/20'
                  }`}
                >
                  <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle & Mobile menu button */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle - Desktop */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <div className="flex md:hidden">
              <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 dark:text-gray-300 dark:hover:text-cyan-400 dark:hover:bg-cyan-900/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                /* Close Icon */
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen
              ? 'max-h-screen opacity-100 pb-4'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="space-y-1 pt-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-2">
            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
            {navigation.map((item) => {
              const active = isActive(item.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMobileSubmenus.includes(item.name);
              
              if (hasSubmenu) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMobileSubmenu(item.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                          : 'text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 dark:text-gray-300 dark:hover:text-cyan-400 dark:hover:bg-cyan-900/20'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                      <svg className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {isExpanded && item.submenu && (
                      <div className="ml-4 space-y-1 mt-1">
                        {item.submenu.map((subitem) => {
                          const subActive = isActive(subitem.href);
                          return (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                subActive
                                  ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="text-lg">{subitem.icon}</span>
                              {subitem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 dark:text-gray-300 dark:hover:text-cyan-400 dark:hover:bg-cyan-900/20'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}

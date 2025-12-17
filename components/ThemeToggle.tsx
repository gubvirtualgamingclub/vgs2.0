'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative group flex items-center justify-center w-16 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full p-1 transition-all duration-500 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-300/50 dark:border-gray-600/50 shadow-lg"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md ${
        isDark ? 'bg-purple-500/20' : 'bg-yellow-400/30'
      }`} />

      {/* Sliding indicator */}
      <div
        className={`absolute w-6 h-6 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
          isDark 
            ? 'translate-x-4 bg-gradient-to-br from-purple-500 to-blue-600 shadow-purple-500/50' 
            : '-translate-x-4 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/50'
        }`}
      >
        {/* Inner glow */}
        <div className={`absolute inset-0.5 rounded-full ${
          isDark 
            ? 'bg-gradient-to-br from-purple-400/50 to-transparent' 
            : 'bg-gradient-to-br from-yellow-300/50 to-transparent'
        }`} />
      </div>

      {/* Sun icon */}
      <div className={`absolute left-1.5 transition-all duration-500 ${
        isDark ? 'opacity-50 scale-75' : 'opacity-100 scale-100'
      }`}>
        <svg 
          className={`w-4 h-4 transition-all duration-500 ${
            isDark ? 'text-gray-400' : 'text-white drop-shadow-lg'
          }`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>

      {/* Moon icon */}
      <div className={`absolute right-1.5 transition-all duration-500 ${
        isDark ? 'opacity-100 scale-100' : 'opacity-50 scale-75'
      }`}>
        <svg 
          className={`w-4 h-4 transition-all duration-500 ${
            isDark ? 'text-white drop-shadow-lg' : 'text-gray-500'
          }`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </button>
  );
}

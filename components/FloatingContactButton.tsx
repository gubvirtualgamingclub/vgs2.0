'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function FloatingContactButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Show button after a small delay on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Hide on contact page itself to avoid redundancy/clutter, or keep it? 
  // User said "whole website", but typically you don't need a "Contact Us" button ON the "Contact Us" page.
  // I will hide it on the contact page for better UX.
  if (pathname === '/contact-us') return null;

  return (
    <div className={`fixed bottom-8 right-8 z-50 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
      <Link 
        href="/contact-us"
        className="group relative flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.8)] transition-all duration-300 hover:scale-110"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse group-hover:bg-white/30" />
        
        {/* Icon */}
        <svg className="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>

        {/* Tooltip Label */}
        <div className="absolute right-full mr-4 px-4 py-2 bg-black/80 backdrop-blur text-white text-sm font-bold rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none transform translate-x-2 group-hover:translate-x-0">
          Get in Touch
        </div>
      </Link>
    </div>
  );
}

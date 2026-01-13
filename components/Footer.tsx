'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// External links data removed as we now display logos explicitly in the layout

const contactInfo = {
  email: 'vgs.green.edu.bd@gmail.com',
  phone: '+880 1234-567890',
  address: 'Green University of Bangladesh  Purbachal American City, Kanchan, Rupganj, Narayanganj-1461, Dhaka, Bangladesh',
};

const developerInfo = [
  {
    name: 'MD. SAZIB',
    role: 'Full Stack Developer',
    github: 'https://github.com/sudostealth',
    linkedin: 'https://linkedin.com/in/immdsazib',
    email: 'mdsazib.cse@gmail.com',
    photo: 'https://wkgqhjpfurumsfcbvkyq.supabase.co/storage/v1/object/public/Committee%20Members/Md_Sazib.png',
  },
];

export default function Footer() {
  const [showDeveloperPopup, setShowDeveloperPopup] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-slate-100 to-slate-200 dark:bg-[#050505] dark:from-transparent dark:to-transparent text-slate-800 dark:text-gray-200 pt-20 pb-6 selection:bg-cyan-500/30 border-t border-slate-200 dark:border-transparent" aria-labelledby="footer-heading">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-200/30 dark:bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-200/30 dark:bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column (Left - 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/40 transition-all duration-500" />
                <Image
                  src="/logos/vgs.png"
                  alt="VGS Logo"
                  width={48}
                  height={48}
                  className="relative w-full h-full object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 dark:from-white to-gray-500 dark:to-gray-400 group-hover:to-gray-900 dark:group-hover:to-white transition-all">
                  Virtual Gaming Society
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-mono tracking-widest uppercase">Est. 2024</p>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 max-w-xs leading-relaxed text-sm">
              The official esports hub of Green University. organizing competitive tournaments, fostering community, and celebrating gaming culture.
            </p>

            {/* ORGANIZERS & AFFILIATIONS LOGOS */}
            <div className="pt-6 border-t border-gray-200 dark:border-white/5">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Supported By</p>
                <div className="flex flex-wrap items-center gap-6">
                    {/* Green University */}
                    <a href="https://green.edu.bd" target="_blank" rel="noopener noreferrer" className="group block">
                        <div className="relative h-10 w-auto transition-transform duration-300 group-hover:scale-105">
                             <Image
                                src="/logos/GUB-New.png"
                                alt="Green University"
                                width={120}
                                height={40}
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </a>

                    {/* Dept of CSE */}
                    <a href="https://archive-cse.green.edu.bd/" target="_blank" rel="noopener noreferrer" className="group block">
                         <div className="relative h-12 w-auto transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/logos/DeptOfCSE.png"
                                alt="Department of CSE"
                                width={100}
                                height={45}
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </a>

                    {/* GUCC */}
                    <a href="#" className="group block">
                        <div className="relative h-14 w-auto transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/logos/GUCC-LOGO.png"
                                alt="Green University Computer Club"
                                width={180}
                                height={60}
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </a>
                </div>
            </div>
          </div>

          {/* Spacer (1 col) */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Affiliations (Center - 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-cyan-500 rounded-full" />
              <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
                <li><a href="https://green.edu.bd" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2"><svg className="w-4 h-4 text-cyan-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>Green University</a></li>
                <li><a href="https://archive-cse.green.edu.bd/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2"><svg className="w-4 h-4 text-cyan-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>Department of CSE</a></li>
                <li><Link href="/contributors" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2"><svg className="w-4 h-4 text-purple-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>Contributors</Link></li>
            </ul>
          </div>

          {/* Contact (Right - 5 cols) */}
          <div className="lg:col-span-5">
             <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full" />
              Get in Touch
            </h4>
            <div className="grid grid-cols-1 gap-4">
                {/* Email */}
                <a href={`mailto:${contactInfo.email}`} className="group flex items-start gap-4 p-4 rounded-xl bg-purple-50 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-white/10 transition-colors border border-purple-200 dark:border-white/5 hover:border-purple-400 dark:hover:border-purple-500/30">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                         <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Email Us</span>
                         <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-white transition-colors break-all">{contactInfo.email}</span>
                    </div>
                </a>
                
                {/* Phone */}
                <a href={`tel:${contactInfo.phone}`} className="group flex items-start gap-4 p-4 rounded-xl bg-cyan-50 dark:bg-white/5 hover:bg-cyan-100 dark:hover:bg-white/10 transition-colors border border-cyan-200 dark:border-white/5 hover:border-cyan-400 dark:hover:border-cyan-500/30">
                     <div className="w-10 h-10 rounded-lg bg-cyan-500/20 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                     </div>
                    <div>
                         <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Call Us</span>
                         <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-cyan-700 dark:group-hover:text-white transition-colors">{contactInfo.phone}</span>
                    </div>
                </a>

                {/* Address */}
                <div className="group flex items-start gap-4 p-4 rounded-xl bg-orange-50 dark:bg-white/5 hover:bg-orange-100 dark:hover:bg-white/10 transition-colors border border-orange-200 dark:border-white/5 hover:border-orange-400 dark:hover:border-orange-500/30">
                     <div className="w-10 h-10 rounded-lg bg-orange-500/20 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                     </div>
                    <div>
                         <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Visit Us</span>
                         <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-700 dark:group-hover:text-white transition-colors leading-relaxed">{contactInfo.address}</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex items-center gap-6">
                 <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Follow Us</h5>
                 <div className="h-px bg-gray-300 dark:bg-white/10 flex-1"></div>
                 <div className="flex gap-4">
                    {[
                        { icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />, name: 'Facebook', color: 'hover:bg-[#1877F2]' },
                        { icon: <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />, name: 'Twitter', color: 'hover:bg-[#1DA1F2]' },
                        { icon: <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />, circle: <circle cx="4" cy="4" r="2" />, name: 'LinkedIn', color: 'hover:bg-[#0A66C2]' },
                        { icon: <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.33zM9.75 15.02l5.75-3.27-5.75-3.27z" />, name: 'YouTube', color: 'hover:bg-[#FF0000]' },
                    ].map((social, i) => (
                        <a 
                        key={i}
                        href="#"
                        className={`w-8 h-8 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-300 hover:scale-110 hover:text-white ${social.color}`}
                        title={social.name}
                        >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            {social.icon}
                            {social.circle}
                        </svg>
                        </a>
                    ))}
                 </div>
            </div>
          </div>
        </div>

        {/* Developer Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-3 text-xs md:text-sm font-mono text-gray-500 mb-6">
                 <span className="w-8 h-px bg-gradient-to-r from-transparent to-gray-400 dark:to-gray-500" />
                 <span>Crafted with 💜 by</span>
                 <span className="w-8 h-px bg-gradient-to-l from-transparent to-gray-400 dark:to-gray-500" />
            </div>

            <div className="flex flex-wrap justify-center gap-8 mb-8">
                 {developerInfo.map((dev, index) => (
                     <div 
                        key={index} 
                        className="relative group"
                        onMouseEnter={() => setShowDeveloperPopup(index)}
                        onMouseLeave={() => setShowDeveloperPopup(null)}
                     >
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500/50 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-cyan-400 transition-colors">
                                     <Image src={dev.photo} alt={dev.name} width={40} height={40} className="object-cover w-full h-full" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{dev.name}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{dev.role.split(' ')[0]}</span>
                            </div>
                        </div>

                        <div
                            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 transition-all duration-300 z-50 ${
                            showDeveloperPopup === index
                                ? 'opacity-100 visible translate-y-0 scale-100'
                                : 'opacity-0 invisible translate-y-2 scale-95 pointer-events-none'
                            }`}
                        >
                            <div className="bg-white dark:bg-[#0a0a0b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 pointer-events-none" />
                                <div className="relative z-10 text-center">
                                    <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-r from-purple-500 to-cyan-500 mb-3 is-glow">
                                        <Image src={dev.photo} alt={dev.name} width={80} height={80} className="rounded-full w-full h-full object-cover border-2 border-white dark:border-[#0a0a0b]" />
                                    </div>
                                    <h4 className="text-gray-900 dark:text-white font-bold text-lg">{dev.name}</h4>
                                    <p className="text-cyan-600 dark:text-cyan-400 text-xs font-mono mb-4">{dev.role}</p>
                                    
                                     <div className="flex justify-center gap-3">
                                         {dev.github && (
                                            <a href={dev.github} target="_blank" className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white text-gray-500 dark:text-gray-400 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg></a>
                                         )}
                                          {dev.linkedin && (
                                            <a href={dev.linkedin} target="_blank" className="p-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                                         )}
                                     </div>
                                </div>
                            </div>
                        </div>
                     </div>
                 ))}
            </div>

            <p className="text-gray-500 text-xs">
                 © {currentYear} Virtual Gaming Society. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}

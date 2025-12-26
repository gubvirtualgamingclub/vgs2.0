'use client';

import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamic imports for animations
const ScrollAnimation = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.ScrollAnimation),
  { ssr: false }
);
const ScrollProgressBar = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.ScrollProgressBar),
  { ssr: false }
);
const GamingCursor = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.GamingCursor),
  { ssr: false }
);
const FloatingIcons = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.FloatingIcons),
  { ssr: false }
);

interface Contributor {
  name: string;
  studentId: string;
  role: string;
  period: string;
  avatar: string;
  contributions: string[];
  technologies: string[];
  social: {
    facebook?: string;
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

const contributors: Contributor[] = [
  {
    name: "Faysal Hossain Tomal",
    studentId: "221902005",
    role: "Founding Developer & Project Initiator",
    period: "Project Inception - Phase 1",
    avatar: "/members/faysal-hossain-tomal.png",
    contributions: [
      "Envisioned and initiated the GUCC Virtual Gaming Society website project",
      "Established the foundational architecture and structure for the web platform",
      "Developed the initial website using HTML, CSS, and JavaScript",
      "Created core pages and implemented the primary navigation system",
      "Designed the original user interface and user experience flow",
      "Provided comprehensive project documentation and handover materials",
      "Mentored the succeeding developer to ensure seamless project transition"
    ],
    technologies: ["HTML5", "CSS3", "JavaScript", "Web Design", "UI/UX"],
    social: {
      facebook: "https://facebook.com/faysaltomal",
      linkedin: "https://linkedin.com/in/faysaltomal",
      email: "tomal221902005@gmail.com"
    }
  },
  {
    name: "MD. SAZIB",
    studentId: "231902005",
    role: "Lead Developer & Technical Architect",
    period: "Phase 2 - Current",
    avatar: "/members/md-sazib.png",
    contributions: [
      "Transformed the initial concept into a fully functional, modern web application",
      "Engineered comprehensive features with advanced animations and interactions",
      "Implemented dynamic data management using JSON-based architecture",
      "Recognized limitations and strategically migrated to Next.js framework",
      "Architected and developed complete admin panel with authentication",
      "Integrated Supabase backend for scalable database management",
      "Implemented advanced features: multi-category selection, dynamic content management",
      "Created responsive, mobile-first design with professional gaming aesthetics",
      "Developed partnership management system with Google Drive integration",
      "Established maintainable codebase with TypeScript and modern best practices"
    ],
    technologies: [
      "Next.js 14",
      "React",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
      "JavaScript",
      "JSON"
    ],
    social: {
      facebook: "https://facebook.com/mdsazib",
      linkedin: "https://linkedin.com/in/mdsazib",
      github: "https://github.com/mdsazib",
      email: "sazib231902005@gmail.com"
    }
  }
];

export default function ContributorsPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <ScrollAnimation animation="slideUp" delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Hall of Fame</span>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="gameOver" delay={200}>
            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
              <span className="block bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Architects
              </span>
              <span className="block text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 animate-gradient-x bg-[length:200%_auto] mt-2">
                of the Digital Realm
              </span>
            </h1>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeIn" delay={400}>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed border-l-2 border-purple-500/50 pl-6 text-left md:text-center md:border-l-0 md:pl-0">
               From the first line of code to the final pixel, these visionaries built the foundation of our virtual society. 
               This is a tribute to the builders who made VGS possible.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Contributors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="space-y-32">
          {contributors.map((contributor, index) => (
            <ScrollAnimation key={contributor.studentId} animation={index % 2 === 0 ? "slideRight" : "slideLeft"} delay={100}>
              <div
                className={`group relative ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glow Behind Card */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r ${index % 2 === 0 ? 'from-purple-600/20 to-blue-600/20' : 'from-cyan-600/20 to-green-600/20'} blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none`} />

                <div className="relative bg-[#0a0a0b]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500 shadow-2xl">
                  <div className="flex flex-col lg:flex-row">
                    
                    {/* Profile Panel */}
                    <div className="lg:w-2/5 p-8 md:p-12 bg-gradient-to-br from-white/5 to-transparent border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                       
                       <div className="relative z-10 text-center lg:text-left h-full flex flex-col items-center lg:items-start">
                          {/* Avatar */}
                          <div className="relative w-48 h-48 mb-8 group-hover:scale-105 transition-transform duration-500">
                             <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${index % 2 === 0 ? 'from-purple-500 to-blue-500' : 'from-cyan-500 to-green-500'} blur-xl opacity-50 animate-pulse`} />
                             <div className={`relative w-full h-full rounded-full p-1 bg-gradient-to-br ${index % 2 === 0 ? 'from-purple-500 to-blue-500' : 'from-cyan-500 to-green-500'}`}>
                                <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0b] relative">
                                  <Image
                                    src={contributor.avatar}
                                    alt={contributor.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                             </div>
                          </div>

                          <div className="flex-1">
                              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                                {contributor.name}
                              </h2>
                              <div className={`inline-block px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider mb-4 ${index % 2 === 0 ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                {contributor.role}
                              </div>
                              <p className="text-gray-300 font-mono text-sm mb-6 flex items-center gap-2 justify-center lg:justify-start">
                                <span className="w-2 h-2 bg-gray-600 rounded-full" />
                                ID: {contributor.studentId}
                              </p>
                              
                              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                                  {contributor.social.github && (
                                     <a href={contributor.social.github} target="_blank" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:scale-110 transition-all text-white border border-white/5">
                                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                     </a>
                                  )}
                                  {contributor.social.linkedin && (
                                     <a href={contributor.social.linkedin} target="_blank" className="p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 hover:scale-110 transition-all text-blue-400 border border-blue-500/20">
                                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                     </a>
                                  )}
                                  {contributor.social.email && (
                                     <a href={`mailto:${contributor.social.email}`} className="p-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 hover:scale-110 transition-all text-purple-400 border border-purple-500/20">
                                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                     </a>
                                  )}
                              </div>
                          </div>
                       </div>
                    </div>

                    {/* Content Panel */}
                    <div className="lg:w-3/5 p-8 md:p-12">
                       {/* Period Badge */}
                       <div className="mb-8">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Core Phase</span>
                         <span className="text-white font-medium bg-white/5 px-4 py-2 rounded-lg border border-white/5 inline-block">
                             {contributor.period}
                         </span>
                       </div>

                       {/* Contribution List */}
                       <div className="mb-10">
                          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                              <span className={`w-1.5 h-6 rounded-full ${index % 2 === 0 ? 'bg-purple-500' : 'bg-cyan-500'}`} />
                              Key Achievements
                          </h3>
                          <ul className="space-y-4">
                             {contributor.contributions.map((item, i) => (
                                 <li key={i} className="flex items-start gap-4 text-gray-300 group/item hover:text-gray-100 transition-colors">
                                     <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${index % 2 === 0 ? 'bg-purple-500 group-hover/item:shadow-[0_0_10px_#a855f7]' : 'bg-cyan-500 group-hover/item:shadow-[0_0_10px_#06b6d4]'} transition-all`} />
                                     <span className="text-sm leading-relaxed">{item}</span>
                                 </li>
                             ))}
                          </ul>
                       </div>

                       {/* Tech Stack */}
                       <div>
                          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                              <span className={`w-1.5 h-6 rounded-full ${index % 2 === 0 ? 'bg-blue-500' : 'bg-green-500'}`} />
                              Tech Arsenal
                          </h3>
                          <div className="flex flex-wrap gap-2">
                             {contributor.technologies.map((tech, i) => (
                                 <span 
                                    key={i} 
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border transition-all hover:scale-105 cursor-default ${
                                        index % 2 === 0 
                                        ? 'bg-purple-500/5 text-purple-300 border-purple-500/20 hover:border-purple-500/50' 
                                        : 'bg-cyan-500/5 text-cyan-300 border-cyan-500/20 hover:border-cyan-500/50'
                                    }`}
                                 >
                                     {tech}
                                 </span>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <ScrollAnimation animation="slideUp">
                  <h2 className="text-3xl md:text-5xl font-black text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
                      Project Evolution
                  </h2>
              </ScrollAnimation>

              <div className="relative">
                  {/* Central Line */}
                  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />

                  <div className="space-y-16">
                      {[
                          { title: "Inception", phase: "Early 2024", desc: "Foundation laid with standard web technologies. The vision takes shape.", color: "text-purple-400" },
                          { title: "Transformation", phase: "Mid 2024", desc: "Restructuring into a dynamic web app with advanced features.", color: "text-blue-400" },
                          { title: "Production", phase: "Late 2024", desc: "Full migration to Next.js ecosystem for scale and performance.", color: "text-cyan-400" },
                      ].map((item, i) => (
                          <ScrollAnimation key={i} animation="fadeIn" delay={i * 200}>
                            <div className={`relative flex items-center ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                {/* Dot */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0a0a0b] border-2 border-purple-500 rounded-full z-10 shadow-[0_0_10px_#a855f7]" />
                                
                                {/* Card */}
                                <div className={`ml-12 md:ml-0 md:w-5/12 ${i % 2 !== 0 && 'md:ml-auto'} ${i % 2 === 0 && 'md:mr-auto'} p-6 rounded-2xl bg-[#0f0f10] border border-white/5 hover:border-white/10 transition-all`}>
                                    <div className={`text-xs font-bold mb-2 uppercase tracking-widest ${item.color}`}>{item.phase}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                          </ScrollAnimation>
                      ))}
                  </div>
              </div>
          </div>
      </section>

      {/* Tribute Footer */}
      <section className="py-20 text-center relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-transparent dark:to-transparent">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-64 bg-gradient-to-r from-purple-300/30 to-cyan-300/30 dark:from-purple-500/10 dark:to-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
              <ScrollAnimation animation="fadeIn">
                <div className="inline-block p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-100 dark:shadow-none">
                   <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                       This platform is a testament to the dedication of <span className="text-purple-600 dark:text-white font-bold">Faysal Hossain Tomal</span> and <span className="text-purple-600 dark:text-white font-bold">MD. SAZIB</span>. 
                       Their combined efforts built the digital home of VGS.
                   </p>
                </div>
              </ScrollAnimation>
          </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';

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
    avatar: "/members/faysal-hossain-tomal.png", // Add actual image path
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
      facebook: "https://facebook.com/faysaltomal", // Replace with actual
      linkedin: "https://linkedin.com/in/faysaltomal", // Replace with actual
      email: "tomal221902005@gmail.com" // Replace with actual
    }
  },
  {
    name: "MD. SAZIB",
    studentId: "231902005",
    role: "Lead Developer & Technical Architect",
    period: "Phase 2 - Current",
    avatar: "/members/md-sazib.png", // Add actual image path
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
      facebook: "https://facebook.com/mdsazib", // Replace with actual
      linkedin: "https://linkedin.com/in/mdsazib", // Replace with actual
      github: "https://github.com/mdsazib", // Replace with actual
      email: "sazib231902005@gmail.com" // Replace with actual
    }
  }
];

export default function ContributorsPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-600/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-500/30 mb-6">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-sm font-semibold text-purple-300">Founding Architects</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent">
              Built & Architected By
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The GUCC Virtual Gaming Society website was conceptualized, developed, and brought to life by these 
              two visionary developers. From initial concept to production-ready platform, they are the founding 
              architects responsible for every aspect of this digital experience.
            </p>
          </div>
        </div>
      </div>

      {/* Contributors Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {contributors.map((contributor, index) => (
            <div
              key={contributor.studentId}
              className={`relative ${index % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-transparent backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-500 shadow-2xl">
                <div className="lg:grid lg:grid-cols-5 gap-8">
                  {/* Profile Section */}
                  <div className="lg:col-span-2 p-6 sm:p-8 bg-gradient-to-br from-cyan-900/30 via-cyan-800/20 to-transparent border-b lg:border-b-0 lg:border-r border-gray-700/50">
                    <div className="text-center">
                      {/* Avatar */}
                      <div className="relative w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full blur-xl opacity-50 animate-pulse" />
                        <div className="relative w-full h-full bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full p-1">
                          <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center overflow-hidden relative">
                            <Image
                              src={contributor.avatar}
                              alt={contributor.name}
                              fill
                              className="object-cover rounded-full"
                              sizes="(max-width: 768px) 192px, 192px"
                              priority
                              unoptimized
                            />
                          </div>
                        </div>
                      </div>

                      {/* Name & Role */}
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                        <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                          {contributor.name}
                        </span>
                      </h2>
                      <p className="text-sm sm:text-base text-purple-400 font-semibold mb-1">
                        {contributor.role}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm mb-4">
                        Student ID: {contributor.studentId}
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-blue-300">{contributor.period}</span>
                      </div>

                      {/* Social Links */}
                      <div className="mt-6 flex items-center justify-center gap-3">
                        {contributor.social.email && (
                          <a
                            href={`mailto:${contributor.social.email}`}
                            className="w-10 h-10 bg-gray-700/50 hover:bg-purple-600/50 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            title="Email"
                          >
                            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </a>
                        )}
                        {contributor.social.linkedin && (
                          <a
                            href={contributor.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-700/50 hover:bg-blue-600/50 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            title="LinkedIn"
                          >
                            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                        {contributor.social.facebook && (
                          <a
                            href={contributor.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-700/50 hover:bg-blue-500/50 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            title="Facebook"
                          >
                            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        {contributor.social.github && (
                          <a
                            href={contributor.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            title="GitHub"
                          >
                            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contributions Section */}
                  <div className="lg:col-span-3 p-6 sm:p-8">
                    <div className="space-y-6">
                      {/* Contributions */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Key Contributions
                        </h3>
                        <ul className="space-y-3">
                          {contributor.contributions.map((contribution, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors group"
                            >
                              <div className="mt-1 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0 group-hover:scale-150 transition-transform" />
                              <span className="text-sm leading-relaxed">{contribution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Technologies & Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {contributor.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-cyan-500/20 border border-cyan-500/30 rounded-full text-sm text-cyan-300 hover:border-cyan-400 hover:scale-105 transition-all cursor-default"
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
            </div>
          ))}
        </div>
      </div>

      {/* Project Evolution Timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-gradient-to-br from-gray-800/50 via-purple-900/20 to-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 sm:p-8 md:p-12 relative z-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
            Project Evolution Timeline
          </h2>
          
          <div className="relative z-30">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-500 via-cyan-400 to-cyan-500 hidden md:block" />
            
            <div className="space-y-8 sm:space-y-12">
              {/* Phase 1 */}
              <div className="relative flex items-start justify-start md:justify-end md:w-1/2 pl-8 md:pl-0">
                <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-4 sm:p-6 w-full md:mr-8 relative z-10">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
                    <div className="w-7 sm:w-10 h-7 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0 mt-1">1</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white pt-1.5 sm:pt-0">Project Inception</h3>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mb-2">
                    <strong className="text-purple-300 font-bold">Faysal Hossain Tomal</strong> initiated the GUCC Virtual Gaming Society website, building the foundation with HTML, CSS, and JavaScript.
                  </p>
                  <div className="text-xs text-purple-300">Foundation Phase</div>
                </div>
                <div className="absolute left-3 md:left-1/2 top-2 md:top-0 md:transform md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-cyan-500 rounded-full border-2 sm:border-4 border-gray-900 z-20" />
              </div>

              {/* Phase 2 */}
              <div className="relative flex items-start justify-start md:justify-start md:w-1/2 md:ml-auto pl-8 md:pl-0">
                <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-4 sm:p-6 w-full md:ml-8 relative z-10">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
                    <div className="w-7 sm:w-10 h-7 sm:h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0 mt-1">2</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white pt-1.5 sm:pt-0">Enhancement & Modernization</h3>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mb-2">
                    <strong className="text-blue-300 font-bold">MD. SAZIB</strong> transformed the project into a fully functional modern website with animations, advanced features, and JSON-based architecture.
                  </p>
                  <div className="text-xs text-blue-300">Evolution Phase</div>
                </div>
                <div className="absolute left-3 md:left-1/2 top-2 md:top-0 md:transform md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-cyan-600 rounded-full border-2 sm:border-4 border-gray-900 z-20" />
              </div>

              {/* Phase 3 */}
              <div className="relative flex items-start justify-start md:justify-end md:w-1/2 pl-8 md:pl-0">
                <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-4 sm:p-6 w-full md:mr-8 relative z-10">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
                    <div className="w-7 sm:w-10 h-7 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0 mt-1">3</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white pt-1.5 sm:pt-0">Next.js Transformation</h3>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mb-2">
                    <strong className="text-pink-300 font-bold">MD. SAZIB</strong> recognized scalability needs and architected a complete rebuild using Next.js 14, TypeScript, Supabase, and modern best practices with a comprehensive admin panel.
                  </p>
                  <div className="text-xs text-pink-300">Current Phase - Production Ready</div>
                </div>
                <div className="absolute left-3 md:left-1/2 top-2 md:top-0 md:transform md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-cyan-500 rounded-full border-2 sm:border-4 border-gray-900 z-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Closing Message */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-gradient-to-br from-cyan-600/10 via-cyan-500/10 to-cyan-600/10 backdrop-blur-sm rounded-3xl border border-cyan-500/20 p-6 sm:p-8">
          <svg className="w-12 sm:w-16 h-12 sm:h-16 text-cyan-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-4">
            The Founding Creators of GUCC Virtual Gaming Society Platform
          </h3>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            This website exists because of the vision, dedication, and technical excellence of these two founding developers. 
            <span className="text-cyan-300 font-semibold"> Faysal Hossain Tomal</span> initiated the journey, and <span className="text-cyan-300 font-semibold">MD. SAZIB</span> transformed it into the comprehensive platform 
            you see today. Together, they built the foundation that powers the GUCC Virtual Gaming Society's digital presence. 
            While the platform may evolve with future enhancements, they remain the original architects and creators.
          </p>
        </div>
      </div>
    </div>
  );
}

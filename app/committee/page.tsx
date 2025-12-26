'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getPublishedCommitteesWithMembers } from '@/lib/supabase-queries';
import type { Committee, CommitteeMember } from '@/lib/types/database';
import { useRouter, useSearchParams } from 'next/navigation';

// Dynamic imports for performance
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

type CommitteeWithMembers = Committee & { members: CommitteeMember[] };

export default function CommitteePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [committees, setCommittees] = useState<CommitteeWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');

  const fetchCommittees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPublishedCommitteesWithMembers();
      setCommittees(data);
      
      const yearFromUrl = searchParams.get('year');
      
      if (data.length > 0) {
        if (yearFromUrl && data.some(c => c.year_range === yearFromUrl)) {
          setSelectedYear(yearFromUrl);
        } else if (!selectedYear) {
          setSelectedYear(data[0].year_range);
        }
      }
    } catch (error) {
      console.error('Error fetching committees:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, selectedYear]);

  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  const currentCommittee = committees.find((c) => c.year_range === selectedYear);

  const facultyMembers = (currentCommittee?.members
    .filter(m => m.category === 'Faculty Advisors')
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || []);
  
  const executiveMembers = (currentCommittee?.members
    .filter(m => 
      m.category === 'Student Executives' || 
      (m.category as string) === 'Executive Committee' || 
      (m.category as string) === 'Student Members'
    )
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || []);

  const handleMemberClick = (memberId: string) => {
    router.push(`/committee/${memberId}?year=${selectedYear}`);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    window.history.pushState({}, '', `/committee?year=${year}`);
  };

  const renderFacultyCard = (member: CommitteeMember) => (
    <div
      key={member.id}
      onClick={() => handleMemberClick(member.id)}
      className="group relative cursor-pointer"
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-white dark:bg-[#0b0f19] rounded-3xl border border-gray-200 dark:border-white/10 transition-all duration-500 group-hover:border-cyan-500/30 group-hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] group-hover:-translate-y-2 overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-50 to-transparent dark:from-cyan-500/5 dark:to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent dark:from-blue-600/5 dark:to-transparent opacity-50"></div>
        
        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 bg-white/40 dark:bg-transparent backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
       
      {/* Content */}
      <div className="relative p-8 flex flex-col items-center z-10">
        {/* Avatar Container */}
        <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
          {/* Animated Glow Ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
          
          {/* Image Wrapper */}
          <div className="relative w-44 h-44 rounded-full p-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden">
            {member.photo ? (
              <img 
                src={member.photo} 
                alt={member.name} 
                className="w-full h-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-50 dark:bg-[#111] flex items-center justify-center text-4xl font-bold text-gray-300 dark:text-white/20">
                {member.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Verification Badge (Optional fun detail) */}
          <div className="absolute bottom-2 right-2 bg-white dark:bg-[#0b0f19] text-cyan-500 p-1.5 rounded-full border border-gray-100 dark:border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3 mb-8">
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
             {member.name}
           </h3>
           <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-bold tracking-wider uppercase">
             {member.designation}
           </div>
        </div>

        {/* Social Actions */}
        <div className="flex items-center gap-3 pt-6 border-t border-gray-100 dark:border-white/5 w-full justify-center">
           {member.facebook && <SocialIcon href={member.facebook} type="facebook" />}
           {member.linkedin && <SocialIcon href={member.linkedin} type="linkedin" />}
           {member.github && <SocialIcon href={member.github} type="github" />}
           {member.email && <SocialIcon href={`mailto:${member.email}`} type="email" />}
        </div>
      </div>
    </div>
  );

  const getRoleIcon = (designation: string) => {
    const d = designation.toLowerCase();
    if (d.includes('president') || d.includes('vp')) {
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ); // Keep verifed badge for top leadership or switch to Crown if preferred. Sticking to verify for "Official" feel as per request "Icon based on role" but maybe different shapes.
         // Let's actually use distinct icons.
    }
    
    if (d.includes('president')) return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>; // Star/Crown-ish
    if (d.includes('secretary')) return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>; // Clipboard
    if (d.includes('treasurer') || d.includes('finance')) return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if (d.includes('technical') || d.includes('developer') || d.includes('web')) return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
    if (d.includes('design') || d.includes('creative') || d.includes('media')) return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
    if (d.includes('event') || d.includes('organizer')) return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    if (d.includes('content') || d.includes('writer')) return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
    
    // Default / Executive
    return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  };

  const renderExecutiveCard = (member: CommitteeMember) => (
    <div
      key={member.id}
      onClick={() => handleMemberClick(member.id)}
      className="group relative h-52 w-full cursor-pointer"
    >
       {/* Card Container */}
       <div className="absolute inset-0 bg-white dark:bg-[#0b0f19] rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg transition-all duration-500 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group-hover:-translate-y-1 overflow-hidden flex flex-row">
          
          {/* Inner Glow/Highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>

          {/* Details */}
          <div className="flex-1 p-6 flex flex-col justify-center relative z-10">
             <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded bg-green-500/10 border border-green-500/30 text-green-500 dark:text-green-400">
                   {getRoleIcon(member.designation)}
                </span>
                <span className="text-xs font-mono text-green-500 dark:text-green-400/80 tracking-wider uppercase">Executive</span>
             </div>
             
             <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {member.name}
             </h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{member.designation}</p>

             {/* Hover Socials */}
             <div className="mt-4 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {member.linkedin && <SocialIconSmall href={member.linkedin} type="linkedin" />}
                {member.github && <SocialIconSmall href={member.github} type="github" />}
                {member.email && <SocialIconSmall href={`mailto:${member.email}`} type="email" />}
             </div>
          </div>

          {/* Floating Portrait Image - clean transparent cutout, no shapes */}
          <div className="w-36 md:w-44 relative h-full shrink-0 flex items-center justify-center">
             {/* Soft shadow underneath for floating effect */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/15 dark:bg-black/30 blur-xl rounded-full transition-all duration-500 group-hover:w-24 group-hover:blur-2xl group-hover:bg-cyan-500/20"></div>
             
             {/* Image - no container, no border, just the transparent PNG */}
             {member.photo ? (
                <img 
                   src={member.photo} 
                   alt={member.name} 
                   className="relative z-10 h-full w-auto max-w-full object-contain object-bottom drop-shadow-2xl transition-all duration-500 ease-out origin-bottom group-hover:scale-110 group-hover:drop-shadow-[0_25px_35px_rgba(0,0,0,0.3)] dark:group-hover:drop-shadow-[0_25px_35px_rgba(6,182,212,0.2)]"
                />
             ) : (
                <div className="relative z-10 h-32 w-32 flex items-center justify-center text-5xl font-bold text-cyan-500/50 dark:text-cyan-400/30 drop-shadow-lg transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-110">
                   {member.name.charAt(0)}
                </div>
             )}
          </div>
       </div>
    </div>
  );

  const SocialIcon = ({ href, type }: { href: string; type: string }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={(e) => e.stopPropagation()} 
      className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-cyan-600 dark:hover:text-white hover:bg-cyan-50 dark:hover:bg-cyan-500/20 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg dark:hover:shadow-cyan-500/10 group/icon"
    >
       <span className="sr-only">{type}</span>
       <IconPath type={type} className="w-5 h-5 transition-transform group-hover/icon:-rotate-12" />
    </a>
  );

  const SocialIconSmall = ({ href, type }: { href: string; type: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-purple-400 transition-colors">
       <IconPath type={type} className="w-4 h-4" />
    </a>
  );

  const IconPath = ({ type, className }: { type: string; className: string }) => {
     if (type === 'facebook') return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
     if (type === 'linkedin') return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>;
     if (type === 'github') return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>;
     if (type === 'email') return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
     return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-gray-300 font-mono text-sm animate-pulse">Initializing VGS Database...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 selection:bg-purple-500/30 font-sans">
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 border-b border-gray-200 dark:border-white/5 bg-gradient-to-b from-slate-50 to-white dark:from-[#050505] dark:to-[#050505] overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_50%)]"></div>
         
         <div className="max-w-7xl mx-auto relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 animate-gradient-x bg-[length:200%_auto]">Executive</span>
               <span className="text-gray-900 dark:text-white"> Makers</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
               The visionaries, strategists, and leaders powering the Virtual Gaming Society's legacy.
            </p>
         </div>
      </section>

      {/* Year Filter */}
      {committees.length > 0 && (
         <div className="sticky top-20 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 py-4">
            <div className="max-w-7xl mx-auto px-6 overflow-x-auto custom-scrollbar">
               <div className="flex justify-center gap-2 min-w-max">
                  {committees.map((committee) => (
                     <button
                        key={committee.year_range}
                        onClick={() => handleYearChange(committee.year_range)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                           selectedYear === committee.year_range
                           ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg shadow-gray-900/10 dark:shadow-white/10 scale-105'
                           : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                        }`}
                     >
                        {committee.year_range}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">
         
         {/* Faculty Advisors */}
         {facultyMembers.length > 0 && (
            <section className="animate-fadeInUp">
               <div className="flex items-end gap-4 mb-12 border-b border-gray-200 dark:border-white/5 pb-4">
                  <svg className="w-6 h-6 text-cyan-500 dark:text-cyan-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Advisors</h2>
                  <span className="text-cyan-600 dark:text-cyan-500 font-mono text-sm mb-1.5 opacity-70">{'/// MENTORS'}</span>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                  {facultyMembers.map(renderFacultyCard)}
               </div>
            </section>
         )}

         {/* Executive Members */}
         {executiveMembers.length > 0 && (
            <section className="animate-fadeInUp delay-100">
               <div className="flex items-end gap-4 mb-12 border-b border-gray-200 dark:border-white/5 pb-4">
                  <svg className="w-6 h-6 text-purple-500 dark:text-purple-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Student Leadership</h2>
                  <span className="text-purple-600 dark:text-purple-500 font-mono text-sm mb-1.5 opacity-70">{'/// CORE_TEAM'}</span>
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  {executiveMembers.map(renderExecutiveCard)}
               </div>
            </section>
         )}

         {/* Empty State */}
         {!loading && !currentCommittee?.members.length && (
            <div className="text-center py-20 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-transparent">
               <p className="text-gray-500 dark:text-gray-400 text-lg">No committee members found for {selectedYear}</p>
            </div>
         )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
      `}</style>
    </div>
  );
}

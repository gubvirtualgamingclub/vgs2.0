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
       {/* Card Background with Glassmorphism */}
       <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-blue-900/10 backdrop-blur-xl rounded-2xl border border-white/5 transition-all duration-500 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group-hover:-translate-y-2"></div>
       
       {/* Content */}
       <div className="relative p-8 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
             {member.photo ? (
                <img src={member.photo} alt={member.name} className="relative w-40 h-40 rounded-full object-cover border-2 border-white/10 group-hover:border-cyan-400/50 transition-colors shadow-2xl" />
             ) : (
                <div className="relative w-40 h-40 rounded-full bg-white/5 flex items-center justify-center text-3xl font-bold text-cyan-400 border-2 border-white/10">
                   {member.name.charAt(0)}
                </div>
             )}
          </div>

          <h3 className="text-2xl font-bold text-white mb-2 text-center group-hover:text-cyan-400 transition-colors">{member.name}</h3>
          <p className="text-blue-200/80 text-sm font-medium tracking-wide text-center uppercase mb-6">{member.designation}</p>

          <div className="w-full pt-6 border-t border-white/5 flex gap-4 justify-center">
             {/* Socials logic remains same but styled */}
             {member.facebook && <SocialIcon href={member.facebook} type="facebook" />}
             {member.linkedin && <SocialIcon href={member.linkedin} type="linkedin" />}
             {member.github && <SocialIcon href={member.github} type="github" />}
             {member.email && <SocialIcon href={`mailto:${member.email}`} type="email" />}
          </div>
       </div>
    </div>
  );

  const renderExecutiveCard = (member: CommitteeMember) => (
    <div
      key={member.id}
      onClick={() => handleMemberClick(member.id)}
      className="group relative h-48 w-full cursor-pointer perspective-1000"
    >
       {/* Card Container */}
       <div className="absolute inset-0 bg-[#0b0f19] rounded-2xl border border-white/10 shadow-lg transition-all duration-500 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] group-hover:-translate-y-1 overflow-hidden flex flex-row">
          
          {/* Inner Glow/Highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          {/* Left Side: Details */}
          <div className="flex-1 p-6 flex flex-col justify-center relative z-10">
             <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-green-500/10 border border-green-500/30 text-green-400">
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                   </svg>
                </span>
                <span className="text-xs font-mono text-green-400/80 tracking-wider uppercase">Executive</span>
             </div>
             
             <h3 className="text-xl md:text-2xl font-bold text-white leading-tight mb-2 group-hover:text-cyan-400 transition-colors">
                {member.name}
             </h3>
             <p className="text-gray-400 text-sm font-medium">{member.designation}</p>

             {/* Hover Socials - Slide Up from Bottom Center */}
             <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-start translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                <div className="flex gap-2 bg-[#0b0f19]/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                   {member.linkedin && <SocialIconSmall href={member.linkedin} type="linkedin" />}
                   {member.github && <SocialIconSmall href={member.github} type="github" />}
                   {member.email && <SocialIconSmall href={`mailto:${member.email}`} type="email" />}
                </div>
             </div>
          </div>

          {/* Right Side: Portrait Image */}
          <div className="w-32 md:w-40 relative h-full shrink-0 overflow-hidden">
             {member.photo ? (
                <img 
                   src={member.photo} 
                   alt={member.name} 
                   className="w-full h-full object-cover object-center transform transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-1 group-hover:brightness-110"
                />
             ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl font-bold text-gray-700">
                   {member.name.charAt(0)}
                </div>
             )}
          </div>
       </div>
    </div>
  );

  const SocialIcon = ({ href, type }: { href: string; type: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-white/5 hover:bg-cyan-500/20 rounded-lg text-gray-400 hover:text-cyan-400 transition-all hover:scale-110">
       <span className="sr-only">{type}</span>
       <IconPath type={type} className="w-5 h-5" />
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-mono text-sm animate-pulse">Initializing VGS Database...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 selection:bg-purple-500/30 font-sans">
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 border-b border-white/5 bg-[#050505] overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_50%)]"></div>
         
         <div className="max-w-7xl mx-auto relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Executive</span> Makers
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
               The visionaries, strategists, and leaders powering the Virtual Gaming Society's legacy.
            </p>
         </div>
      </section>

      {/* Year Filter */}
      {committees.length > 0 && (
         <div className="sticky top-20 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 py-4">
            <div className="max-w-7xl mx-auto px-6 overflow-x-auto custom-scrollbar">
               <div className="flex justify-center gap-2 min-w-max">
                  {committees.map((committee) => (
                     <button
                        key={committee.year_range}
                        onClick={() => handleYearChange(committee.year_range)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                           selectedYear === committee.year_range
                           ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                           : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
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
               <div className="flex items-end gap-4 mb-12 border-b border-white/5 pb-4">
                  <h2 className="text-3xl font-bold text-white">Faculty Advisors</h2>
                  <span className="text-cyan-500 font-mono text-sm mb-1.5 opacity-60">{'/// MENTORS'}</span>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                  {facultyMembers.map(renderFacultyCard)}
               </div>
            </section>
         )}

         {/* Executive Members */}
         {executiveMembers.length > 0 && (
            <section className="animate-fadeInUp delay-100">
               <div className="flex items-end gap-4 mb-12 border-b border-white/5 pb-4">
                  <h2 className="text-3xl font-bold text-white">Student Leadership</h2>
                  <span className="text-purple-500 font-mono text-sm mb-1.5 opacity-60">{'/// CORE_TEAM'}</span>
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  {executiveMembers.map(renderExecutiveCard)}
               </div>
            </section>
         )}

         {/* Empty State */}
         {!loading && !currentCommittee?.members.length && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
               <p className="text-gray-500 text-lg">No committee members found for {selectedYear}</p>
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

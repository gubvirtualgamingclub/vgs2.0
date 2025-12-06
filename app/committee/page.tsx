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
      
      // Check if year is in URL query params
      const yearFromUrl = searchParams.get('year');
      
      // Set the year from URL or default to first committee's year_range
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
  const years = committees.map((c) => c.year_range);

  // Group members by category - Only Faculty Advisor and Student Executives
  // Also handle old category names for backward compatibility
  // Sort by order_index to display in the order set by admin
  const facultyMembers = (currentCommittee?.members
    .filter(m => m.category === 'Faculty Advisors')
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || []);
  
  const executiveMembers = (currentCommittee?.members
    .filter(m => 
      m.category === 'Student Executives' || 
      m.category === 'Executive Committee' as any || 
      m.category === 'Student Members' as any
    )
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || []);

  const handleMemberClick = (memberId: string) => {
    // Add current year to URL so it's preserved when coming back
    router.push(`/committee/${memberId}?year=${selectedYear}`);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    // Update URL with selected year
    window.history.pushState({}, '', `/committee?year=${year}`);
  };

  const renderFacultyCard = (member: CommitteeMember) => (
    <div
      key={member.id}
      onClick={() => handleMemberClick(member.id)}
      className="relative group cursor-pointer"
    >
      {/* Card Container with Guardian Grid Design */}
      <div className="bg-slate-950 dark:bg-slate-950 rounded-2xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2 relative border border-slate-800/50 hover:border-cyan-500/50"
      style={{
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0, 255, 255, 0.03) 39px, rgba(0, 255, 255, 0.03) 40px),
          repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0, 255, 255, 0.03) 39px, rgba(0, 255, 255, 0.03) 40px),
          repeating-linear-gradient(45deg, transparent, transparent 56px, rgba(0, 255, 255, 0.02) 56px, rgba(0, 255, 255, 0.02) 57px),
          repeating-linear-gradient(-45deg, transparent, transparent 56px, rgba(0, 255, 255, 0.02) 56px, rgba(0, 255, 255, 0.02) 57px)
        `
      }}>
        {/* Subtle Grid Pulse Animation Background */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0, 255, 255, 0.05) 39px, rgba(0, 255, 255, 0.05) 40px),
              repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0, 255, 255, 0.05) 39px, rgba(0, 255, 255, 0.05) 40px)
            `,
            animation: 'gridPulse 4s ease-in-out infinite'
          }}>
        </div>

        {/* Soft Glow on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}>
        </div>

        {/* Content */}
        <div className="relative p-8 h-full flex flex-col items-center justify-center">
          {/* Profile Photo - Circular with Cool Gray Border */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-slate-700/50 group-hover:border-cyan-500/50 transition-colors duration-300 -m-1.5"></div>
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-slate-900 shadow-2xl group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1a202c&color=00ffff&size=200`;
                }}
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-4xl font-bold text-cyan-400 border-4 border-slate-900 shadow-2xl group-hover:shadow-cyan-500/30 group-hover:scale-105 transition-all duration-300">
                {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </div>
            )}
          </div>

          {/* Name & Role */}
          <h3 className="text-2xl font-bold text-white mb-2 text-center group-hover:text-cyan-300 transition-colors">
            {member.name}
          </h3>
          <p className="text-slate-400 text-sm font-semibold text-center mb-6">
            {member.designation}
          </p>

          {/* Social Media Icons - Appear on Hover */}
          <div className="flex items-center gap-3 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {member.facebook && (
              <a
                href={member.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110"
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110"
                title="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
            )}
            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110"
                title="Email"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
            )}
          </div>

          {/* Divider */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );

  const renderExecutiveCard = (member: CommitteeMember) => (
    <div
      key={member.id}
      onClick={() => handleMemberClick(member.id)}
      className="relative group cursor-pointer"
    >
      {/* Card Container with Player Hexagon Design */}
      <div className="bg-slate-950 dark:bg-slate-950 rounded-2xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2 relative border border-slate-800/50 hover:border-cyan-500/50">
        
        {/* Animated Circuit Lines Background */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 48%, rgba(0, 255, 255, 0.3) 49%, rgba(0, 255, 255, 0.3) 51%, transparent 52%),
              linear-gradient(0deg, transparent 48%, rgba(0, 255, 255, 0.3) 49%, rgba(0, 255, 255, 0.3) 51%, transparent 52%),
              linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.2) 49%, rgba(0, 255, 255, 0.2) 51%, transparent 52%),
              linear-gradient(-45deg, transparent 48%, rgba(0, 255, 255, 0.2) 49%, rgba(0, 255, 255, 0.2) 51%, transparent 52%)
            `,
            backgroundSize: '80px 80px, 80px 80px, 120px 120px, 120px 120px',
            animation: 'circuitFlow 6s linear infinite'
          }}>
        </div>

        {/* Soft Glow on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(0, 255, 255, 0.15) 0%, transparent 60%)',
            filter: 'blur(40px)'
          }}>
        </div>

        {/* Content */}
        <div className="relative p-8 h-full flex flex-col items-center justify-center">
          
          {/* Hexagon Photo Frame */}
          <div className="mb-6 relative group/hex">
            {/* Animated Hexagon Border */}
            <div className="absolute inset-0 -m-2 opacity-0 group-hover/hex:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                background: 'conic-gradient(from 0deg, #00ffff, #0099ff, #00ffff)',
                animation: 'hexPulse 2s ease-in-out infinite'
              }}>
            </div>

            {/* Hexagon Photo Container */}
            <div className="relative w-44 h-44"
              style={{
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              }}>
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover border-2 border-slate-900 group-hover/hex:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1a202c&color=00ffff&size=200`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-4xl font-bold text-cyan-400">
                  {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
              )}
            </div>
          </div>

          {/* Name & Role */}
          <h3 className="text-2xl font-bold text-white mb-2 text-center group-hover:text-cyan-300 transition-colors">
            {member.name}
          </h3>
          <p className="text-slate-400 text-sm font-semibold text-center mb-6">
            {member.designation}
          </p>

          {/* Divider */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-6"></div>

          {/* View Details Button */}
          <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-300 hover:from-cyan-400 hover:to-cyan-500 flex items-center gap-2">
            <span>View Details</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes circuitFlow {
          0% { background-position: 0 0, 0 0, 0 0, 0 0; }
          100% { background-position: 80px 80px, 80px 80px, 120px 120px, 120px 120px; }
        }
        @keyframes hexPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), inset 0 0 10px rgba(0, 255, 255, 0.4); }
        }
      `}</style>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading committee members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 crt-effect">
      {/* Gaming Enhancements */}
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      
      {/* Header Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white py-20 overflow-hidden border-b border-cyan-500/10">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0, 255, 255, 0.1) 39px, rgba(0, 255, 255, 0.1) 40px),
              repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0, 255, 255, 0.1) 39px, rgba(0, 255, 255, 0.1) 40px)
            `,
            backgroundSize: '80px 80px'
          }}>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-sm rounded-full mb-6 animate-bounce border border-cyan-500/30">
              <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-300 to-cyan-400">
              Executive Committee
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Meet the dedicated team leading VGS towards excellence
            </p>
          </div>
        </div>
      </section>

      {committees.length === 0 ? (
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No Committee Data Available
              </h2>
              <p className="text-slate-400">
                Committee information will be published soon. Please check back later.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Year Filter Section */}
          <section className="sticky top-16 z-10 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/10 shadow-lg shadow-cyan-500/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {committees.map((committee, index) => {
                  const isSelected = selectedYear === committee.year_range;
                  const isCurrent = index === 0;
                  
                  return (
                    <div key={committee.year_range} className="relative group">
                      <button
                        onClick={() => handleYearChange(committee.year_range)}
                        className={`relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-xl shadow-cyan-500/50'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-cyan-500/50 border border-slate-700'
                        }`}
                      >
                        {/* Info Icon */}
                        <svg 
                          className={`w-5 h-5 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        
                        <span className="relative z-10">
                          {committee.year_range}
                        </span>
                        
                        {isCurrent && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isSelected 
                              ? 'bg-slate-900/50' 
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            Current
                          </span>
                        )}
                        
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl animate-pulse opacity-50"></div>
                        )}
                      </button>
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-slate-900 dark:bg-slate-900 text-white p-4 rounded-lg shadow-2xl shadow-cyan-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-cyan-500/30">
                        {/* Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 bg-slate-900 dark:bg-slate-900 border-l border-t border-cyan-500/30 rotate-45"></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          <h4 className="font-bold text-lg mb-2 text-cyan-300">
                            {committee.name}
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {committee.description || `The ${committee.year_range} executive committee of GUCC Virtual Gaming Society.`}
                          </p>
                          <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-xs text-slate-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{committee.members?.length || 0} Members</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Committee Members Section */}
          <section className="py-12 bg-slate-950/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              {/* Faculty Advisors */}
              {facultyMembers.length > 0 && (
                <div>
                  <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 dark:from-cyan-500/20 dark:to-cyan-600/10 rounded-full mb-4 border border-cyan-500/30">
                      <svg
                        className="w-8 h-8 text-cyan-400 dark:text-cyan-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                      Faculty Advisors
                    </h2>
                    <p className="text-slate-400 dark:text-slate-400 text-lg">
                      Guiding with wisdom and experience
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {facultyMembers.map((member) => renderFacultyCard(member))}
                  </div>
                </div>
              )}

              {/* Student Executives */}
              {executiveMembers.length > 0 && (
                <div>
                  <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 dark:from-cyan-500/20 dark:to-cyan-600/10 rounded-full mb-4 border border-cyan-500/30">
                      <svg
                        className="w-8 h-8 text-cyan-400 dark:text-cyan-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                      Student Executives
                    </h2>
                    <p className="text-slate-400 dark:text-slate-400 text-lg">
                      Leading with passion and dedication
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {executiveMembers.map((member) => renderExecutiveCard(member))}
                  </div>
                </div>
              )}

              {/* No Members Message */}
              {!currentCommittee?.members.length && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No members found for this year.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

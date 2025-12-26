'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getPublishedActivities } from '@/lib/supabase-queries';
import type { Activity } from '@/lib/types/database';

// Dynamic imports for better performance
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

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true);
        const data = await getPublishedActivities();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  // Filter activities based on search and filters
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity.tags && activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || activity.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate stats
  const tournamentCount = activities.filter(a => a.category === 'Tournament').length;
  const workshopCount = activities.filter(a => a.category === 'Workshop').length;
  const upcomingCount = activities.filter(a => a.status === 'upcoming').length;

  const categories = ['Tournament', 'Social Event', 'Workshop', 'Seminar', 'Charity Event', 'Online Event', 'Offline Event'];
  const statuses = ['upcoming', 'ongoing', 'past', 'recurring'];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-5 dark:opacity-10 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-300/20 dark:bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <ScrollAnimation animation="slideUp">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 mb-8 backdrop-blur-md">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                 </span>
                 <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">Mission Control</span>
              </div>
           </ScrollAnimation>

           <ScrollAnimation animation="gameOver" delay={100}>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-900 dark:from-white to-gray-600 dark:to-gray-400">
                   Operations &
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x mt-2">
                   Events
                </span>
              </h1>
           </ScrollAnimation>
           
           <ScrollAnimation animation="fadeIn" delay={300}>
               <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Join the action. From competitive tournaments to community workshops, discover your next mission here.
               </p>
           </ScrollAnimation>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <ScrollAnimation animation="slideUp" delay={400}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                      { label: "Total Missions", value: activities.length, color: "text-purple-400", border: "border-purple-500/20", icon: <svg className="w-6 h-6 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
                      { label: "Tournaments", value: tournamentCount, color: "text-cyan-400", border: "border-cyan-500/20", icon: <svg className="w-6 h-6 text-cyan-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
                      { label: "Workshops", value: workshopCount, color: "text-green-400", border: "border-green-500/20", icon: <svg className="w-6 h-6 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
                      { label: "Upcoming", value: upcomingCount, color: "text-pink-400", border: "border-pink-500/20", icon: <svg className="w-6 h-6 text-pink-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                   ].map((stat, i) => (
                      <div key={i} className={`bg-white dark:bg-[#0a0a0b]/80 backdrop-blur-sm p-6 rounded-2xl border ${stat.border} text-center group hover:-translate-y-1 transition-transform shadow-md shadow-slate-100 dark:shadow-none`}>
                         {stat.icon}
                         <div className={`text-3xl md:text-4xl font-bold mb-1 ${stat.color} group-hover:scale-110 transition-transform`}>
                            {loading ? '...' : stat.value}
                         </div>
                         <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</div>
                      </div>
                   ))}
                </div>
             </ScrollAnimation>
          </div>
      </section>

      {/* Controls & Grid */}
      <section className="pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           
           {/* Search & Filter */}
           <div className="sticky top-20 z-40 mb-12">
               <div className="bg-white dark:bg-[#0f0f10]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/50">
                   <div className="flex flex-col md:flex-row gap-4">
                       <div className="flex-1 relative">
                           <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                           <input 
                              type="text" 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search operations..." 
                              className="w-full bg-slate-100 dark:bg-[#1a1a1c] border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                           />
                       </div>
                       
                       <div className="flex gap-4">
                           <select 
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="bg-slate-100 dark:bg-[#1a1a1c] border border-slate-300 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                           >
                              <option value="all">All Status</option>
                              {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                           </select>
                           <select 
                              value={filterCategory}
                              onChange={(e) => setFilterCategory(e.target.value)}
                              className="bg-slate-100 dark:bg-[#1a1a1c] border border-slate-300 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors cursor-pointer"
                           >
                              <option value="all">All Categories</option>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                       </div>
                   </div>

                   {/* Active Filter Tags */}
                   {(searchTerm || filterStatus !== 'all' || filterCategory !== 'all') && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide self-center mr-2">Filters:</span>
                          {/* Tags logic same as before but styled differently if needed */}
                          {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 hover:bg-purple-500/30 flex items-center gap-2">
                               Search: {searchTerm} <span>×</span>
                            </button>
                          )}
                           {filterStatus !== 'all' && (
                            <button onClick={() => setFilterStatus('all')} className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 hover:bg-cyan-500/30 flex items-center gap-2">
                               Status: {filterStatus} <span>×</span>
                            </button>
                          )}
                           {filterCategory !== 'all' && (
                            <button onClick={() => setFilterCategory('all')} className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30 hover:bg-green-500/30 flex items-center gap-2">
                               Category: {filterCategory} <span>×</span>
                            </button>
                          )}
                      </div>
                   )}
               </div>
           </div>

           {/* Loading State */}
           {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-96 rounded-3xl bg-[#0f0f10] border border-white/5 animate-pulse" />
                 ))}
              </div>
           ) : filteredActivities.length === 0 ? (
              <div className="text-center py-20 bg-[#0f0f10]/50 rounded-3xl border border-white/5">
                 <div className="text-6xl mb-4">🛸</div>
                 <h3 className="text-2xl font-bold text-white mb-2">No Signals Detected</h3>
                  <p className="text-gray-300">Try adjusting your sensors (filters) to find what you are looking for.</p>
                 <button 
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterCategory('all'); }}
                    className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all"
                 >
                    Reset Scanners
                 </button>
              </div>
           ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredActivities.map((activity, index) => (
                      <ScrollAnimation key={activity.id} animation="fadeIn" delay={index * 100}>
                         <Link 
                            href={`/activities/${activity.slug}`}
                            onMouseEnter={() => setHoveredCard(activity.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className="group relative block h-full"
                         >
                            {/* Card Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`} />

                            <div className="relative h-full bg-white dark:bg-[#0f0f10] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:border-slate-300 dark:group-hover:border-white/20">
                                {/* Image Container */}
                                <div className="relative h-48 sm:h-56 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] to-transparent z-10" />
                                    {activity.banner_image_url ? (
                                        <Image
                                            src={activity.banner_image_url}
                                            alt={activity.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                            <span className="text-4xl">🎮</span>
                                        </div>
                                    )}
                                    
                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg ${
                                            activity.status === 'upcoming' ? 'bg-blue-600 text-white' :
                                            activity.status === 'ongoing' ? 'bg-green-600 text-white animate-pulse' :
                                            activity.status === 'past' ? 'bg-gray-600/80 text-gray-300 backdrop-blur' :
                                            'bg-purple-600 text-white'
                                        }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                    
                                    {/* Category Badge */}
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                                            {activity.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 relative z-10">
                                    <div className="flex gap-2 mb-4">
                                       {activity.tags && activity.tags.slice(0, 3).map((tag, i) => (
                                          <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-gray-400 group-hover:text-cyan-400 transition-colors">
                                             {tag}
                                          </span>
                                       ))}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors leading-tight">
                                        {activity.title}
                                    </h3>

                                    <p className="text-gray-300 text-sm line-clamp-2 mb-6 h-10">
                                        {activity.short_description || activity.description}
                                    </p>

                                    <div className="space-y-3 border-t border-white/5 pt-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300">
                                            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span>{activity.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300">
                                            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>{activity.time}</span>
                                        </div>
                                    </div>
                                    
                                     {/* Action Arrow */}
                                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </Link>
                      </ScrollAnimation>
                  ))}
              </div>
           )}
        </div>
      </section>
    </div>
  );
}

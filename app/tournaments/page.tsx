'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getTournamentWithGames } from '@/lib/supabase-queries';
import { Tournament, TournamentGame, Organization } from '@/lib/types/database';
import Image from 'next/image';
import RulesModal from '@/components/RulesModal';

// Dynamic imports
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
const ScrollAnimation = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.ScrollAnimation),
  { ssr: false }
);

// --- COMPONENTS ---


// Modern Digital Cyberpunk Countdown
function CountdownTimer({ deadline }: { deadline: string }) {
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

    useEffect(() => {
        if (!deadline) return;
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(deadline).getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft(null);
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(interval);
    }, [deadline]);

    if (!deadline || !timeLeft) return (
        <div className="text-center py-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/10 blur-3xl group-hover:bg-red-500/20 transition-all duration-500"></div>
            <h3 className="relative text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 tracking-tighter uppercase animate-pulse" style={{ textShadow: '0 0 30px rgba(239,68,68,0.4)' }}>
                Registration Closed
            </h3>
        </div>
    );

    const units = [
        { label: 'Days', value: timeLeft.days, color: 'text-purple-500' },
        { label: 'Hours', value: timeLeft.hours, color: 'text-cyan-500' },
        { label: 'Minutes', value: timeLeft.minutes, color: 'text-pink-500' },
        { label: 'Seconds', value: timeLeft.seconds, color: 'text-emerald-500' }
    ];

    return (
        <div className="relative">
            {/* Tech Decoration */}
            <div className="absolute -top-6 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="absolute -bottom-6 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 lg:gap-16 relative z-10">
                {units.map((unit, idx) => (
                    <div key={unit.label} className="relative flex flex-col items-center">
                        <div className="relative w-full aspect-square md:w-32 md:h-32 flex items-center justify-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                            {/* Inner Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            {/* Number */}
                            <span className={`text-5xl md:text-6xl font-black font-mono tracking-tighter ${unit.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
                                {String(unit.value).padStart(2, '0')}
                            </span>

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-purple-500 transition-colors"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-cyan-500 transition-colors"></div>
                        </div>
                        <span className="mt-4 text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{unit.label}</span>
                        
                        {/* Separator Dots */}
                        {idx < 3 && (
                            <div className="hidden md:flex flex-col gap-2 absolute top-1/2 -right-6 md:-right-8 -translate-y-1/2 -mt-4 opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse delay-75"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}



// 1. Premium Game Card with Holographic Effect
function PremiumGameCard({ game, index, isGlobalRegistrationClosed }: { game: TournamentGame; index: number; isGlobalRegistrationClosed: boolean }) {
  const isRegistrationClosed = isGlobalRegistrationClosed || game.registration_status === 'closed';
  
  return (
    <div 
      className="group relative w-full aspect-square rounded-2xl transition-transform duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card Container */}
      <div className="absolute inset-0 bg-white dark:bg-[#0f1219] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-xl transition-all duration-300 group-hover:shadow-[0_0_50px_rgba(139,92,246,0.3)] group-hover:border-purple-500/50 flex flex-col">
        
        {/* Background Art */}
        <div className="absolute inset-0 z-0">
           <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100 dark:from-purple-900/20 via-white dark:via-[#0f1219] to-gray-50 dark:to-[#0b0f19]"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-overlay"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full p-4 md:p-6">
           
           {/* Top: Logo & Name */}
           <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative w-24 h-24 md:w-32 md:h-32 transition-transform duration-500 group-hover:scale-110">
                 {game.game_logo ? (
                    <Image 
                       src={game.game_logo} 
                       alt={game.game_name} 
                       fill 
                       className="object-contain drop-shadow-2xl"
                       sizes="(max-width: 768px) 100vw, 33vw"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-full text-purple-400 text-4xl font-bold">
                       {game.game_name.charAt(0)}
                    </div>
                 )}
              </div>
              <h3 className="mt-4 text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center leading-none">
                  {game.game_name}
              </h3>
              <div className="mt-2 text-green-600 dark:text-green-400 font-bold font-mono text-sm">{game.prize_pool}</div>
           </div>

           {/* Bottom: Compact Stats & Buttons */}
           <div className="mt-auto space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-mono text-center">
                  <div className="bg-gray-100 dark:bg-white/5 rounded-lg py-1 px-2 border border-gray-200 dark:border-white/5">{game.team_size}</div>
                  <div className="bg-gray-100 dark:bg-white/5 rounded-lg py-1 px-2 border border-gray-200 dark:border-white/5">{game.registration_fee || 'Free'}</div>
              </div>

              <div className="flex gap-2">
                  <a
                    href={isRegistrationClosed ? undefined : game.registration_link}
                    target={isRegistrationClosed ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className={`flex-1 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-1 transition-all ${isRegistrationClosed
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'}`}
                  >
                    {isRegistrationClosed ? 'Closed' : 'Register'}
                  </a>

                  <a
                    href={game.rulebook_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="py-3 px-4 rounded-lg bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 transition-all flex items-center justify-center"
                    title="Rule Book"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </a>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}

// 2. Organization Logo with Glow
function OrgLogo({ org, size = "medium" }: { org: Organization, size?: "small" | "medium" | "large" }) {
   const sizeClasses = {
       small: "w-20 h-20",
       medium: "w-32 h-32 md:w-40 md:h-40",
       large: "w-48 h-48 md:w-64 md:h-64"
   };
   
   return (
     <div className={`relative group flex flex-col items-center justify-center ${sizeClasses[size]}`}>
       
       <div className="relative w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
           {org.logo ? (
               <Image 
                 src={org.logo} 
                 alt={org.name} 
                 fill 
                 className="object-contain" // Removed drop-shadow
                 title={org.name}
               />
           ) : (
               <span className="text-sm font-bold text-gray-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">{org.name}</span>
           )}
       </div>
       
       {/* Name Tooltip (visible on hover) */}
       <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
           <span className="text-white text-xs font-bold uppercase tracking-widest whitespace-nowrap bg-black/80 px-3 py-1 rounded-full border border-white/10">
               {org.name}
           </span>
       </div>
     </div>
   );
}

// 3. Tournament Hub Modal (Schedule & Results)
function TournamentHubModal({
    isOpen,
    onClose,
    schedules,
    results,
    games
}: {
    isOpen: boolean;
    onClose: () => void;
    schedules: any[];
    results: any[];
    games: TournamentGame[]
}) {
    const [activeTab, setActiveTab] = useState<'schedule' | 'results'>('schedule');
    const [activeGameFilter, setActiveGameFilter] = useState<string>('all');

    if (!isOpen) return null;

    // Filter content
    const filteredSchedules = schedules.filter(s => activeGameFilter === 'all' || s.game_id === activeGameFilter);
    const filteredResults = results.filter(r => activeGameFilter === 'all' || r.game_id === activeGameFilter);

    // Group Schedules by Date
    const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
        const date = new Date(schedule.match_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(schedule);
        return acc;
    }, {} as Record<string, typeof schedules>);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fadeIn">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>

            <div className="relative w-full max-w-6xl h-[90vh] bg-[#0f1219] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20">
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Live Center</h2>
                        <p className="text-gray-400 text-sm">Official Tournament Hub</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Tabs & Filters */}
                <div className="flex flex-col md:flex-row gap-4 p-6 border-b border-white/5 bg-[#0b0f19]">
                    <div className="flex bg-black/40 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase transition-all ${activeTab === 'schedule' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Schedule
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase transition-all ${activeTab === 'results' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Results
                        </button>
                    </div>

                    <div className="flex-1 overflow-x-auto no-scrollbar flex gap-2">
                        <button
                            onClick={() => setActiveGameFilter('all')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all whitespace-nowrap ${activeGameFilter === 'all' ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                        >
                            All Games
                        </button>
                        {games.map(game => (
                            <button
                                key={game.id}
                                onClick={() => setActiveGameFilter(game.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all whitespace-nowrap ${activeGameFilter === game.id ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                            >
                                {game.game_name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    {activeTab === 'schedule' ? (
                        Object.entries(groupedSchedules).length > 0 ? (
                            Object.entries(groupedSchedules).map(([date, items]) => (
                                <div key={date}>
                                    <h3 className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4 sticky top-0 bg-[#0f1219] py-2 z-10">{date}</h3>
                                    <div className="grid gap-3">
                                        {(items as any[]).map((item: any) => (
                                            <div key={item.id} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors">
                                                <div className="text-center md:text-left min-w-[100px]">
                                                    <div className="text-xl font-black text-white">
                                                        {new Date(item.match_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase">{item.stage || 'Group Stage'}</div>
                                                </div>
                                                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                                                    <p className="text-sm text-gray-400">{item.description}</p>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-400">
                                                    {item.game?.game_name || 'General'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-600">No scheduled matches found.</div>
                        )
                    ) : (
                        // Results View
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((res: any) => (
                                    <div key={res.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                                        <div className="p-4 bg-white/5 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-white">{res.stage_name}</h4>
                                                <span className="text-xs text-gray-400">{res.game?.game_name}</span>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        </div>
                                        <div className="p-4">
                                            {/* Dynamic JSON Rendering for Leaderboard */}
                                            {Array.isArray(res.result_data) && (
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-left text-gray-500 text-xs uppercase">
                                                            <th className="pb-2">Rank</th>
                                                            <th className="pb-2">Team / Player</th>
                                                            <th className="pb-2 text-right">Score</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {res.result_data.map((row: any, idx: number) => (
                                                            <tr key={idx} className="group">
                                                                <td className="py-2 text-gray-400 group-hover:text-white font-mono">
                                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${row.rank || idx + 1}`}
                                                                </td>
                                                                <td className="py-2 font-bold text-white">{row.team || row.name}</td>
                                                                <td className="py-2 text-right text-cyan-400 font-mono">{row.score || row.status || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-gray-600">No results posted yet.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 4. Premium Glimpse Gallery with Bento Grid
function GlimpseGallery({ glimpses }: { glimpses: NonNullable<Tournament['previous_glimpses']> }) {
    const [activeEventIndex, setActiveEventIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (glimpses.length === 0) return null;

    const activeEvent = glimpses[activeEventIndex];

    return (
        <section className="py-32 px-4 md:px-8 relative overflow-hidden bg-slate-50 dark:bg-[#080a0f]">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col gap-12">

                    {/* Header with Navigation */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-4">
                        <div className="relative">
                            <span className="text-purple-600 dark:text-purple-400 font-mono text-xs md:text-sm tracking-widest uppercase mb-4 block">{'/// Legacy Archives'}</span>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                {activeEvent.title}
                            </h2>
                            <div className="h-1.5 w-24 bg-purple-500 mt-4"></div>
                        </div>

                        <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-full border border-gray-200 dark:border-white/10 backdrop-blur-sm">
                            <button
                                onClick={() => setActiveEventIndex((prev) => (prev - 1 + glimpses.length) % glimpses.length)}
                                className="w-12 h-12 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-sm font-bold font-mono min-w-[3ch] text-center text-slate-500 dark:text-slate-400">
                                {activeEventIndex + 1}/{glimpses.length}
                            </span>
                            <button
                                onClick={() => setActiveEventIndex((prev) => (prev + 1) % glimpses.length)}
                                className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-colors"
                            >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Bento Grid Layout */}
                    <div key={activeEventIndex} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[250px] gap-4 animate-fade-in-up">
                            {activeEvent.images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`
                                    relative group rounded-3xl overflow-hidden cursor-pointer border border-gray-200 dark:border-white/5
                                    transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/20 hover:z-10 hover:border-purple-500/50
                                    ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                                    ${idx === 1 ? 'md:col-span-1 md:row-span-2' : ''}
                                    ${idx === 2 ? 'md:col-span-1 md:row-span-1' : ''}
                                    ${idx > 2 ? 'md:col-span-1 md:row-span-1' : ''}
                                `}
                                onClick={() => setSelectedImage(img)}
                            >
                                <Image
                                    src={img}
                                    alt="Event Moment"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <span className="text-white text-xs font-mono uppercase tracking-widest border-l-2 border-purple-500 pl-3">View Fullsize</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-7xl w-full h-full flex items-center justify-center p-4 md:p-10">
                        <div className="relative w-full h-full max-h-[85vh]">
                             <Image
                                src={selectedImage}
                                alt="Full View"
                                fill
                                className="object-contain"
                                quality={100}
                             />
                        </div>
                        <button className="absolute top-6 right-6 p-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

// 4. Games In The Event - Premium Circular Carousel
function FeaturedGamesShowcase({ games }: { games: TournamentGame[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalGames = games.length;

    const goToNext = () => setActiveIndex((prev) => (prev + 1) % totalGames);
    const goToPrev = () => setActiveIndex((prev) => (prev - 1 + totalGames) % totalGames);

    if (!games || games.length === 0) return null;

    return (
        <section className="py-20 px-6 relative overflow-hidden bg-gray-100 dark:bg-[#0a0d14]">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.15),transparent_70%)]"></div>
                <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
                <ScrollAnimation animation="slideUp">
                    <div className="text-center mb-8 w-full">
                    <h2 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">
                            Games <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-gradient-x">In The Event</span>
                        </h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-orange-500 mx-auto rounded-full"></div>
                    </div>
                </ScrollAnimation>

                {/* Circular Carousel Display */}
                <div className="relative h-[600px] flex items-center justify-center">
                    
                    {/* Navigation Buttons - Absolute */}
                    <button 
                        onClick={goToPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:scale-110 hover:border-purple-500/50 transition-all flex items-center justify-center group"
                    >
                        <svg className="w-8 h-8 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button 
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:scale-110 hover:border-purple-500/50 transition-all flex items-center justify-center group"
                    >
                        <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Games Track */}
                    <div className="relative w-full max-w-5xl h-full flex items-center justify-center perspective-[1000px]">
                        {games.map((game, index) => {
                             // Calculate circular position
                             let offset = index - activeIndex;
                             if (offset > totalGames / 2) offset -= totalGames;
                             if (offset < -totalGames / 2) offset += totalGames;
                             
                             const isActive = offset === 0;
                             const isPrev = offset === -1 || (activeIndex === 0 && index === totalGames - 1);
                             const isNext = offset === 1 || (activeIndex === totalGames - 1 && index === 0);
                             
                             // Only render active, prev, and next for better performance and look
                             const isVisible = isActive || Math.abs(offset) <= 2; 

                             if (!isVisible) return null;

                             const xTrans = offset * 320; // Distance between items
                             const scale = isActive ? 1.2 : Math.max(0.6, 1 - Math.abs(offset) * 0.3);
                             const opacity = isActive ? 1 : Math.max(0.2, 0.6 - Math.abs(offset) * 0.3);
                             const zIndex = 50 - Math.abs(offset);
                             const blur = isActive ? 0 : Math.abs(offset) * 4;

                             return (
                                 <div
                                     key={game.id}
                                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                                     style={{
                                         transform: `translateX(calc(-50% + ${xTrans}px)) scale(${scale})`,
                                         opacity,
                                         zIndex,
                                         filter: `blur(${blur}px)`
                                     }}
                                 >
                                     <div 
                                        className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-[300px] md:w-[900px] h-[500px]"
                                        onClick={() => setActiveIndex(index)}
                                    >
                                         {/* Large Logo - Left Side */}
                                         <div className={`relative z-20 w-56 h-56 md:w-[400px] md:h-[400px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isActive ? 'drop-shadow-[0_0_60px_rgba(168,85,247,0.5)] scale-100' : 'grayscale brightness-50 scale-75 opacity-50'}`}>
                                             {game.game_logo ? (
                                                 <Image 
                                                     src={game.game_logo} 
                                                     alt={game.game_name} 
                                                     fill 
                                                     className="object-contain"
                                                 />
                                             ) : (
                                                 <div className="w-full h-full rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-6xl font-black text-gray-400 dark:text-white/20">
                                                     {game.game_name.charAt(0)}
                                                 </div>
                                             )}
                                         </div>

                                         {/* Game Name - Right Side (Foreground) */}
                                         <div className={`relative z-30 transition-all duration-700 delay-100 ease-out flex flex-col items-center md:items-start text-center md:text-left ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
                                             <h3 
                                                className="text-[3rem] md:text-[6rem] lg:text-[7rem] leading-none font-black text-gray-900 dark:text-white uppercase tracking-tighter"
                                                style={{ 
                                                    textShadow: '0 0 30px rgba(168,85,247,0.5)',
                                                    WebkitTextStroke: '1px rgba(255,255,255,0.1)'
                                                }}
                                             >
                                                 {game.game_name}
                                             </h3>
                                             
                                             {/* Decorative Line (Only Active) */}
                                             <div className={`h-1 bg-gradient-to-r from-purple-500 to-transparent mt-4 transition-all duration-1000 ${isActive ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}></div>
                                             
                                             <div className={`mt-4 text-purple-600 dark:text-purple-400 font-mono text-sm md:text-xl tracking-widest uppercase transition-all duration-1000 delay-200 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                                 {game.category} Edition
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-3 mt-12">
                    {games.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`h-1 transition-all duration-500 rounded-full ${idx === activeIndex ? 'w-12 bg-purple-500' : 'w-4 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}


export default function TournamentsPage() {
  const [tournament, setTournament] = useState<(Tournament & { games: TournamentGame[]; schedules?: any[]; results?: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'casual' | 'mobile' | 'pc'>('all');
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, []);

  async function fetchTournament() {
    try {
      setLoading(true);
      const data = await getTournamentWithGames();
      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter Logic
  const filteredGames = tournament?.games ? tournament.games.filter(g => {
     return activeCategory === 'all' || g.category === activeCategory;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-t-4 border-purple-500 border-r-4 border-r-transparent rounded-full animate-spin"></div>
            <div className="text-purple-500 font-mono tracking-widest text-sm animate-pulse">SYSTEM INITIALIZING...</div>
         </div>
      </div>
    );
  }

  if (!tournament || tournament.status === 'closed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center relative overflow-hidden font-mono">
        <ScrollProgressBar />
        <GamingCursor />
        
        {/* Simple Red Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 w-full max-w-3xl p-6 text-center">
             {/* Glitch Icon */}
             <div className="mb-8 relative inline-block">
                 <div className="w-24 h-24 mx-auto bg-red-500/5 rounded-2xl flex items-center justify-center border border-red-500/20">
                     <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                     </svg>
                 </div>
             </div>

             <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter uppercase relative">
                 System <span className="text-red-600">Offline</span>
             </h1>
             
             <div className="h-px w-24 bg-gray-800 mx-auto mb-8"></div>

             <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto font-light leading-relaxed">
                 Tournament protocols are currently suspended. Standby for future command data and event initiation.
             </p>

             <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                 <a href="/" className="px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm">
                     Return Home
                 </a>
                 
                 <button onClick={() => window.location.reload()} className="px-8 py-4 bg-transparent border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/5 transition-colors uppercase tracking-widest text-sm flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     Retry Connection
                 </button>
             </div>
             
             <div className="mt-16">
                  <p className="text-gray-400 dark:text-gray-700 text-xs font-mono uppercase tracking-[0.3em]">Connection Lost • Status: Inactive</p>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />

      {/* --- LIVE CENTER BUTTON (Top Right) --- */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-4 items-end">
          {tournament.status === 'open' && (tournament.show_schedule || tournament.show_results) && (
              <div className="animate-bounce-in">
                  <button
                    onClick={() => setIsHubOpen(true)}
                    className="group flex items-center gap-3 pl-4 pr-2 py-2 bg-black/80 backdrop-blur-md border border-purple-500/50 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:bg-purple-900/80 transition-all hover:scale-105"
                  >
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="font-bold text-white text-sm uppercase tracking-wider">Live Center</span>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                  </button>
              </div>
          )}

          {/* RULES BUTTON */}
          {tournament.show_rules && (
              <div className="animate-fade-in-left">
                  <button
                    onClick={() => setIsRulesOpen(true)}
                    className="group flex items-center gap-3 pl-4 pr-2 py-2 bg-black/80 backdrop-blur-md border border-blue-500/50 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:bg-blue-900/80 transition-all hover:scale-105"
                  >
                      <span className="font-bold text-white text-sm uppercase tracking-wider">Rule Book</span>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                      </div>
                  </button>
              </div>
          )}
      </div>

      <TournamentHubModal
        isOpen={isHubOpen}
        onClose={() => setIsHubOpen(false)}
        schedules={tournament.schedules || []}
        results={tournament.results || []}
        games={tournament.games}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        content={tournament.rules_content || ''}
      />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] w-full flex flex-col items-center justify-center overflow-hidden py-20">
         {/* Background Video or Banner */}
         <div className="absolute inset-0 z-0">
             {tournament.teaser_video_url ? (
                 <video 
                    src={tournament.teaser_video_url} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-90 dark:opacity-60"
                 />
             ) : tournament.banner ? (
                 <Image src={tournament.banner} alt="Banner" fill className="object-cover opacity-90 dark:opacity-60" priority />
             ) : (
                 <div className="w-full h-full bg-gradient-to-br from-purple-100 via-white to-blue-100 dark:from-purple-900 dark:via-black dark:to-blue-900"></div>
             )}
             
             {/* Gradient Overlays - Refined for Contrast */}
             <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-[#0b0f19] dark:via-[#0b0f19]/80 dark:to-transparent"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
         </div>

         {/* Hero Content */}
         <div className="relative z-10 text-center px-4 max-w-7xl mx-auto mt-20 p-8 rounded-3xl backdrop-blur-sm">
            <ScrollAnimation animation="fadeIn">
                {tournament.logo && (
                   <div className="relative w-32 h-32 md:w-56 md:h-56 mx-auto mb-8 drop-shadow-[0_0_60px_rgba(168,85,247,0.4)] transition-transform hover:scale-105 duration-500">
                      <Image src={tournament.logo} alt="Logo" fill className="object-contain" priority />
                   </div>
                )}
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-none tracking-tight uppercase text-gray-900 dark:text-white drop-shadow-2xl">
                   {tournament.name}
                </h1>
                
                {tournament.slogan && (
                   <p className="text-xl md:text-3xl text-cyan-600 dark:text-cyan-400 font-mono tracking-widest uppercase mb-16">
                      {'// '}{tournament.slogan}{' //'}
                   </p>
                )}

                 {/* Quick Stats Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mt-12">
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all group text-left shadow-lg">
                       <div className="flex items-center gap-3 mb-3">
                           <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           </div>
                           <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Date</div>
                       </div>
                       <div className="text-slate-900 dark:text-white font-bold text-lg">{tournament.date}</div>
                    </div>
                    
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all group text-left shadow-lg">
                       <div className="flex items-center gap-3 mb-3">
                           <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Time</div>
                       </div>
                       <div className="text-slate-900 dark:text-white font-bold text-lg">{tournament.time}</div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all group text-left shadow-lg">
                       <div className="flex items-center gap-3 mb-3">
                           <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           </div>
                           <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Venue</div>
                       </div>
                       <div className="text-slate-900 dark:text-white font-bold text-lg leading-tight" title={tournament.venue}>{tournament.venue}</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/60 dark:to-pink-900/60 backdrop-blur-md border border-purple-200 dark:border-purple-500/30 p-6 rounded-2xl transition-transform hover:scale-[1.02] shadow-xl shadow-purple-500/10">
                       <div className="flex items-center gap-3 mb-3">
                           <div className="p-2 rounded-lg bg-purple-600 text-white shadow-lg shadow-purple-500/30">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <div className="text-purple-900 dark:text-purple-200 text-xs font-bold uppercase tracking-wider">Prize Pool</div>
                       </div>
                       <div className="text-purple-900 dark:text-white font-black text-2xl md:text-3xl tracking-tight">{tournament.total_prize_pool}</div>
                    </div>
                 </div>
            </ScrollAnimation>
         </div>

         {/* Scroll Indicator */}
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
             <svg className="w-8 h-8 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
         </div>
      </section>

      {/* --- REGISTRATION COUNTDOWN --- */}
      <section className="relative z-20 py-24 px-4 bg-gray-50 dark:bg-[#0b0f19]">
         <div className="max-w-6xl mx-auto bg-white dark:bg-[#11141d] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 md:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-purple-900/10 text-center transform hover:scale-[1.01] transition-transform duration-500 relative overflow-hidden">
             
             {/* Decorative Elements */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

             <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-12 flex items-center justify-center gap-6">
                 <span className="w-12 h-[1px] bg-slate-200 dark:bg-white/10"></span>
                 Time Remaining To Register
                 <span className="w-12 h-[1px] bg-slate-200 dark:bg-white/10"></span>
             </h2>

             <CountdownTimer deadline={tournament.registration_deadline} />
             
             {/* Register Now Button */}
             <div className="mt-16 flex justify-center">
                <a 
                   href="#games-roster" 
                   className="group relative inline-flex items-center gap-4 px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-black font-black text-lg uppercase tracking-widest rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <span className="relative z-10 group-hover:text-white transition-colors">Join The Tournament</span>
                   <svg className="w-5 h-5 relative z-10 group-hover:text-white transition-colors group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
             </div>
         </div>
      </section>

      {/* --- EVENT TEASER SECTION --- */}
      {tournament.teaser_video_url && (
        <section className="py-24 px-6 relative overflow-hidden bg-gray-100 dark:bg-[#0a0d14]">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          </div>

          {/* Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <ScrollAnimation animation="slideUp">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">Event</span> Teaser
                </h2>
                <p className="text-gray-500 text-lg">Get hyped for the action</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="zoomIn">
              {/* Video Container with Gaming Frame */}
              <div className="relative max-w-5xl mx-auto group">
                
                {/* Outer Glow Layer */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700"></div>
                
                {/* Main Video Frame */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 bg-black shadow-[0_0_80px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_120px_rgba(139,92,246,0.5)] transition-all duration-500">
                  
                  {/* Corner Accents - Tech Style */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-purple-500 rounded-tl-2xl z-10 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-cyan-500 rounded-tr-2xl z-10 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-cyan-500 rounded-bl-2xl z-10 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-purple-500 rounded-br-2xl z-10 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity"></div>

                  {/* Top Tech Bar */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none flex items-center justify-between px-6">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-purple-400 font-mono tracking-widest uppercase">Live Teaser</span>
                  </div>

                  {/* Video Embed */}
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={tournament.teaser_video_url}
                      title="Tournament Teaser"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      style={{ border: 'none' }}
                    ></iframe>
                  </div>

                  {/* Bottom Scanline Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Side Tech Details */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-[2px] bg-gradient-to-r from-purple-500 to-transparent" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-[2px] bg-gradient-to-l from-cyan-500 to-transparent" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>
      )}

      {/* --- ABOUT SECTION --- */}
      <section className="py-20 px-4 md:px-8 bg-gray-100 dark:bg-[#0b0f19]">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">

              {/* About Event */}
              <div className="flex-1 w-full min-w-0">
                  <ScrollAnimation animation="slideRight">
                      <div className="relative h-full group p-6 md:p-10 rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.1)] overflow-hidden">
                          {/* Decor */}
                          <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

                          <h2 className="relative z-10 text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tighter">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">About The Event</span>
                          </h2>

                          <div className="relative z-10 pl-6 border-l-2 border-purple-500/30 group-hover:border-purple-500 transition-colors">
                              <div
                                className="prose prose-sm md:prose-lg prose-slate dark:prose-invert max-w-none
                                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
                                    prose-a:text-purple-500 hover:prose-a:text-purple-400
                                    prose-strong:text-gray-900 dark:prose-strong:text-white
                                    prose-img:rounded-xl prose-img:shadow-lg"
                                dangerouslySetInnerHTML={{ __html: tournament.about_event || tournament.description || '<p>No description available.</p>' }}
                              />
                          </div>
                      </div>
                  </ScrollAnimation>
              </div>

              {/* About Organizer */}
              <div className="flex-1 w-full min-w-0">
                  <ScrollAnimation animation="slideLeft">
                      <div className="relative h-full group p-6 md:p-10 rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.1)] overflow-hidden">
                          {/* Decor */}
                          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

                          <h2 className="relative z-10 text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tighter lg:text-right">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">About The Organizer</span>
                          </h2>

                          <div className="relative z-10 pl-6 lg:pl-0 lg:pr-6 border-l-2 lg:border-l-0 lg:border-r-2 border-blue-500/30 group-hover:border-blue-500 transition-colors">
                              <div
                                className="prose prose-sm md:prose-lg prose-slate dark:prose-invert max-w-none
                                    lg:text-right
                                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
                                    prose-a:text-blue-500 hover:prose-a:text-blue-400
                                    prose-strong:text-gray-900 dark:prose-strong:text-white
                                    prose-img:rounded-xl prose-img:shadow-lg"
                                dangerouslySetInnerHTML={{ __html: tournament.about_organizer || '<p>Proudly organized by VGS.</p>' }}
                              />
                          </div>
                      </div>
                  </ScrollAnimation>
              </div>
          </div>
      </section>

      {/* --- GLIMPSE GALLERY --- */}
      {tournament.previous_glimpses && tournament.previous_glimpses.length > 0 && (
          <GlimpseGallery glimpses={tournament.previous_glimpses} />
      )}



      {/* --- GAMES ARENA --- */}
      <section id="games-roster" className="py-32 px-6 relative z-10 bg-gray-50 dark:bg-[#0b0f19]">
         <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-gray-200 dark:border-white/5 pb-8">
                 <div>
                    <ScrollAnimation animation="slideRight">
                       <span className="text-purple-600 dark:text-purple-500 font-mono text-sm tracking-widest uppercase mb-2 block">{'/// Select Your Arena'}</span>
                       <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                          Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Roster</span>
                       </h2>
                       <p className="text-gray-500 dark:text-gray-400 text-lg">Select your battlefield. Dominate the competition.</p>
                    </ScrollAnimation>
                </div>
                
                {/* Modern Filter Tabs */}
                <div className="flex bg-gray-100 dark:bg-[#1a1d29] p-1.5 rounded-2xl border border-gray-200 dark:border-white/5">
                    {['all', 'pc', 'mobile', 'casual'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat as any)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold uppercase transition-all ${
                            activeCategory === cat 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {cat}
                    </button>
                    ))}
                </div>
             </div>

            {/* Games Grid */}
            {filteredGames.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredGames.map((game, index) => (
                     <PremiumGameCard
                        key={game.id}
                        game={game}
                        index={index}
                        isGlobalRegistrationClosed={tournament?.registration_status === 'closed'}
                     />
                  ))}
               </div>
            ) : (
               <div className="text-center py-32 border border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-gray-50 dark:bg-white/5">
                  <div className="text-6xl mb-4 grayscale opacity-30">⚠️</div>
                  <h3 className="text-2xl font-bold text-gray-500">No Games Found</h3>
               </div>
            )}
         </div>
      </section>

      {/* --- COLLABORATORS & SPONSORS --- */}
      {/* --- COLLABORATORS & SPONSORS --- */}
      {/* --- COLLABORATORS & SPONSORS --- */}
      <section className="py-32 px-6 bg-white dark:bg-[#0a0d14] relative border-t border-gray-100 dark:border-white/5 overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-100/50 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto space-y-32 relative z-10">
             
             {/* 1. Main Organizers (Tier 1 - Largest) */}
             {tournament.organizers && tournament.organizers.length > 0 && (
                 <div className="text-center">
                     <ScrollAnimation animation="slideUp">
                        <h3 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 uppercase tracking-tight mb-16 text-center">
                            Presented By
                        </h3>
                     </ScrollAnimation>
                     <div className="flex flex-wrap justify-center gap-12">
                        {tournament.organizers.map((org, index) => <OrgLogo key={index} org={org} size="medium" />)}
                     </div>
                 </div>
             )}

             {/* 2. Co-Organizers & In Association With (Tier 2 - Medium) */}
             {(
                 (tournament.co_organizers && tournament.co_organizers.length > 0) || 
                 (tournament.associated_with && tournament.associated_with.length > 0)
             ) && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-start justify-items-center">
                     
                     {/* Co-Organizers */}
                     {tournament.co_organizers && tournament.co_organizers.length > 0 && (
                         <div className="w-full flex flex-col items-center">
                             <ScrollAnimation animation="slideRight">
                                <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 uppercase tracking-tight mb-12 text-center">
                                    Co-Organized By
                                </h3>
                             </ScrollAnimation>
                             <div className="flex flex-wrap justify-center gap-10">
                                 {tournament.co_organizers.map((org, index) => <OrgLogo key={index} org={org} size="medium" />)}
                             </div>
                         </div>
                     )}

                     {/* Associated With */}
                     {tournament.associated_with && tournament.associated_with.length > 0 && (
                         <div className="w-full flex flex-col items-center">
                            <ScrollAnimation animation="slideLeft">
                                <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 uppercase tracking-tight mb-12 text-center">
                                    In Association With
                                </h3>
                            </ScrollAnimation>
                             <div className="flex flex-wrap justify-center gap-10">
                                 {tournament.associated_with.map((org, index) => <OrgLogo key={index} org={org} size="medium" />)}
                             </div>
                         </div>
                     )}
                 </div>
             )}

             {/* 3. Global Sponsors (Tier 3 - Grid) */}
             {tournament.sponsors && tournament.sponsors.length > 0 && (
                 <div className="relative pt-20 border-t border-gray-100 dark:border-white/5">
                    <ScrollAnimation animation="fadeIn">
                        <div className="text-center mb-16">
                            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                                Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Partners</span>
                            </h3>
                            <p className="text-gray-500 text-sm">Powering the next generation of esports</p>
                        </div>
                    </ScrollAnimation>
                    
                    <div className="flex flex-wrap justify-center gap-10 md:gap-16 px-4">
                        {tournament.sponsors.map((org, index) => (
                            <div key={index} className="transform hover:scale-110 transition-transform duration-300">
                                <OrgLogo org={org} size="medium" />
                            </div>
                        ))}
                    </div>
                 </div>
             )}

         </div>
      </section>
    </div>
  );
}

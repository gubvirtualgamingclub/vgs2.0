import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActivityBySlug } from '@/lib/supabase-queries';
import Image from 'next/image';

// Disable caching to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await Promise.resolve(params);
  const activity = await getActivityBySlug(slug);

  if (!activity) {
    notFound();
  }

  return (
<div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 selection:text-purple-200 pt-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center gap-4 text-sm font-mono mb-8 text-gray-400">
            <Link 
                href="/activities" 
                className="flex items-center gap-2 hover:text-white transition-colors group"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Events
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-500 truncate max-w-[200px] md:max-w-md">
                events / <span className="text-cyan-400">{activity.slug || slug}</span>
            </span>
        </div>

        {/* Clear Banner Image */}
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-purple-900/10 border border-white/10 group">
            {activity.banner_image_url ? (
                <Image
                    src={activity.banner_image_url}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900 via-[#0f0f10] to-black" />
            )}
            
            {/* Gradient Overlay for bottom text readability if needed, but keeping it clean for now as requested "clearly" */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Left Column (Main) */}
            <div className="lg:col-span-2">
                
                {/* Header Section (Moved from Hero) */}
                <div className="mb-12">
                   {/* Tags */}
                   <div className="flex flex-wrap gap-3 mb-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider 
                            ${activity.status === 'upcoming' ? 'bg-blue-600 text-white shadow-[0_0_15px_#2563eb]' :
                              activity.status === 'ongoing' ? 'bg-green-600 text-white shadow-[0_0_15px_#16a34a]' :
                              'bg-purple-600 text-white shadow-[0_0_15px_#9333ea]'}`}>
                            {activity.status}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            {activity.category}
                      </span>
                   </div>

                   {/* Title */}
                   <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">
                      {activity.title}
                   </h1>

                   {/* Meta Data Row */}
                   <div className="flex flex-wrap gap-8 text-gray-300">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         </div>
                         <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</div>
                            <div className="font-semibold text-white">{activity.date}</div>
                         </div>
                      </div>

                      <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time</div>
                            <div className="font-semibold text-white">{activity.time}</div>
                         </div>
                      </div>

                      <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                         <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</div>
                            <div className="font-semibold text-white">{activity.venue}</div>
                         </div>
                      </div>
                   </div>
                </div>
                  
                {/* About Card */}
                <div className="bg-[#0f0f10] border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group mb-8">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900/10 blur-[80px] rounded-full pointer-events-none" />
                   
                   <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <span className="w-1.5 h-8 bg-purple-500 rounded-full" />
                       Mission Briefing
                   </h2>
                   <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
                      {activity.description.split('\n\n').map((p, i) => (
                         <p key={i}>{p}</p>
                      ))}
                   </div>
                </div>

                {/* Guests Section */}
                {activity.guests && activity.guests.length > 0 && (
                   <div className="bg-[#0f0f10] border border-white/10 rounded-3xl p-8 mb-8">
                       <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                         <span className="w-1.5 h-8 bg-cyan-500 rounded-full" />
                         Honored Guests
                      </h2>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         {activity.guests.map((guest, i) => (
                            <div key={i} className="group relative text-center">
                               <div className="relative mx-auto mb-4 w-28 h-28">
                                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-60 transition-opacity" />
                                  <Image 
                                     src={guest.photo || '/members/unknownMale.svg'} 
                                     alt={guest.name} 
                                     width={112} 
                                     height={112} 
                                     className="rounded-full w-full h-full object-cover border-2 border-white/10 group-hover:border-cyan-400 transition-colors relative z-10" 
                                  />
                               </div>
                               <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{guest.name}</h3>
                               <p className="text-sm text-gray-500 uppercase tracking-wider">{guest.designation}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* Sponsors Section */}
                {activity.sponsors && activity.sponsors.length > 0 && (
                   <div className="bg-[#0f0f10] border border-white/10 rounded-3xl p-8">
                      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                         <span className="w-1.5 h-8 bg-green-500 rounded-full" />
                         Strategic Partners
                      </h2>
                      <div className="flex flex-wrap gap-8 items-center justify-center p-6 bg-white/5 rounded-2xl">
                         {activity.sponsors.map((sponsor, i) => (
                            <a key={i} href={sponsor.website} target="_blank" className="hover:scale-105 transition-transform opacity-70 hover:opacity-100">
                               <Image src={sponsor.logo} alt={sponsor.name} width={120} height={60} className="object-contain max-h-16" />
                            </a>
                         ))}
                      </div>
                   </div>
                )}

            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1 space-y-6">
               
               {/* Event Intel Card */}
               <div className="bg-[#0f0f10]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 sticky top-24 shadow-2xl">
                   <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                         i
                      </div>
                      <h3 className="text-xl font-bold">Event Intel</h3>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-white/5 rounded-xl p-4">
                         <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Participants</div>
                         <div className="text-lg font-bold text-white">{activity.participants || 'Unlimited Slots'}</div>
                      </div>
                      
                      {activity.facebook_post_url && (
                          <a 
                            href={activity.facebook_post_url} 
                            target="_blank"
                            className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20"
                          >
                             View Facebook Event
                          </a>
                      )}
                      
                      <Link 
                         href="/activities"
                         className="block w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-center rounded-xl transition-all"
                      >
                         Back to Events
                      </Link>
                   </div>
               </div>

            </div>

        </div>
      </div>
      
      <div className="h-20" /> {/* Bottom spacer */}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { getPublishedSponsors, getSiteSetting } from '@/lib/supabase-queries';
import type { Sponsor } from '@/lib/types/database';
import dynamic from 'next/dynamic';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Assuming you have heroicons or use SVGs

// Dynamically import scroll animations to avoid SSR issues
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

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sponsor' | 'collaborator'>('all');
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [partnershipBrochureUrl, setPartnershipBrochureUrl] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('partnerships@vgs.com');
  const [contactPhone, setContactPhone] = useState<string>('+1 (234) 567-890');
  const [contactWhatsApp, setContactWhatsApp] = useState<string>('1234567890');

  useEffect(() => {
    fetchSponsors();
    fetchPartnershipBrochureUrl();
    fetchContactInfo();
  }, []);

  async function fetchSponsors() {
    try {
      setLoading(true);
      const data = await getPublishedSponsors();
      setSponsors(data);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPartnershipBrochureUrl() {
    try {
      const setting = await getSiteSetting('partnership_brochure_url');
      if (setting && setting.setting_value) {
        setPartnershipBrochureUrl(setting.setting_value);
      }
    } catch (error) {
      console.error('Error fetching partnership brochure URL:', error);
    }
  }

  async function fetchContactInfo() {
    try {
      const [email, phone, whatsapp] = await Promise.all([
        getSiteSetting('contact_email'),
        getSiteSetting('contact_phone'),
        getSiteSetting('contact_whatsapp'),
      ]);
      
      if (email && email.setting_value) {
        setContactEmail(email.setting_value);
      }
      if (phone && phone.setting_value) {
        setContactPhone(phone.setting_value);
      }
      if (whatsapp && whatsapp.setting_value) {
        setContactWhatsApp(whatsapp.setting_value);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  }

  const filteredSponsors = sponsors.filter((sponsor) => {
    if (filter === 'all') return true;
    return sponsor.type === filter;
  });

  const formatSponsorType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b] text-gray-900 dark:text-white selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      {/* Gaming Enhancements */}
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      
      {/* Header Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
         {/* Background Glows */}
         <div className="absolute top-0 center w-full h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
         <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <ScrollAnimation animation="slideUp" delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">Our Partners</span>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="gameOver" delay={200}>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 dark:from-white via-gray-600 dark:via-purple-100 to-gray-400">
                Sponsors &
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient-x">
                 Collaborators
              </span>
            </h1>
          </ScrollAnimation>
          
          <ScrollAnimation animation="fadeIn" delay={400}>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Powering the next generation of esports. Meet the brands and organizations that make our events possible.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-xl border-y border-gray-200 dark:border-white/5 py-4 mb-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-2">
            {[
                { key: 'all', label: 'All Partners' },
                { key: 'sponsor', label: '🏢 Sponsors' },
                { key: 'collaborator', label: '🤝 Collaborators' }
            ].map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
                        filter === tab.key
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {tab.label}
                    {tab.key === 'all' && <span className="ml-2 opacity-60 text-xs">({sponsors.length})</span>}
                    {tab.key !== 'all' && <span className="ml-2 opacity-60 text-xs">({sponsors.filter(s => s.type === tab.key).length})</span>}
                </button>
            ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 pb-24 min-h-[60vh]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-[#0f0f10] h-[340px] rounded-3xl border border-white/5 animate-pulse flex flex-col p-6">
                 <div className="w-full h-32 bg-white/5 rounded-xl mb-6" />
                 <div className="h-6 w-3/4 bg-white/5 rounded mb-3" />
                 <div className="h-4 w-1/2 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredSponsors.length === 0 ? (
          <div className="text-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No partners found
            </h3>
            <p className="text-gray-500">
              Check back later for updates!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSponsors.map((sponsor, index) => (
                <ScrollAnimation key={sponsor.id} animation="slideUp" delay={index * 50}>
                    <div
                        onClick={() => setSelectedSponsor(sponsor)}
                        className="group relative h-full bg-[#0f0f10] border border-white/5 hover:border-purple-500/50 rounded-3xl p-6 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.15)] cursor-pointer overflow-hidden"
                    >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        {/* Featured Badge */}
                        {sponsor.is_featured && (
                            <div className="absolute top-0 right-0 p-4 z-10">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/50 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                                    <span className="text-xs">★</span>
                                </span>
                            </div>
                        )}

                        {/* Logo Area */}
                        <div className="relative z-10 h-40 flex items-center justify-center mb-6 p-4 bg-white/[0.02] rounded-2xl group-hover:bg-white/[0.05] transition-colors border border-white/5">
                            <img
                                src={sponsor.logo}
                                alt={sponsor.name}
                                className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110 drop-shadow-2xl"
                            />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">{sponsor.name}</h3>
                            
                             {/* Tags */}
                             <div className="flex flex-wrap gap-2 mb-4 min-h-[1.5rem]">
                                {sponsor.events && sponsor.events.length > 0 ? (
                                    sponsor.events.slice(0, 2).map((event, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10">
                                            {event}
                                        </span>
                                    ))
                                ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-500 border border-white/10 opacity-50">
                                        Partner
                                    </span>
                                )}
                                {sponsor.events && sponsor.events.length > 2 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-500 border border-white/10">
                                        +{sponsor.events.length - 2}
                                    </span>
                                )}
                             </div>

                             {/* Type Badge */}
                            <div className="flex-1"></div>
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                    sponsor.type === 'sponsor' ? 'text-blue-400' : 'text-green-400'
                                }`}>
                                    {sponsor.type === 'sponsor' ? 'Sponsor' : 'Collaborator'}
                                </span>
                                
                                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </ScrollAnimation>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
             onClick={() => setSelectedSponsor(null)}>
          <div className="relative bg-[#111] border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden"
               onClick={(e) => e.stopPropagation()}>
             
             {/* Modal Content */}
             <div className="relative">
                {/* Background Banner */}
                <div className="h-40 bg-gradient-to-r from-purple-900/40 to-blue-900/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setSelectedSponsor(null)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors border border-white/10 backdrop-blur-sm"
                    >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="px-8 pb-12 -mt-20 relative">
                    {/* Logo */}
                    <div className="w-40 h-40 bg-[#18181b] rounded-2xl border border-white/10 p-4 flex items-center justify-center shadow-2xl mb-6">
                         <img
                            src={selectedSponsor.logo}
                            alt={selectedSponsor.name}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8">
                             <div>
                                <h2 className="text-4xl font-bold text-white mb-4">{selectedSponsor.name}</h2>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <span className={`px-3 py-1 rounded-full font-bold border ${selectedSponsor.type === 'sponsor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                        {selectedSponsor.type === 'sponsor' ? 'Official Sponsor' : 'Strategic Collaborator'}
                                    </span>
                                    {selectedSponsor.custom_type_name && (
                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                            {selectedSponsor.custom_type_name}
                                        </span>
                                    )}
                                </div>
                             </div>

                             <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-500 rounded-full" />
                                    About
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-lg">
                                    {selectedSponsor.description}
                                </p>
                             </div>

                             {selectedSponsor.events && selectedSponsor.events.length > 0 && (
                                <div>
                                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                                        Sponsored Events
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedSponsor.events.map((event, idx) => (
                                            <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                                <span className="text-gray-200 font-medium">{event}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}
                        </div>
                        
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                                <h4 className="font-bold text-white uppercase text-sm tracking-wider opacity-60">Information</h4>
                                
                                {selectedSponsor.website && (
                                    <a href={selectedSponsor.website} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-white text-black font-bold text-center rounded-xl hover:bg-gray-200 transition-colors">
                                        Visit Website
                                    </a>
                                )}

                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Connect</p>
                                    <div className="flex gap-2">
                                        {selectedSponsor.social_media?.facebook && (
                                            <a href={selectedSponsor.social_media.facebook} target="_blank" className="p-2 rounded-lg bg-[#222] hover:bg-[#333] text-white border border-white/10 transition-colors">
                                                FB
                                            </a>
                                        )}
                                        {selectedSponsor.social_media?.twitter && (
                                            <a href={selectedSponsor.social_media.twitter} target="_blank" className="p-2 rounded-lg bg-[#222] hover:bg-[#333] text-white border border-white/10 transition-colors">
                                                X
                                            </a>
                                        )}
                                        {selectedSponsor.social_media?.instagram && (
                                            <a href={selectedSponsor.social_media.instagram} target="_blank" className="p-2 rounded-lg bg-[#222] hover:bg-[#333] text-white border border-white/10 transition-colors">
                                                IG
                                            </a>
                                        )}
                                        {selectedSponsor.social_media?.linkedin && (
                                            <a href={selectedSponsor.social_media.linkedin} target="_blank" className="p-2 rounded-lg bg-[#222] hover:bg-[#333] text-white border border-white/10 transition-colors">
                                                IN
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Collaboration CTA */}
      <section className="py-24 relative overflow-hidden text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-6">
                 <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Level Up?</h2>
                 <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                    Join forces with VGS and connect with the most passionate gaming community. Let's create something legendary together.
                 </p>
                 <button
                    onClick={() => setShowCollaborationModal(true)}
                    className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-full hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] hover:scale-105 transition-all duration-300"
                >
                    Become a Partner
                </button>
            </div>
      </section>

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowCollaborationModal(false)}
        >
          <div 
            className="bg-[#111] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="sticky top-0 bg-[#111]/90 backdrop-blur border-b border-white/10 px-8 py-6 flex items-center justify-between z-10">
                 <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Partnership Inquiry</h2>
                 <button onClick={() => setShowCollaborationModal(false)} className="bg-white/5 hover:bg-white/10 p-2 rounded-full text-white transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                 </button>
             </div>

             <div className="p-8 space-y-12">
                 <div className="grid md:grid-cols-2 gap-6">
                    {/* Benefits cards styled similarly to new aesthetic */}
                    {[
                        { title: 'Brand Exposure', icon: '🎯', desc: 'Reach thousands of gamers.' },
                        { title: 'Community', icon: '🤝', desc: 'Direct engagement with players.' },
                        { title: 'Digital Presence', icon: '🌐', desc: 'Website and social features.' },
                        { title: 'Events', icon: '🎪', desc: 'On-site activations and booths.' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:border-purple-500/30 transition-colors">
                            <div className="text-3xl mb-4">{item.icon}</div>
                            <h3 className="font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-300">{item.desc}</p>
                        </div>
                    ))}
                 </div>

                 <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8">
                     <h3 className="text-xl font-bold text-white mb-6">Contact Our Team</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <a href={`mailto:${contactEmail}`} className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">✉️</div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Email</div>
                                <div className="text-white font-medium">{contactEmail}</div>
                            </div>
                        </a>
                        <a href={`tel:${contactPhone}`} className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">📞</div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Phone</div>
                                <div className="text-white font-medium">{contactPhone}</div>
                            </div>
                        </a>
                        <a href={`https://wa.me/${contactWhatsApp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all md:col-span-2 lg:col-span-1">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold">WhatsApp</div>
                                <div className="text-white font-medium">{contactPhone}</div>
                            </div>
                        </a>
                     </div>
                 </div>
                 
                 <div className="text-center border-t border-white/5 pt-8">
                     <p className="text-gray-300 mb-6">Need more details? Download our full partnership deck.</p>
                     {partnershipBrochureUrl ? (
                         <a href={partnershipBrochureUrl} target="_blank" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold border-b border-purple-500/30 pb-1">
                             Download Brochure (PDF) →
                         </a>
                     ) : (
                         <span className="text-gray-600 italic">Brochure coming soon</span>
                     )}
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

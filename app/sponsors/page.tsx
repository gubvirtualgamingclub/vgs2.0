'use client';

import { useState, useEffect } from 'react';
import { getPublishedSponsors, getSiteSetting } from '@/lib/supabase-queries';
import type { Sponsor } from '@/lib/types/database';
import dynamic from 'next/dynamic';

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

  const getTierColor = (tier: string) => {
    const colors = {
      platinum: { bg: 'from-slate-300 to-slate-500', text: 'text-slate-800', border: 'border-slate-400' },
      gold: { bg: 'from-yellow-300 to-yellow-600', text: 'text-yellow-900', border: 'border-yellow-500' },
      silver: { bg: 'from-gray-300 to-gray-500', text: 'text-gray-800', border: 'border-gray-400' },
      bronze: { bg: 'from-orange-300 to-orange-600', text: 'text-orange-900', border: 'border-orange-500' },
    };
    return colors[tier as keyof typeof colors] || colors.gold;
  };

  const formatSponsorType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 crt-effect">
      {/* Gaming Enhancements */}
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      
      {/* Header Section */}
      <section className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation animation="gameOver" delay={100}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Sponsors & Collaborators
            </h1>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeIn" delay={400}>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto">
              Our valued partners who make our events and activities possible
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1 py-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All ({sponsors.length})
            </button>
            <button
              onClick={() => setFilter('sponsor')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                filter === 'sponsor'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🏢 Sponsors ({sponsors.filter(s => s.type === 'sponsor').length})
            </button>
            <button
              onClick={() => setFilter('collaborator')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                filter === 'collaborator'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🤝 Collaborators ({sponsors.filter(s => s.type === 'collaborator').length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden flex flex-col animate-pulse">
                {/* Featured Star Placeholder */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                
                {/* Logo Container */}
                <div className="flex-1 p-10 flex items-center justify-center min-h-[240px]">
                  <div className="w-40 h-40 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                </div>
                
                {/* Bottom Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mx-auto mb-4"></div>
                  <div className="flex justify-center gap-2">
                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSponsors.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              No {filter === 'all' ? '' : filter + 's'} found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for our amazing partners!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSponsors.map((sponsor, index) => {
              return (
                <ScrollAnimation key={sponsor.id} animation="slideUp" delay={index * 80}>
                <div
                  onClick={() => setSelectedSponsor(sponsor)}
                  className="group relative bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden flex flex-col"
                >
                  {/* Featured Star Badge */}
                  {sponsor.is_featured && (
                    <div className="absolute top-4 right-4 z-10 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}

                  {/* Logo Container - Flexible for any aspect ratio */}
                  <div className="flex-1 p-8 flex items-center justify-center" style={{ minHeight: '240px' }}>
                    <div className="w-full flex items-center justify-center">
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="w-full h-auto object-contain transition-all duration-500 group-hover:scale-105 filter group-hover:brightness-110"
                        style={{ maxHeight: '200px', maxWidth: '100%' }}
                      />
                    </div>
                  </div>

                  {/* Bottom Info Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-3 line-clamp-2 min-h-[3.5rem] flex items-center justify-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {sponsor.name}
                    </h3>

                    {/* Description Preview */}
                    {sponsor.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 line-clamp-2">
                        {sponsor.description}
                      </p>
                    )}

                    {/* Badges Row */}
                    <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                      {/* Type Badge */}
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        sponsor.type === 'sponsor' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {sponsor.type === 'sponsor' ? '🏢 Sponsor' : '🤝 Partner'}
                      </span>

                      {/* Custom Type Name */}
                      {sponsor.custom_type_name && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                          {sponsor.custom_type_name}
                        </span>
                      )}

                      {/* Sponsor Type Badges (Multiple) */}
                      {sponsor.sponsor_types && sponsor.sponsor_types.length > 0 && sponsor.sponsor_types.map((type: string) => (
                        <span key={type} className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          {formatSponsorType(type)}
                        </span>
                      ))}

                      {/* Collaborator Type Badges (Multiple) */}
                      {sponsor.collaborator_types && sponsor.collaborator_types.length > 0 && sponsor.collaborator_types.map((type: string) => (
                        <span key={type} className="px-3 py-1.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                          {formatSponsorType(type)}
                        </span>
                      ))}
                    </div>

                    {/* View Details Button */}
                    <div className="text-center">
                      <span className="inline-flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                        View Details
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/0 via-transparent to-transparent group-hover:from-purple-600/5 transition-all duration-500 pointer-events-none rounded-3xl"></div>
                </div>
                </ScrollAnimation>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
             onClick={() => setSelectedSponsor(null)}>
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedSponsor(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8">
              {/* Logo - Flexible for any aspect ratio */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 mb-8 flex items-center justify-center" style={{ minHeight: '200px' }}>
                <img
                  src={selectedSponsor.logo}
                  alt={selectedSponsor.name}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '240px', maxWidth: '100%' }}
                />
              </div>

              {/* Name */}
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
                {selectedSponsor.name}
              </h2>

              {/* Badges */}
              <div className="flex justify-center flex-wrap gap-3 mb-8">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedSponsor.type === 'sponsor' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                }`}>
                  {selectedSponsor.type === 'sponsor' ? '🏢 Sponsor' : '🤝 Collaborator'}
                </span>
                
                {/* Custom Type Name */}
                {selectedSponsor.custom_type_name && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    {selectedSponsor.custom_type_name}
                  </span>
                )}
                
                {/* Multiple Sponsor Types */}
                {selectedSponsor.sponsor_types && selectedSponsor.sponsor_types.length > 0 && selectedSponsor.sponsor_types.map((type: string) => (
                  <span key={type} className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    {formatSponsorType(type)}
                  </span>
                ))}
                
                {/* Multiple Collaborator Types */}
                {selectedSponsor.collaborator_types && selectedSponsor.collaborator_types.length > 0 && selectedSponsor.collaborator_types.map((type: string) => (
                  <span key={type} className="px-4 py-2 rounded-full text-sm font-semibold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                    {formatSponsorType(type)}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedSponsor.description}
                </p>
              </div>

              {/* Events/Activities Association */}
              {selectedSponsor.events && selectedSponsor.events.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Associated Events/Activities
                  </h3>
                  <ul className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    {selectedSponsor.events.map((event, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1 text-lg">•</span>
                        <span className="flex-1 font-medium">{event}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Website */}
              <div className="mb-8">
                <a
                  href={selectedSponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Visit Website
                </a>
              </div>

              {/* Social Media */}
              {selectedSponsor.social_media && Object.values(selectedSponsor.social_media).some(link => link) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Connect With Us</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedSponsor.social_media.facebook && (
                      <a
                        href={selectedSponsor.social_media.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                        title="Facebook"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {selectedSponsor.social_media.instagram && (
                      <a
                        href={selectedSponsor.social_media.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                        title="Instagram"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {selectedSponsor.social_media.linkedin && (
                      <a
                        href={selectedSponsor.social_media.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                        title="LinkedIn"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {selectedSponsor.social_media.twitter && (
                      <a
                        href={selectedSponsor.social_media.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                        title="Twitter / X"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                    {selectedSponsor.social_media.youtube && (
                      <a
                        href={selectedSponsor.social_media.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                        title="YouTube"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Want to Collaborate Section */}
      <ScrollAnimation animation="slideUp" delay={0.4}>
        <div className="mt-20 mb-12">
          <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-bounce"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-bounce delay-75"></div>
            </div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
                Want to Collaborate?
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                Join our community of sponsors and partners. Together, we can create amazing experiences and make a lasting impact.
              </p>

              {/* CTA Button */}
              <button
                onClick={() => setShowCollaborationModal(true)}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative z-10">Get in Touch</span>
                <svg className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              {/* Additional Info */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Quick Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Flexible Packages</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Exclusive Benefits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollAnimation>

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCollaborationModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20 shadow-2xl shadow-purple-500/20 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-900/95 via-blue-900/95 to-cyan-900/95 backdrop-blur-md px-8 py-6 border-b border-purple-500/20 flex items-center justify-between z-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
                  Let&apos;s Work Together
                </h2>
                <p className="text-gray-300 mt-1">Explore partnership opportunities</p>
              </div>
              <button
                onClick={() => setShowCollaborationModal(false)}
                className="w-12 h-12 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white rounded-xl flex items-center justify-center transition-all hover:scale-110"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Partnership Benefits */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </span>
                  Partnership Benefits
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: '🎯',
                      title: 'Brand Exposure',
                      description: 'Reach thousands of engaged participants and gaming enthusiasts'
                    },
                    {
                      icon: '🤝',
                      title: 'Community Engagement',
                      description: 'Connect directly with our passionate gaming community'
                    },
                    {
                      icon: '📱',
                      title: 'Digital Marketing',
                      description: 'Feature on website, social media, and promotional materials'
                    },
                    {
                      icon: '🎪',
                      title: 'Event Presence',
                      description: 'Booth space, banners, and on-site branding opportunities'
                    },
                    {
                      icon: '📊',
                      title: 'Analytics & Reports',
                      description: 'Detailed engagement metrics and partnership ROI reports'
                    },
                    {
                      icon: '🎁',
                      title: 'Custom Packages',
                      description: 'Tailored partnership packages to match your goals'
                    }
                  ].map((benefit, index) => (
                    <div 
                      key={index}
                      className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-transparent p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105 group"
                    >
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                      <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Our Team */}
              <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-transparent p-8 rounded-2xl border border-blue-500/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Contact Our Team
                </h3>

                <div className="space-y-4">
                  {/* Email */}
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Email us at</div>
                      <div className="text-white font-semibold group-hover:text-purple-400 transition-colors">{contactEmail}</div>
                    </div>
                  </a>

                  {/* Phone */}
                  <a 
                    href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Call us at</div>
                      <div className="text-white font-semibold group-hover:text-blue-400 transition-colors">{contactPhone}</div>
                    </div>
                  </a>

                  {/* WhatsApp */}
                  <a 
                    href={`https://wa.me/${contactWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">WhatsApp us</div>
                      <div className="text-white font-semibold group-hover:text-green-400 transition-colors">{contactPhone}</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Partnership Proposal Download */}
              <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-transparent p-8 rounded-2xl border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  Partnership Proposal
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Download our partnership brochure to learn more about collaboration opportunities, benefits, and detailed package information.
                </p>
                
                {partnershipBrochureUrl ? (
                  <a
                    href={partnershipBrochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Partnership Brochure (PDF)
                  </a>
                ) : (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 text-center">
                    <svg className="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-yellow-300 font-semibold mb-2">Partnership Brochure Coming Soon</p>
                    <p className="text-gray-400 text-sm">
                      The admin is currently setting up the partnership brochure. 
                      Please contact us directly for partnership information.
                    </p>
                  </div>
                )}
                <p className="text-gray-500 text-sm mt-3">Direct download • Partnership brochure with full details</p>
              </div>

              {/* Footer Message */}
              <div className="text-center pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm leading-relaxed">
                  We&apos;re excited about the possibility of working together! Our team typically responds within 24-48 hours. 
                  <span className="block mt-2 text-purple-400 font-semibold">Let&apos;s create something amazing together! 🚀</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

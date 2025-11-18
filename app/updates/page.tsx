'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import UpdateModal from '@/components/UpdateModal';
import { getPublishedUpdates } from '@/lib/supabase-queries';
import type { Update } from '@/lib/types/database';

// Dynamic imports for animations
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

export default function UpdatesPage() {
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        setLoading(true);
        const data = await getPublishedUpdates();
        setUpdates(data);
      } catch (error) {
        console.error('Error fetching updates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpdates();
  }, []);

  const handleUpdateClick = (update: Update) => {
    setSelectedUpdate(update);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selectedUpdate to allow modal exit animation
    setTimeout(() => setSelectedUpdate(null), 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 crt-effect">
      {/* Gaming Enhancements */}
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      
      {/* Header Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Latest Updates
            </h1>
            <p className="text-xl text-cyan-50 max-w-2xl mx-auto">
              Stay informed about club news, events, and announcements
            </p>
          </div>
        </div>
      </section>

      {/* Updates Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-20">
              <svg
                className="w-20 h-20 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Updates Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for the latest news and announcements!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {updates.map((update) => (
              <article
                key={update.id}
                onClick={() => handleUpdateClick(update)}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                {/* Card Header with image or gradient */}
                {update.image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={update.image_url}
                      alt={update.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
                )}

                {/* Card Content */}
                <div className="p-6">
                  {/* Date and Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <time dateTime={update.date}>{update.date}</time>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                    {update.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {update.summary}
                  </p>

                  {/* Action Buttons */}
                  {update.buttons && update.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {update.buttons.map((button, index) => (
                        <a
                          key={index}
                          href={button.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-xs font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          {button.name}
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Read More Link */}
                  <div className="flex items-center text-cyan-400 dark:text-cyan-400 font-semibold group-hover:text-cyan-500 dark:group-hover:text-cyan-300">
                    <span>Read Full Update</span>
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Card Footer - Visual indicator */}
                <div className="h-1 bg-gradient-to-r from-cyan-500 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </article>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <UpdateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        update={selectedUpdate}
      />
    </div>
  );
}

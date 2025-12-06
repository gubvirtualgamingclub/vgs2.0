'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getPublishedActivities } from '@/lib/supabase-queries';
import type { Activity } from '@/lib/types/database';

// Dynamic imports for better performance
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

  // Category colors
  const categoryColors: Record<string, string> = {
    Tournament: 'bg-cyan-500',
    'Social Event': 'bg-cyan-400',
    Workshop: 'bg-cyan-500',
    Seminar: 'bg-cyan-600',
    'Charity Event': 'bg-cyan-500',
  };

  const categories = ['Tournament', 'Social Event', 'Workshop', 'Seminar', 'Charity Event', 'Online Event', 'Offline Event'];
  const statuses = ['upcoming', 'ongoing', 'past', 'recurring'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 crt-effect">
      {/* Gaming Enhancements */}
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      
      {/* Header Section */}
      <section className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Activities & Events
            </h1>
            <p className="text-xl text-cyan-50 max-w-2xl mx-auto">
              Discover exciting gaming events, tournaments, workshops, and community gatherings
            </p>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {loading ? '...' : activities.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {loading ? '...' : tournamentCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tournaments</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {loading ? '...' : workshopCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Workshops</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                {loading ? '...' : upcomingCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-12">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search activities by title, description, or tags..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchTerm || filterStatus !== 'all' || filterCategory !== 'all') && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                      Search: {searchTerm}
                      <button onClick={() => setSearchTerm('')} className="hover:text-purple-900 dark:hover:text-purple-100">×</button>
                    </span>
                  )}
                  {filterStatus !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      Status: {filterStatus}
                      <button onClick={() => setFilterStatus('all')} className="hover:text-blue-900 dark:hover:text-blue-100">×</button>
                    </span>
                  )}
                  {filterCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                      Category: {filterCategory}
                      <button onClick={() => setFilterCategory('all')} className="hover:text-green-900 dark:hover:text-green-100">×</button>
                    </span>
                  )}
                </div>
              )}

              {/* Results count */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredActivities.length} of {activities.length} activities
              </div>
            </div>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Activities Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                  ? 'Try adjusting your filters or search terms' 
                  : 'Check back soon for exciting gaming events and activities!'}
              </p>
              {(searchTerm || filterStatus !== 'all' || filterCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterCategory('all');
                  }}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 overflow-hidden group-hover:opacity-90 transition-opacity aspect-video">
                  {activity.banner_image_url ? (
                    <Image
                      src={activity.banner_image_url}
                      alt={activity.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-20 h-20 text-white/30"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      activity.status === 'upcoming' ? 'bg-blue-600' :
                      activity.status === 'ongoing' ? 'bg-green-600' :
                      activity.status === 'past' ? 'bg-gray-600' :
                      activity.status === 'recurring' ? 'bg-yellow-600' :
                      'bg-purple-600'
                    }`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Tags or Category */}
                  <div className="mb-3">
                    {activity.tags && activity.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {activity.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all">
                            {tag}
                          </span>
                        ))}
                        {activity.tags.length > 2 && (
                          <span className="px-3 py-1.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full text-xs font-bold shadow-md">
                            +{activity.tags.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={`${categoryColors[activity.category] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs font-semibold inline-block`}>
                        {activity.category}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                    {activity.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                    {activity.short_description || activity.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4">
                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg
                        className="w-4 h-4 mr-2 text-purple-500"
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
                      <span>{activity.date}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{activity.time}</span>
                    </div>
                  </div>

                  {/* View Details Link */}
                  <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:text-purple-700 dark:group-hover:text-purple-300">
                    <span>View Details</span>
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
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}

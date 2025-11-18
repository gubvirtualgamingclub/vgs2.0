import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActivityBySlug } from '@/lib/supabase-queries';
import Image from 'next/image';

// Disable caching to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const categoryColors: Record<string, string> = {
  Tournament: 'bg-red-500',
  'Social Event': 'bg-blue-500',
  Workshop: 'bg-green-500',
  Seminar: 'bg-purple-500',
  'Charity Event': 'bg-pink-500',
};

export default async function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await Promise.resolve(params);
  const activity = await getActivityBySlug(slug);

  if (!activity) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Content */}
      <section className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 dark:from-purple-800 dark:via-purple-900 dark:to-indigo-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-white/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <Link href="/activities" className="hover:text-white transition-colors">
                  Activities
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li className="text-white">{activity.title}</li>
            </ol>
          </nav>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activity.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-white/95 text-purple-700 rounded-full text-sm font-bold shadow-lg border-2 border-white/50 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {activity.title}
          </h1>

          {/* Short Description */}
          {activity.short_description && (
            <div className="flex items-start gap-3 text-lg text-white/90 max-w-2xl">
              <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                {activity.short_description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Back Button */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/activities"
            className="inline-flex items-center gap-2 px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Activities
          </Link>
        </div>
      </section>

      {/* Banner Image Section */}
      {activity.banner_image_url && (
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={activity.banner_image_url}
                alt={activity.title}
                className="w-full h-auto object-cover aspect-video"
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-l-4 border-purple-600 p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">About This Event</h2>
                </div>
                <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {activity.description.split('\n\n').map((p, i) => (
                    <p key={i} className="text-base">{p}</p>
                  ))}
                </div>
              </div>

              {/* Guests Section */}
              {activity.guests && activity.guests.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-l-4 border-green-600 p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Speakers & Guests</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {activity.guests.map(guest => (
                      <div key={guest.name} className="text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                        <Image src={guest.photo || '/members/unknownMale.svg'} alt={guest.name} width={120} height={120} className="rounded-full mx-auto mb-3 object-cover w-24 h-24 ring-4 ring-green-200 dark:ring-green-900/50" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{guest.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{guest.designation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sponsors Section */}
              {activity.sponsors && activity.sponsors.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-l-4 border-yellow-600 p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Sponsors</h2>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-8 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    {activity.sponsors.map(sponsor => (
                      <a key={sponsor.id} href={sponsor.website} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                        <Image src={sponsor.logo} alt={sponsor.name} width={140} height={70} className="object-contain" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-t-4 border-blue-600">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Event Details</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Date */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.date}</p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.time}</p>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Venue</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.venue}</p>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Participants</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.participants}</p>
                      </div>
                    </div>
                  </div>

                  {/* Facebook Button */}
                  {activity.facebook_post_url && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <a href={activity.facebook_post_url} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        View on Facebook
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
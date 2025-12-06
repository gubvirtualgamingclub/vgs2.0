'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getTournamentWithGames } from '@/lib/supabase-queries';
import { Tournament, TournamentGame, Organization } from '@/lib/types/database';
import Image from 'next/image';

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
const ScrollAnimation = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.ScrollAnimation),
  { ssr: false }
);

// Seamless logo display component - no cards
function SeamlessLogo({ org }: { org: Organization }) {
  const isImageUrl = org.logo && (org.logo.startsWith('http') || org.logo.startsWith('/'));

  return (
    <div className="group relative h-20 w-full flex items-center justify-center hover:opacity-80 transition-opacity duration-300">
      {isImageUrl ? (
        <div className="relative w-full h-full">
          <Image 
            src={org.logo} 
            alt={org.name} 
            fill 
            className="object-contain group-hover:scale-105 transition-transform duration-300" 
            title={org.name}
          />
        </div>
      ) : (
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
          {org.name.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function GameCard({ game }: { game: TournamentGame }) {
  const categoryColors = {
    casual: 'from-blue-500 to-cyan-500',
    mobile: 'from-purple-500 to-pink-500',
    pc: 'from-orange-500 to-red-500',
  };

  const isRegistrationClosed = game.registration_status === 'closed';

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryColors[game.category]}`}>
          {game.category.toUpperCase()}
        </div>
        {isRegistrationClosed && (
          <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 animate-pulse">
            🔒 CLOSED
          </div>
        )}
      </div>

      {game.game_logo && (
        <div className={`relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden ${isRegistrationClosed ? 'opacity-60' : ''}`}>
          <Image src={game.game_logo} alt={game.game_name} fill className="object-contain p-6 group-hover:scale-110 transition-transform duration-300" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className={`text-3xl ${isRegistrationClosed ? 'opacity-50' : ''}`}>{game.icon}</span>
          <div className="flex-1">
            <h3 className={`text-xl font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${
              isRegistrationClosed 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {game.game_name}
            </h3>
            <p className={`text-sm mt-1 ${
              isRegistrationClosed 
                ? 'text-gray-500 dark:text-gray-500' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {game.description}
            </p>
          </div>
        </div>

        {isRegistrationClosed && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400 text-center font-semibold animate-fadeIn">
            ⏳ Registration is currently closed for this game
          </div>
        )}

        <div className={`space-y-2 mb-4 ${isRegistrationClosed ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">💰 Prize Pool:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{game.prize_pool}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">👥 Team Size:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{game.team_size}</span>
          </div>
          {game.format && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">🎯 Format:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{game.format}</span>
            </div>
          )}
          {game.schedule && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">📅 Schedule:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{game.schedule}</span>
            </div>
          )}
          {game.max_participants && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">🎮 Max Teams:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{game.max_participants}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {isRegistrationClosed ? (
            <button disabled className="flex-1 px-4 py-2 bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-semibold rounded-lg cursor-not-allowed text-center opacity-75">
              🔒 Registration Closed
            </button>
          ) : (
            <a href={game.registration_link} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 text-center">
              Register Now
            </a>
          )}
          <a href={game.rulebook_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
            📖 Rules
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TournamentsPage() {
  const [tournament, setTournament] = useState<(Tournament & { games: TournamentGame[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'casual' | 'mobile' | 'pc'>('all');

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

  const filteredGames = tournament?.games ? (activeCategory === 'all' ? tournament.games : tournament.games.filter((g) => g.category === activeCategory)) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament || tournament.status === 'closed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <ScrollProgressBar />
        <GamingCursor />
        <FloatingIcons />
        <div className="text-center px-4">
          <ScrollAnimation animation="fadeIn">
            <div className="mb-8"><span className="text-9xl">🎮</span></div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 glitch-text">No Tournament Right Now</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">We&rsquo;re currently preparing for our next epic gaming event. Stay tuned for announcements!</p>
            <div className="space-y-4">
              <p className="text-gray-400">Follow us on social media to get notified when registration opens</p>
              <a href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">Back to Home</a>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 crt-effect">
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />

      {/* BANNER SECTION - FULL WIDTH 1920x600 */}
      <section className="relative w-full h-[600px] max-h-[600px] overflow-hidden">
        {tournament.banner ? (
          <Image
            src={tournament.banner}
            alt="Tournament Banner"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-black"></div>
        )}
      </section>

      {/* TOURNAMENT INFO SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Left: Logo & Name & Slogan */}
            <div className="md:w-1/2 flex flex-col items-center md:items-start">
              {tournament.logo && (
                <div className="relative h-32 w-32 mb-8">
                  <Image
                    src={tournament.logo}
                    alt={tournament.name}
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
              )}
              
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 text-center md:text-left leading-tight glitch-text">
                {tournament.name}
              </h1>
              
              {tournament.slogan && (
                <p className="text-2xl text-purple-600 dark:text-purple-400 italic font-light text-center md:text-left mb-8">
                  &quot;{tournament.slogan}&quot;
                </p>
              )}
            </div>

            {/* Right: Quick Info Grid */}
            <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full">
              {/* Date */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wider">Date</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-2">{tournament.date}</div>
              </div>

              {/* Time */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-xs font-semibold text-green-600 dark:text-green-300 uppercase tracking-wider">Time</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-2">{tournament.time}</div>
              </div>

              {/* Venue */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="text-3xl mb-2">📍</div>
                <div className="text-xs font-semibold text-orange-600 dark:text-orange-300 uppercase tracking-wider">Venue</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-2">{tournament.venue}</div>
              </div>

              {/* Prize Pool */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-300 uppercase tracking-wider">Prize Pool</div>
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mt-2">{tournament.total_prize_pool}</div>
              </div>

              {/* Deadline - Full Width */}
              <div className="col-span-2 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <div className="text-xs font-semibold text-red-600 dark:text-red-300 uppercase tracking-wider">Registration Deadline</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">{new Date(tournament.registration_deadline).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT TOURNAMENT SECTION (HTML Template) */}
      {tournament.description && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <ScrollAnimation animation="slideUp">
              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  About Tournament
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
              </div>

              <div className="relative">
                {/* Modern card design for description */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 -z-10"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl opacity-50 -z-10"></div>

                  {/* Description content */}
                  <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    {tournament.description.includes('<') ? (
                      // If it contains HTML, render as HTML
                      <div 
                        dangerouslySetInnerHTML={{ __html: tournament.description }}
                        className="space-y-4"
                      />
                    ) : (
                      // Otherwise, render as plain text with line breaks preserved
                      <p className="whitespace-pre-wrap">{tournament.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>
      )}

      {/* ORGANIZERS & SPONSORS - SEAMLESS DESIGN */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Organized By */}
          {tournament.organizers && tournament.organizers.length > 0 && (
            <ScrollAnimation animation="slideUp">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="text-4xl">🎯</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Organized By</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {tournament.organizers.map((org, index) => (
                    <SeamlessLogo key={index} org={org} />
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}

          {/* Co-Organized By */}
          {tournament.co_organizers && tournament.co_organizers.length > 0 && (
            <ScrollAnimation animation="slideUp" delay={100}>
              <div className="pt-12 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-10">
                  <div className="text-4xl">🤝</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Co-Organized By</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {tournament.co_organizers.map((org, index) => (
                    <SeamlessLogo key={index} org={org} />
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}

          {/* Associated With */}
          {tournament.associated_with && tournament.associated_with.length > 0 && (
            <ScrollAnimation animation="slideUp" delay={200}>
              <div className="pt-12 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-10">
                  <div className="text-4xl">🏆</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Associated With</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {tournament.associated_with.map((org, index) => (
                    <SeamlessLogo key={index} org={org} />
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}

          {/* Sponsors */}
          {tournament.sponsors && tournament.sponsors.length > 0 && (
            <ScrollAnimation animation="slideUp" delay={300}>
              <div className="pt-12 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-10">
                  <div className="text-4xl">💎</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Our Sponsors</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {tournament.sponsors.map((org, index) => (
                    <SeamlessLogo key={index} org={org} />
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}
        </div>
      </section>

      {/* GAMES SECTION */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="slideUp">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Tournament Games</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Choose your battlefield and register now!</p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="slideUp" delay={100}>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { value: 'all', label: 'All Games', icon: '🎮' },
                { value: 'casual', label: 'Casual', icon: '🎲' },
                { value: 'mobile', label: 'Mobile', icon: '📱' },
                { value: 'pc', label: 'PC', icon: '��' },
              ].map((category) => (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value as any)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    activeCategory === category.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </ScrollAnimation>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGames.map((game, index) => (
                <ScrollAnimation key={game.id} animation="slideUp" delay={index * 100}>
                  <GameCard game={game} />
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎮</span>
              <p className="text-xl text-gray-600 dark:text-gray-400">No games in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

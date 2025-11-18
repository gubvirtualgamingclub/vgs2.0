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

function OrgLogo({ org, size = 'md' }: { org: Organization; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { 
    sm: 'h-16', 
    md: 'h-24', 
    lg: 'h-32' 
  };
  const isImageUrl = org.logo && (org.logo.startsWith('http') || org.logo.startsWith('/'));

  return (
    <div className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20">
      <div className={`relative ${sizeClasses[size]} w-full flex items-center justify-center mb-3`}>
        {isImageUrl ? (
          <div className="relative w-full h-full">
            <Image 
              src={org.logo} 
              alt={org.name} 
              fill 
              className="object-contain group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg" 
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            {org.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="text-center">
        <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
          {org.name}
        </span>
      </div>
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
}

function GameCard({ game }: { game: TournamentGame }) {
  const categoryColors = {
    casual: 'from-blue-500 to-cyan-500',
    mobile: 'from-purple-500 to-pink-500',
    pc: 'from-orange-500 to-red-500',
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryColors[game.category]} z-10`}>
        {game.category.toUpperCase()}
      </div>
      {game.game_logo && (
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          <Image src={game.game_logo} alt={game.game_name} fill className="object-contain p-6 group-hover:scale-110 transition-transform duration-300" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{game.icon}</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{game.game_name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{game.description}</p>
          </div>
        </div>
        <div className="space-y-2 mb-4">
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
          <a href={game.registration_link} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 text-center">Register Now</a>
          <a href={game.rulebook_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">📖 Rules</a>
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
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">We're currently preparing for our next epic gaming event. Stay tuned for announcements!</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 crt-effect">
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat animate-pulse"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="slideUp">
            <div className="text-center mb-12">
              {tournament.logo && (
                <div className="mb-8">
                  <Image src={tournament.logo} alt={tournament.name} width={200} height={200} className="mx-auto rounded-2xl shadow-2xl hover:scale-110 transition-transform duration-300" />
                </div>
              )}
              <h1 className="text-5xl md:text-7xl font-bold mb-4 glitch-text">{tournament.name}</h1>
              {tournament.slogan && (
                <p className="text-2xl md:text-3xl text-purple-300 mb-8 italic">{tournament.slogan}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-sm text-gray-300">Date</div>
                  <div className="font-bold">{tournament.date}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl mb-2">⏰</div>
                  <div className="text-sm text-gray-300">Time</div>
                  <div className="font-bold">{tournament.time}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl mb-2">📍</div>
                  <div className="text-sm text-gray-300">Venue</div>
                  <div className="font-bold">{tournament.venue}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-sm text-gray-300">Total Prize Pool</div>
                  <div className="font-bold text-green-400">{tournament.total_prize_pool}</div>
                </div>
              </div>
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 inline-block">
                <span className="font-semibold">⚠️ Registration Deadline: </span>
                <span className="text-red-300">{new Date(tournament.registration_deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="slideUp" delay={200}>
            <div className="mt-12 space-y-8">
              {tournament.organizers && tournament.organizers.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-purple-900/40 backdrop-blur-md border border-purple-500/30 p-8 shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🎯
                    </div>
                    <h3 className="text-2xl font-bold text-white">Organized By</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {tournament.organizers.map((org, index) => (<OrgLogo key={index} org={org} size="md" />))}
                  </div>
                </div>
              )}
              {tournament.co_organizers && tournament.co_organizers.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-cyan-900/40 to-blue-900/40 backdrop-blur-md border border-blue-500/30 p-8 shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🤝
                    </div>
                    <h3 className="text-2xl font-bold text-white">Co-Organized By</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {tournament.co_organizers.map((org, index) => (<OrgLogo key={index} org={org} size="md" />))}
                  </div>
                </div>
              )}
              {tournament.associated_with && tournament.associated_with.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/40 via-orange-900/40 to-amber-900/40 backdrop-blur-md border border-amber-500/30 p-8 shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🏆
                    </div>
                    <h3 className="text-2xl font-bold text-white">Associated With</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {tournament.associated_with.map((org, index) => (<OrgLogo key={index} org={org} size="md" />))}
                  </div>
                </div>
              )}
            </div>
          </ScrollAnimation>
        </div>
      </section>
      <section className="py-16">
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
                { value: 'pc', label: 'PC', icon: '💻' },
              ].map((category) => (
                <button key={category.value} onClick={() => setActiveCategory(category.value as any)} className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${activeCategory === category.value ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
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

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPublishedGames, getGameHistory } from '@/lib/supabase-queries';
import type { Game, GameHistory } from '@/lib/types/database';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'casual' | 'mobile' | 'pc'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (selectedGame) {
      fetchGameHistoryData(selectedGame.id);
    }
  }, [selectedGame]);

  async function fetchGames() {
    try {
      setLoading(true);
      const data = await getPublishedGames();
      setGames(data);
      setFilteredGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGameHistoryData(gameId: string) {
    try {
      setLoadingHistory(true);
      const history = await getGameHistory(gameId);
      setGameHistory(history);
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    let filtered = games;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(game => game.game_type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGames(filtered);
  }, [selectedType, searchTerm, games]);

  const gameTypeEmoji = {
    casual: '🎮',
    mobile: '📱',
    pc: '🖥️',
  };

  const gameTypeColors = {
    casual: 'from-blue-500 to-cyan-500',
    mobile: 'from-purple-500 to-pink-500',
    pc: 'from-orange-500 to-red-500',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              🎮 Game Profiles
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore all the amazing games hosted by VGS throughout our events
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div>
              <input
                type="text"
                placeholder="🔍 Search games by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedType === 'all'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All Games ({games.length})
              </button>

              {(['casual', 'mobile', 'pc'] as const).map((type) => {
                const count = games.filter(g => g.game_type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                      selectedType === type
                        ? `bg-gradient-to-r ${gameTypeColors[type]} text-white shadow-lg`
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span>{gameTypeEmoji[type]}</span>
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500"></div>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No games found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGames.map((game, index) => (
                <div
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className="group cursor-pointer h-full"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${gameTypeColors[game.game_type]} shadow-lg`}>
                        {gameTypeEmoji[game.game_type]} {game.game_type.toUpperCase()}
                      </span>
                    </div>

                    {/* Logo Container */}
                    <div className={`h-48 bg-gradient-to-br ${gameTypeColors[game.game_type]} p-6 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={game.logo_url}
                          alt={game.name}
                          width={160}
                          height={160}
                          className="object-contain max-w-full max-h-full filter drop-shadow-lg group-hover:drop-shadow-2xl transition-all"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"%3E%3Crect fill="%23ddd" width="160" height="160"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-500 transition-colors">
                        {game.name}
                      </h3>

                      {/* Game Mode Badge */}
                      {game.game_mode && (
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg text-indigo-300 text-sm font-semibold">
                            {game.game_mode === 'team' ? '👥 Team' : '🎮 Individual'}
                            {game.team_size && <span>• {game.team_size}</span>}
                          </span>
                        </div>
                      )}

                      <div className="flex-grow"></div>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGame(game);
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span>View Details</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal for Game Details */}
      {selectedGame && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedGame(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full my-4 max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div className={`relative h-32 sm:h-48 bg-gradient-to-br ${gameTypeColors[selectedGame.game_type]} p-4 sm:p-6 flex items-center justify-center flex-shrink-0`}>
              <button
                onClick={() => setSelectedGame(null)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="relative w-24 h-24 sm:w-40 sm:h-40">
                <Image
                  src={selectedGame.logo_url}
                  alt={selectedGame.name}
                  width={160}
                  height={160}
                  className="object-contain w-full h-full filter drop-shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"%3E%3Crect fill="%23ddd" width="160" height="160"/%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              {/* Title and Type */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedGame.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r ${gameTypeColors[selectedGame.game_type]}`}>
                    {gameTypeEmoji[selectedGame.game_type]} {selectedGame.game_type.toUpperCase()}
                  </span>
                  {selectedGame.game_mode && (
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                      {selectedGame.game_mode === 'team' ? '👥 Team' : '🎮 Individual'}
                      {selectedGame.team_size && ` • ${selectedGame.team_size}`}
                    </span>
                  )}
                  {selectedGame.max_participants && (
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                      Max: {selectedGame.max_participants} players
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1 sm:gap-2">
                    <span>🎯</span>
                    <span>Events Hosted</span>
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">{gameHistory.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1 sm:gap-2">
                    <span>👥</span>
                    <span>Total Participants</span>
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {gameHistory.reduce((sum, h) => sum + h.participants_count, 0)}
                  </p>
                </div>
              </div>

              {/* Event History */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span>📜</span>
                  <span>Event History</span>
                </h3>
                
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-500"></div>
                  </div>
                ) : gameHistory.length > 0 ? (
                  <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {gameHistory
                      .sort((a, b) => {
                        if (b.year !== a.year) return b.year - a.year;
                        return b.month - a.month;
                      })
                      .map((history, index) => {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return (
                          <div
                            key={history.id}
                            className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-slate-700 hover:border-cyan-500 transition-all hover:shadow-lg"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2 sm:mb-3">
                              <h4 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                                <span className="text-cyan-400">🎮</span>
                                <span className="line-clamp-2">{history.event_name}</span>
                              </h4>
                              <span className="px-2 sm:px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap self-start">
                                {monthNames[history.month - 1]} {history.year}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                              {history.participants_count > 0 && (
                                <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400 bg-blue-500/10 px-2 sm:px-3 py-1 rounded-lg">
                                  <span className="text-base sm:text-lg">👥</span>
                                  <span className="font-semibold">{history.participants_count} Participants</span>
                                </div>
                              )}
                              {history.prize_pool && (
                                <div className="flex items-center gap-1.5 sm:gap-2 text-green-400 bg-green-500/10 px-2 sm:px-3 py-1 rounded-lg">
                                  <span className="text-base sm:text-lg">💰</span>
                                  <span className="font-semibold">{history.prize_pool}</span>
                                </div>
                              )}
                              {history.event_link && (
                                <a
                                  href={history.event_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 sm:gap-2 text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 sm:px-3 py-1 rounded-lg transition-all"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-base sm:text-lg">🔗</span>
                                  <span className="font-semibold underline">View Event</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📭</div>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium px-4">
                      No event history available yet
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setGameHistory([]);
                }}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb);
        }
      `}</style>
    </div>
  );
}

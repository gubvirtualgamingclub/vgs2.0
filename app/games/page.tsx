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

    if (selectedType !== 'all') {
      filtered = filtered.filter(game => game.game_type === selectedType);
    }

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
    casual: 'from-blue-600 to-cyan-400',
    mobile: 'from-fuchsia-600 to-pink-400',
    pc: 'from-orange-600 to-red-400',
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 🌌 Hero Section (Premium Dark) */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
             <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-4">
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-6 shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-fadeIn">
              VGS Arsenal
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                Game Library
              </span>
            </h1>
            <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
              Explore our curated collection of competitive titles. From high-octane FPS to strategy classics, find your battleground.
            </p>
        </div>
      </section>

      {/* 🔍 Filters & Search (Glassmorphism) */}
      <section className="sticky top-20 z-40 py-6 border-b border-white/5 backdrop-blur-xl bg-[#050505]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
             
             {/* Filter Tabs */}
             <div className="flex p-1 bg-white/5 rounded-full border border-white/10 overflow-x-auto max-w-full no-scrollbar">
                {(['all', 'casual', 'mobile', 'pc'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                            selectedType === type
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40 scale-105'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {type === 'all' ? 'All Games' : type}
                    </button>
                ))}
             </div>

             {/* Search Input */}
             <div className="relative w-full md:w-96 group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-[#0a0a0a] rounded-xl flex items-center border border-white/10 focus-within:border-cyan-500/50 transition-colors">
                    <span className="pl-4 text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search for a game..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-sans px-4 py-3"
                    />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🎮 Games Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
             <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
             </div>
        ) : filteredGames.length === 0 ? (
             <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
                <div className="text-6xl mb-4 opacity-50">🕹️</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Games Found</h3>
                <p className="text-gray-500">Try adjusting your filters or search term.</p>
             </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredGames.map((game, index) => (
                    <div 
                        key={game.id}
                        onClick={() => setSelectedGame(game)}
                        className="group relative h-96 cursor-pointer perspective-1000"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Card Container */}
                        <div className="absolute inset-0 bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 group-hover:border-cyan-500/50 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(8,145,178,0.2)] group-hover:-translate-y-2">
                             
                             {/* Top Gradient/Image Area */}
                             <div className={`h-1/2 w-full relative overflow-hidden bg-gradient-to-br ${gameTypeColors[game.game_type]} opacity-10 group-hover:opacity-20 transition-opacity`}>
                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]"></div>
                             </div>

                             {/* Game Logo (Floating) */}
                             <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 drop-shadow-2xl z-10 transition-transform duration-500 group-hover:scale-110">
                                <Image
                                  src={game.logo_url}
                                  alt={game.name}
                                  width={192}
                                  height={192}
                                  className="object-contain w-full h-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"%3E%3Crect fill="%23222" width="160" height="160"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23555"%3ENo Logo%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                             </div>

                             {/* Content Overlay */}
                             <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent z-20 flex flex-col items-center text-center">
                                 {/* Type Badge */}
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${gameTypeColors[game.game_type]} mb-3 shadow-lg`}>
                                    {game.game_type}
                                 </span>
                                 
                                 <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{game.name}</h3>
                                 
                                 <div className="h-0 overflow-hidden group-hover:h-8 transition-all duration-300 delay-100 opacity-0 group-hover:opacity-100">
                                    <p className="text-cyan-400 font-bold text-sm tracking-widest uppercase">Click for Details</p>
                                 </div>
                             </div>

                        </div>
                    </div>
                ))}
             </div>
        )}
      </section>

      {/* ✨ Premium Modal */}
      {selectedGame && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedGame(null)}
        >
            {/* Backdrop with extensive blur */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fadeIn"></div>
            
            {/* Modal Card */}
            <div 
                className="relative w-full max-w-4xl bg-[#0f0f10] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header (Gradient Background) */}
                <div className={`relative h-48 bg-gradient-to-br ${gameTypeColors[selectedGame.game_type]} overflow-hidden`}>
                     <div className="absolute inset-0 bg-black/40"></div>
                     <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f10] to-transparent"></div>
                     
                     {/* Close Button */}
                     <button 
                        onClick={() => setSelectedGame(null)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors z-20 border border-white/10"
                     >
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>

                     <div className="absolute bottom-6 left-8 flex items-end gap-6 z-10 max-w-2xl">
                          <div className="w-24 h-24 bg-[#0f0f10] rounded-2xl p-2 border border-white/10 shadow-xl hidden sm:block">
                              <Image 
                                src={selectedGame.logo_url} 
                                alt={selectedGame.name} 
                                width={96} 
                                height={96} 
                                className="w-full h-full object-contain" 
                              />
                          </div>
                          <div>
                              <div className="flex gap-2 mb-2">
                                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-white">
                                      {gameTypeEmoji[selectedGame.game_type]} {selectedGame.game_type}
                                  </span>
                                  {selectedGame.game_mode && (
                                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-white">
                                          {selectedGame.game_mode}
                                      </span>
                                  )}
                              </div>
                              <h2 className="text-4xl font-black text-white leading-none">{selectedGame.name}</h2>
                          </div>
                     </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Left Stats Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Events</p>
                            <p className="text-3xl font-bold text-white">{gameHistory.length}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Participants</p>
                            <p className="text-3xl font-bold text-cyan-400">
                                {gameHistory.reduce((acc, curr) => acc + curr.participants_count, 0)}
                            </p>
                        </div>
                        {selectedGame.max_participants && (
                             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Max Per Match</p>
                                <p className="text-3xl font-bold text-white">{selectedGame.max_participants}</p>
                            </div>
                        )}
                    </div>

                    {/* Right History Column */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                            Tournament History
                        </h3>
                        
                        {loadingHistory ? (
                            <div className="space-y-4 animate-pulse">
                                {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl"></div>)}
                            </div>
                        ) : gameHistory.length > 0 ? (
                            <div className="space-y-4">
                                {gameHistory.map((history) => (
                                    <div key={history.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all">
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{history.event_name}</h4>
                                            <div className="flex gap-4 text-sm text-gray-400 mt-1">
                                                <span>📅 {history.month}/{history.year}</span>
                                                {history.participants_count > 0 && <span>👤 {history.participants_count} Players</span>}
                                            </div>
                                        </div>
                                        {history.prize_pool && (
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-gray-500 uppercase">Prize Pool</div>
                                                <div className="text-lg font-bold text-green-400">{history.prize_pool}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                No tournaments recorded yet.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
      `}</style>

    </div>
  );
}

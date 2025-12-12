'use client';

import AdminHelpButton from '@/components/AdminHelpButton';

import { useState, useEffect } from 'react';

import { 
  createGame, 
  updateGame, 
  deleteGame, 
  getAllGames,
  getGameHistory,
  createGameHistory,
  updateGameHistory,
  deleteGameHistory
} from '@/lib/supabase-queries';
import { Game, GameHistory } from '@/lib/types/database';
import { 
  PuzzlePieceIcon, 
  TrophyIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  game_type: 'casual' | 'mobile' | 'pc'; // Category
  game_mode?: 'team' | 'individual'; // Team or Individual
  team_size?: string; // 2v2, 3v3, 4v4, 5v5
  logo_url: string;
  is_published: boolean;
  display_order: number;
}

interface HistoryFormData {
  event_name: string;
  year: number;
  month: number;
  participants_count: number;
  prize_pool: string;
  event_link: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const initialFormData: FormData = {
  name: '',
  game_type: 'casual',
  logo_url: '',
  is_published: false,
  display_order: 0,
};

const initialHistoryFormData: HistoryFormData = {
  event_name: '',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  participants_count: 0,
  prize_pool: '',
  event_link: '',
};

const gameTypeColors = {
  casual: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  mobile: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  pc: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

export default function GamesAdminPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // History management states
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [historyFormData, setHistoryFormData] = useState<HistoryFormData>(initialHistoryFormData);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const result = await getAllGames();
      setGames(result);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
    setLoading(false);
  };

  const fetchGameHistory = async (gameId: string) => {
    try {
      const history = await getGameHistory(gameId);
      setGameHistory(history);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));

    if (name === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleHistoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setHistoryFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      logo_url: value,
    }));
    setLogoPreview(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Auto-generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create game data object with only the fields that exist in database
    const gameData: any = {
      name: formData.name,
      slug: slug,
      logo_url: formData.logo_url,
      logo_source: 'url',
      game_type: formData.game_type, // 'casual', 'mobile', 'pc'
      is_published: formData.is_published,
      display_order: formData.display_order,
      times_hosted: 0,
      participants_count: 0,
    };

    // Add optional fields only if they have values
    if (formData.game_mode) {
      gameData.game_mode = formData.game_mode;
    }
    if (formData.team_size) {
      gameData.team_size = formData.team_size;
    }

    try {
      if (editingId) {
        await updateGame(editingId, gameData);
        alert('Game updated successfully!');
      } else {
        await createGame(gameData);
        alert('Game created successfully!');
      }
      resetForm();
      fetchGames();
    } catch (error) {
      console.error('Error saving game:', error);
      alert(`Error saving game: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }

    setLoading(false);
  };

  const handleEdit = (game: Game) => {
    setEditingId(game.id);
    setFormData({
      name: game.name,
      game_type: game.game_type,
      game_mode: game.game_mode,
      team_size: game.team_size,
      logo_url: game.logo_url,
      is_published: game.is_published,
      display_order: game.display_order,
    });
    setLogoPreview(game.logo_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    setLoading(true);
    try {
      await deleteGame(id);
      alert('Game deleted successfully!');
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game. Please try again.');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setLogoPreview('');
  };

  // History Management Functions
  const openHistoryModal = async (gameId: string) => {
    setSelectedGameId(gameId);
    setShowHistoryModal(true);
    await fetchGameHistory(gameId);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedGameId(null);
    setGameHistory([]);
    setHistoryFormData(initialHistoryFormData);
    setEditingHistoryId(null);
  };

  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) return;

    try {
      if (editingHistoryId) {
        await updateGameHistory(editingHistoryId, historyFormData);
        alert('Event history updated successfully!');
      } else {
        await createGameHistory({
          game_id: selectedGameId,
          ...historyFormData,
        });
        alert('Event history added successfully!');
      }
      setHistoryFormData(initialHistoryFormData);
      setEditingHistoryId(null);
      await fetchGameHistory(selectedGameId);
    } catch (error) {
      console.error('Error saving history:', error);
      alert('Error saving history. Please try again.');
    }
  };

  const handleEditHistory = (history: GameHistory) => {
    setEditingHistoryId(history.id);
    setHistoryFormData({
      event_name: history.event_name,
      year: history.year,
      month: history.month,
      participants_count: history.participants_count,
      prize_pool: history.prize_pool || '',
      event_link: history.event_link || '',
    });
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event history?')) return;

    try {
      await deleteGameHistory(id);
      alert('Event history deleted successfully!');
      if (selectedGameId) {
        await fetchGameHistory(selectedGameId);
      }
    } catch (error) {
      console.error('Error deleting history:', error);
      alert('Error deleting history. Please try again.');
    }
  };

  const cancelEditHistory = () => {
    setHistoryFormData(initialHistoryFormData);
    setEditingHistoryId(null);
  };

  // Helper for input styles
  const inputClassName = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-gray-500 hover:bg-black/30";
  const labelClassName = "block text-sm font-medium text-gray-300 mb-2 ml-1";

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Games Library</h1>
          <p className="text-gray-400 text-lg">Curate and manage your gaming ecosystem</p>
        </div>
        {editingId && (
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition-all text-sm font-medium backdrop-blur-sm"
          >
            <XMarkIcon className="w-4 h-4" />
            Cancel Editing
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-1">
             <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <PuzzlePieceIcon className="w-6 h-6 text-purple-500" />
                  {editingId ? 'Edit Game' : 'Add New Game'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className={labelClassName}>Game Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={inputClassName}
                        placeholder="e.g. Valorant"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Game Type */}
                        <div>
                          <label className={labelClassName}>Category *</label>
                          <select
                            name="game_type"
                            value={formData.game_type}
                            onChange={handleInputChange}
                            className={inputClassName}
                          >
                            <option value="casual" className="bg-gray-800">Casual</option>
                            <option value="mobile" className="bg-gray-800">Mobile</option>
                            <option value="pc" className="bg-gray-800">PC</option>
                          </select>
                        </div>

                        {/* Display Order */}
                        <div>
                          <label className={labelClassName}>Order</label>
                          <input
                            type="number"
                            name="display_order"
                            value={formData.display_order}
                            onChange={handleInputChange}
                            className={inputClassName}
                            placeholder="0"
                          />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         {/* Game Mode */}
                        <div>
                          <label className={labelClassName}>Mode</label>
                          <select
                            name="game_mode"
                            value={formData.game_mode || ''}
                            onChange={handleInputChange}
                            className={inputClassName}
                          >
                            <option value="" className="bg-gray-800">Select</option>
                            <option value="team" className="bg-gray-800">Team</option>
                            <option value="individual" className="bg-gray-800">Individual</option>
                          </select>
                        </div>

                        {/* Team Size */}
                        <div>
                          <label className={labelClassName}>Size</label>
                          <select
                              name="team_size"
                              value={formData.team_size || ''}
                              onChange={handleInputChange}
                              disabled={formData.game_mode !== 'team'}
                              className={`${inputClassName} ${formData.game_mode !== 'team' && 'opacity-50 cursor-not-allowed'}`}
                            >
                              <option value="" className="bg-gray-800">Select</option>
                              <option value="2v2" className="bg-gray-800">2v2</option>
                              <option value="3v3" className="bg-gray-800">3v3</option>
                              <option value="4v4" className="bg-gray-800">4v4</option>
                              <option value="5v5" className="bg-gray-800">5v5</option>
                            </select>
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Logo</label>
                        <input
                          type="text"
                          value={formData.logo_url}
                          onChange={handleLogoChange}
                          required
                          className={inputClassName}
                          placeholder="Image URL"
                        />
                      </div>
                      {logoPreview && (
                        <div className="mt-2 flex justify-center bg-black/40 rounded-lg p-4 border border-white/5 border-dashed">
                          <img 
                            src={logoPreview} 
                            alt="Preview" 
                            className="h-20 max-w-full object-contain"
                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Publish Toggle */}
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="is_published"
                            checked={formData.is_published} 
                            onChange={handleInputChange}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                      </div>
                      <span className="text-gray-300 font-medium">Publish Game</span>
                    </label>

                    {/* Submit Buttons */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                          <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Saving...
                          </>
                      ) : (
                          <>
                            {editingId ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                            {editingId ? 'Update Game' : 'Add to Library'}
                          </>
                      )}
                    </button>
                </form>
             </div>
          </div>

          {/* Games List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
               <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <TrophyIcon className="w-5 h-5 text-yellow-500" />
                      <h2 className="text-lg font-bold text-white">All Games</h2>
                  </div>
                  <div className="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-gray-400 border border-white/5">
                      {games.length} Entries
                  </div>
               </div>

                {games.length === 0 ? (
                  <div className="p-12 text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PuzzlePieceIcon className="w-10 h-10 text-gray-600" />
                      </div>
                      <p className="text-gray-400 text-lg">No games found</p>
                      <p className="text-gray-600 text-sm">Add your first game to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-black/20 border-b border-white/5">
                          <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Game</th>
                          <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Details</th>
                          <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Status</th>
                          <th className="text-right py-4 px-6 text-gray-400 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {games.map((game) => (
                          <tr key={game.id} className="hover:bg-white/5 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 p-2 flex items-center justify-center">
                                    {game.logo_url ? (
                                      <img
                                        src={game.logo_url}
                                        alt={game.name}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    ) : (
                                        <PuzzlePieceIcon className="w-6 h-6 text-gray-600" />
                                    )}
                                </div>
                                <div>
                                    <span className="text-white font-bold block">{game.name}</span>
                                    <span className="text-xs text-gray-500">Order: {game.display_order}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                  <span
                                    className={`self-start inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${
                                      gameTypeColors[game.game_type]
                                    }`}
                                  >
                                    {game.game_type}
                                  </span>
                                  {game.game_mode && (
                                     <span className="text-xs text-gray-400">
                                        {game.game_mode} {game.team_size && `• ${game.team_size}`}
                                     </span>
                                  )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${game.is_published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${game.is_published ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                                {game.is_published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openHistoryModal(game.id)}
                                  className="p-2 bg-white/5 text-gray-300 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                                  title="View History"
                                >
                                  <CalendarDaysIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleEdit(game)}
                                  className="p-2 bg-white/5 text-gray-300 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                  title="Edit Game"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(game.id)}
                                  className="p-2 bg-white/5 text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                  title="Delete Game"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">Event History</h2>
              </div>
              <button
                onClick={closeHistoryModal}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* History Form */}
                <form onSubmit={handleHistorySubmit} className="mb-8 p-6 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {editingHistoryId ? <PencilIcon className="w-4 h-4 text-purple-400"/> : <PlusIcon className="w-4 h-4 text-green-400"/>}
                        {editingHistoryId ? 'Edit Event' : 'Add New Event'}
                      </h3>
                      {editingHistoryId && (
                           <button onClick={cancelEditHistory} type="button" className="text-xs text-red-300 hover:underline">Cancel</button>
                      )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className={labelClassName}>Event Name *</label>
                      <input
                        type="text"
                        name="event_name"
                        value={historyFormData.event_name}
                        onChange={handleHistoryInputChange}
                        required
                        className={inputClassName}
                        placeholder="e.g. VGS Winter Championship 2025"
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Year *</label>
                      <input
                        type="number"
                        name="year"
                        value={historyFormData.year}
                        onChange={handleHistoryInputChange}
                        required
                        min="2000"
                        max="2100"
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>Month *</label>
                      <select
                        name="month"
                        value={historyFormData.month}
                        onChange={handleHistoryInputChange}
                        required
                        className={inputClassName}
                      >
                        {MONTH_NAMES.map((month, index) => (
                          <option key={index + 1} value={index + 1} className="bg-gray-800">
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClassName}>Participants</label>
                      <div className="relative">
                           <UserGroupIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                           <input
                            type="number"
                            name="participants_count"
                            value={historyFormData.participants_count}
                            onChange={handleHistoryInputChange}
                            min="0"
                            className={`${inputClassName} pl-10`}
                            placeholder="0"
                          />
                      </div>
                    </div>

                    <div>
                      <label className={labelClassName}>Prize Pool</label>
                       <div className="relative">
                           <BanknotesIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                           <input
                            type="text"
                            name="prize_pool"
                            value={historyFormData.prize_pool}
                            onChange={handleHistoryInputChange}
                            className={`${inputClassName} pl-10`}
                            placeholder="e.g. ৳50,000"
                          />
                       </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClassName}>Event Link</label>
                      <div className="relative">
                           <ArrowTopRightOnSquareIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                           <input
                            type="url"
                            name="event_link"
                            value={historyFormData.event_link}
                            onChange={handleHistoryInputChange}
                            className={`${inputClassName} pl-10`}
                            placeholder="https://..."
                          />
                      </div>
                    </div>
                  </div>

                  <button
                      type="submit"
                      className="mt-6 w-full py-3 bg-cyan-600/80 hover:bg-cyan-600 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-cyan-900/30"
                    >
                      {editingHistoryId ? 'Update Event Record' : 'Add Event to History'}
                  </button>
                </form>

                {/* History List */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 pl-1">Past Events Timeline</h3>
                  {gameHistory.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <CalendarDaysIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No event history found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {gameHistory.map((history) => (
                        <div
                          key={history.id}
                          className="bg-black/40 rounded-xl p-5 border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden"
                        >
                           <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
                           <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-white font-bold text-lg">{history.event_name}</h4>
                              <p className="text-cyan-400 text-sm font-medium mt-1 flex items-center gap-2">
                                <CalendarDaysIcon className="w-4 h-4" />
                                {MONTH_NAMES[history.month - 1]} {history.year}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                {history.participants_count > 0 && (
                                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                    <UserGroupIcon className="w-4 h-4" />
                                    {history.participants_count} Players
                                  </span>
                                )}
                                {history.prize_pool && (
                                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/20">
                                    <BanknotesIcon className="w-4 h-4" />
                                    {history.prize_pool}
                                  </span>
                                )}
                                {history.event_link && (
                                  <a
                                    href={history.event_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                                  >
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    External Link
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditHistory(history)}
                                className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteHistory(history.id)}
                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Built-in Instructions Menu (static) */}
      <AdminHelpButton
        title="🎮 Games Library Management Instructions"
        instructions={[
          "Add games to the VGS library",
          "Upload game cover images",
          "Write game descriptions",
          "Categorize games by type",
          "Set game popularity/featured status"
        ]}
        tips={[
          "Use official game artwork when possible",
          "Write engaging descriptions",
          "Tag games accurately for filtering"
        ]}
        actions={[
          {
            title: "🕹️ Usage Guide",
            description: "Add Game: Create new game entry\nEdit Game: Modify game details\nDelete Game: Remove game"
          }
        ]}
      />
      
      <style jsx global>{`
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
            animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

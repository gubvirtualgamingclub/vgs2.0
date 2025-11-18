'use client';

import { useState, useEffect } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
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
  casual: 'bg-blue-500',
  mobile: 'bg-purple-500',
  pc: 'bg-orange-500',
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Games Management</h1>
          <p className="text-gray-400 mt-2">Create, update, and manage your game profiles</p>
        </div>
        {editingId && (
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel Editing
          </button>
        )}
      </div>

      {/* Form Section */}
      <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">
          {editingId ? 'Edit Game' : 'Add New Game'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Game Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                placeholder="Enter game name"
              />
            </div>

            {/* Game Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Game Category *</label>
              <select
                name="game_type"
                value={formData.game_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="casual">Casual</option>
                <option value="mobile">Mobile</option>
                <option value="pc">PC</option>
              </select>
            </div>

            {/* Game Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Game Mode</label>
              <select
                name="game_mode"
                value={formData.game_mode || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select mode</option>
                <option value="team">Team</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            {/* Team Size - Only show when game_mode is 'team' */}
            {formData.game_mode === 'team' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Size</label>
                <select
                  name="team_size"
                  value={formData.team_size || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select size</option>
                  <option value="2v2">2v2</option>
                  <option value="3v3">3v3</option>
                  <option value="4v4">4v4</option>
                  <option value="5v5">5v5</option>
                  <option value="6v6">6v6</option>
                </select>
              </div>
            )}

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="border border-gray-700 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Logo URL or Path *</label>
              <p className="text-sm text-gray-500 mb-3">Enter a URL (https://...) or file path (/games/logo.png)</p>
              <input
                type="text"
                value={formData.logo_url}
                onChange={handleLogoChange}
                required
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                placeholder="https://example.com/logo.png or /games/logo.png"
              />
            </div>

            {logoPreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Preview:</p>
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="h-32 w-32 object-contain rounded-lg bg-gray-700 p-2"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                  }}
                />
              </div>
            )}
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={formData.is_published}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <label htmlFor="is_published" className="text-gray-300">
              Publish this game
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update Game' : 'Create Game'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Games Table */}
      <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Games List</h2>

        {loading ? (
          <p className="text-gray-400">Loading games...</p>
        ) : games.length === 0 ? (
          <p className="text-gray-400">No games yet. Create your first game above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">Name</th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">Type</th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">Order</th>
                  <th className="text-right py-4 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {game.logo_url && (
                          <img
                            src={game.logo_url}
                            alt={game.name}
                            className="h-8 w-8 object-contain rounded"
                          />
                        )}
                        <span className="text-white font-medium">{game.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          gameTypeColors[game.game_type]
                        }`}
                      >
                        {game.game_type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-sm ${game.is_published ? 'text-green-400' : 'text-gray-400'}`}>
                        {game.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{game.display_order}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openHistoryModal(game.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          History
                        </button>
                        <button
                          onClick={() => handleEdit(game)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(game.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Delete
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Event History</h2>
              <button
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* History Form */}
            <form onSubmit={handleHistorySubmit} className="mb-8 p-6 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingHistoryId ? 'Edit Event' : 'Add Event'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Name *</label>
                  <input
                    type="text"
                    name="event_name"
                    value={historyFormData.event_name}
                    onChange={handleHistoryInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., VGS Inter University Gaming Fest"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={historyFormData.year}
                    onChange={handleHistoryInputChange}
                    required
                    min="2000"
                    max="2100"
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Month *</label>
                  <select
                    name="month"
                    value={historyFormData.month}
                    onChange={handleHistoryInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    {MONTH_NAMES.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Participants Count</label>
                  <input
                    type="number"
                    name="participants_count"
                    value={historyFormData.participants_count}
                    onChange={handleHistoryInputChange}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                    placeholder="Total participants"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prize Pool</label>
                  <input
                    type="text"
                    name="prize_pool"
                    value={historyFormData.prize_pool}
                    onChange={handleHistoryInputChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., ৳50,000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Link</label>
                  <input
                    type="url"
                    name="event_link"
                    value={historyFormData.event_link}
                    onChange={handleHistoryInputChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500"
                    placeholder="https://facebook.com/... or website link"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  {editingHistoryId ? 'Update Event' : 'Add Event'}
                </button>
                {editingHistoryId && (
                  <button
                    type="button"
                    onClick={cancelEditHistory}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* History List */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Past Events</h3>
              {gameHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No event history yet. Add one above.</p>
              ) : (
                <div className="space-y-4">
                  {gameHistory.map((history) => (
                    <div
                      key={history.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-lg">{history.event_name}</h4>
                          <p className="text-gray-400 text-sm mt-1">
                            {MONTH_NAMES[history.month - 1]} {history.year}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm">
                            {history.participants_count > 0 && (
                              <span className="text-cyan-400">
                                👥 {history.participants_count} Participants
                              </span>
                            )}
                            {history.prize_pool && (
                              <span className="text-green-400">
                                💰 {history.prize_pool}
                              </span>
                            )}
                            {history.event_link && (
                              <a
                                href={history.event_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                🔗 Event Link
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditHistory(history)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(history.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Delete
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
      )}

      <AdminHelpButton
        title="Games Library Management"
        instructions={[
          'Add games to the VGS library',
          'Upload game cover images',
          'Write game descriptions',
          'Categorize games by type',
          'Set game popularity/featured status'
        ]}
        tips={[
          'Use official game artwork when possible',
          'Write engaging descriptions',
          'Tag games accurately for filtering'
        ]}
        actions={[
          { label: 'Add Game', description: 'create new game entry' },
          { label: 'Edit Game', description: 'modify game details' },
          { label: 'Delete Game', description: 'remove from library' }
        ]}
      />
    </div>
  );
}

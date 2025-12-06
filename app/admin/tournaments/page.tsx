'use client';

import { useState, useEffect } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
import AnimatedToggle from '@/components/AnimatedToggle';
import ImageInputWithPreview from '@/components/ImageInputWithPreview';
import { 
  getActiveTournament, 
  updateTournament, 
  toggleTournamentStatus,
  getTournamentGames,
  createTournamentGame,
  updateTournamentGame,
  deleteTournamentGame
} from '@/lib/supabase-queries';
import type { Tournament, TournamentGame, Organization } from '@/lib/types/database';

export default function TournamentManagementPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [games, setGames] = useState<TournamentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'games'>('info');
  
  // Tournament form state
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    logo: '',
    banner: '',
    banner_source: 'url' as 'url' | 'path',
    description: '',
    date: '',
    time: '',
    venue: '',
    total_prize_pool: '',
    registration_deadline: '',
    status: 'closed' as 'open' | 'closed'
  });

  // Organizations state
  const [organizers, setOrganizers] = useState<Organization[]>([]);
  const [coOrganizers, setCoOrganizers] = useState<Organization[]>([]);
  const [associatedWith, setAssociatedWith] = useState<Organization[]>([]);
  const [sponsors, setSponsors] = useState<Organization[]>([]);

  // Organization form states
  const [orgFormOpen, setOrgFormOpen] = useState<'organizers' | 'coOrganizers' | 'associatedWith' | 'sponsors' | null>(null);
  const [orgFormData, setOrgFormData] = useState({ name: '', logo: '', logo_source: 'url' as 'url' | 'path' });

  // Game form state
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<TournamentGame | null>(null);
  const [gameFormData, setGameFormData] = useState({
    game_name: '',
    game_logo: '',
    category: 'casual' as 'casual' | 'mobile' | 'pc',
    icon: '🎮',
    description: '',
    prize_pool: '',
    team_size: '',
    format: '',
    schedule: '',
    max_participants: '',
    registration_link: '',
    rulebook_link: '',
    order_index: 0
  });

  useEffect(() => {
    loadTournament();
  }, []);

  const loadTournament = async () => {
    try {
      setLoading(true);
      const tournamentData = await getActiveTournament();
      
      if (tournamentData) {
        setTournament(tournamentData);
        setFormData({
          name: tournamentData.name,
          slogan: tournamentData.slogan || '',
          logo: tournamentData.logo || '',
          banner: tournamentData.banner || '',
          banner_source: (tournamentData.banner_source as 'url' | 'path') || 'url',
          description: tournamentData.description || '',
          date: tournamentData.date,
          time: tournamentData.time,
          venue: tournamentData.venue,
          total_prize_pool: tournamentData.total_prize_pool,
          registration_deadline: tournamentData.registration_deadline.split('T')[0],
          status: tournamentData.status
        });
        setOrganizers(tournamentData.organizers || []);
        setCoOrganizers(tournamentData.co_organizers || []);
        setAssociatedWith(tournamentData.associated_with || []);
        setSponsors(tournamentData.sponsors || []);

        // Load games
        const gamesData = await getTournamentGames(tournamentData.id);
        setGames(gamesData);
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
      alert('Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTournament = async () => {
    if (!tournament) return;

    try {
      setSaving(true);
      await updateTournament(tournament.id, {
        ...formData,
        organizers,
        co_organizers: coOrganizers,
        associated_with: associatedWith,
        sponsors
      });
      alert('Tournament updated successfully!');
      loadTournament();
    } catch (error) {
      console.error('Error saving tournament:', error);
      alert('Failed to save tournament');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!tournament) return;

    const newStatus = tournament.status === 'open' ? 'closed' : 'open';
    try {
      await toggleTournamentStatus(tournament.id, newStatus);
      alert(`Tournament is now ${newStatus}!`);
      loadTournament();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to change tournament status');
    }
  };

  const handleToggleGameRegistration = async (gameId: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await updateTournamentGame(gameId, { registration_status: newStatus as any });
      loadTournament();
    } catch (error) {
      console.error('Error toggling game registration:', error);
      alert('Failed to change game registration status');
    }
  };

  // Organization management functions
  const openOrgForm = (type: 'organizers' | 'coOrganizers' | 'associatedWith' | 'sponsors') => {
    setOrgFormOpen(type);
    setOrgFormData({ name: '', logo: '', logo_source: 'url' });
  };

  const handleSaveOrganization = () => {
    if (!orgFormData.name || !orgFormData.logo) {
      alert('Please fill in both name and logo');
      return;
    }
    
    const newOrg: Organization = { name: orgFormData.name, logo: orgFormData.logo };
    if (orgFormOpen === 'organizers') setOrganizers([...organizers, newOrg]);
    else if (orgFormOpen === 'coOrganizers') setCoOrganizers([...coOrganizers, newOrg]);
    else if (orgFormOpen === 'associatedWith') setAssociatedWith([...associatedWith, newOrg]);
    else if (orgFormOpen === 'sponsors') setSponsors([...sponsors, newOrg]);
    
    setOrgFormOpen(null);
    setOrgFormData({ name: '', logo: '', logo_source: 'url' });
  };

  const removeOrganization = (type: 'organizers' | 'coOrganizers' | 'associatedWith' | 'sponsors', index: number) => {
    if (type === 'organizers') setOrganizers(organizers.filter((_, i) => i !== index));
    else if (type === 'coOrganizers') setCoOrganizers(coOrganizers.filter((_, i) => i !== index));
    else if (type === 'associatedWith') setAssociatedWith(associatedWith.filter((_, i) => i !== index));
    else if (type === 'sponsors') setSponsors(sponsors.filter((_, i) => i !== index));
  };

  // Game management functions
  const openGameForm = (game?: TournamentGame) => {
    if (game) {
      setEditingGame(game);
      setGameFormData({
        game_name: game.game_name,
        game_logo: game.game_logo || '',
        category: game.category,
        icon: game.icon,
        description: game.description,
        prize_pool: game.prize_pool,
        team_size: game.team_size,
        format: game.format || '',
        schedule: game.schedule || '',
        max_participants: game.max_participants || '',
        registration_link: game.registration_link,
        rulebook_link: game.rulebook_link,
        order_index: game.order_index || 0
      });
    } else {
      setEditingGame(null);
      setGameFormData({
        game_name: '',
        game_logo: '',
        category: 'casual',
        icon: '🎮',
        description: '',
        prize_pool: '',
        team_size: '',
        format: '',
        schedule: '',
        max_participants: '',
        registration_link: '',
        rulebook_link: '',
        order_index: games.length
      });
    }
    setGameFormOpen(true);
  };

  const handleSaveGame = async () => {
    if (!tournament) return;

    try {
      setSaving(true);
      if (editingGame) {
        await updateTournamentGame(editingGame.id, gameFormData);
        alert('Game updated successfully!');
      } else {
        await createTournamentGame({
          tournament_id: tournament.id,
          ...gameFormData
        } as any);
        alert('Game added successfully!');
      }
      setGameFormOpen(false);
      loadTournament();
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      await deleteTournamentGame(gameId);
      loadTournament();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game');
    }
  };

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tournament...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No tournament found. Please run the migration first.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sticky Glassy Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tournament Management</h1>
              <p className="text-sm text-gray-400">Manage your single active tournament and its games</p>
            </div>
            {/* Status Badge */}
            <div className="flex items-center gap-4">
              <AnimatedToggle
                isOn={tournament.status === 'open'}
                onToggle={(isOpen) => handleToggleStatus()}
                label="Tournament Status"
                onLabel="Open"
                offLabel="Closed"
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'info'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tournament Info
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'games'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Games ({games.length})
          </button>
        </div>

        {/* Tournament Info Tab */}
        {activeTab === 'info' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Tournament Information</h2>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tournament Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slogan</label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Logo Path/URL</label>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    placeholder="/images/tournament-logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    placeholder="December 15-17, 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    placeholder="9:00 AM - 8:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Venue *</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Total Prize Pool *</label>
                  <input
                    type="text"
                    value={formData.total_prize_pool}
                    onChange={(e) => setFormData({ ...formData, total_prize_pool: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    placeholder="$5,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Registration Deadline *</label>
                  <input
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div className="mt-6">
                <ImageInputWithPreview
                  label="Tournament Banner Image"
                  value={formData.banner}
                  sourceType={formData.banner_source}
                  onValueChange={(value) => setFormData({ ...formData, banner: value })}
                  onSourceChange={(source) => setFormData({ ...formData, banner_source: source })}
                  minHeight="h-48"
                  helpText="Upload a stunning banner for the tournament header. Recommended: 1920x600px"
                />
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Tournament Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write a creative and engaging description of your tournament. Include what makes it special, the gaming vibe, and what participants can expect..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  rows={6}
                />
                
                {/* HTML Template Instructions */}
                <div className="mt-3 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                  <p className="text-xs text-blue-200 font-semibold mb-2">💡 HTML Template Support:</p>
                  <p className="text-xs text-blue-100 mb-3">You can write plain text OR use HTML templates for formatted content:</p>
                  <div className="space-y-2 text-xs text-blue-100 bg-gray-900/50 p-3 rounded font-mono mb-3">
                    <div><span className="text-green-400">&lt;h2&gt;</span>Tournament Highlights<span className="text-green-400">&lt;/h2&gt;</span></div>
                    <div><span className="text-green-400">&lt;p&gt;</span>This is a paragraph...<span className="text-green-400">&lt;/p&gt;</span></div>
                    <div><span className="text-green-400">&lt;ul&gt;</span></div>
                    <div className="ml-4"><span className="text-green-400">&lt;li&gt;</span>Feature 1<span className="text-green-400">&lt;/li&gt;</span></div>
                    <div className="ml-4"><span className="text-green-400">&lt;li&gt;</span>Feature 2<span className="text-green-400">&lt;/li&gt;</span></div>
                    <div><span className="text-green-400">&lt;/ul&gt;</span></div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded">
                    <p className="text-xs text-yellow-300 font-semibold mb-1">✓ Supported HTML Tags:</p>
                    <p className="text-xs text-blue-100">&lt;h1-h6&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;img&gt;, &lt;br&gt;, &lt;table&gt;, &lt;thead&gt;, &lt;tbody&gt;, &lt;tr&gt;, &lt;td&gt;, &lt;th&gt;</p>
                  </div>
                </div>
              </div>

              {/* Organizers */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-lg font-semibold">Organizers</label>
                  <button
                    onClick={() => openOrgForm('organizers')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                  >
                    + Add Organizer
                  </button>
                </div>
                
                {/* Inline Add Form */}
                {orgFormOpen === 'organizers' && (
                  <div className="mb-3 bg-gray-700/50 p-4 rounded-lg border-2 border-green-500/50">
                    <h4 className="font-semibold mb-3 text-green-400">Add New Organizer</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Organization Name"
                        value={orgFormData.name}
                        onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Logo Path or URL"
                        value={orgFormData.logo}
                        onChange={(e) => setOrgFormData({ ...orgFormData, logo: e.target.value })}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveOrganization}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setOrgFormOpen(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {organizers.map((org, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                      <img src={org.logo} alt={org.name} className="w-12 h-12 object-contain rounded" />
                      <div className="flex-1">
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-gray-400 truncate">{org.logo}</p>
                      </div>
                      <button
                        onClick={() => removeOrganization('organizers', index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Co-Organizers */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-lg font-semibold">Co-Organizers</label>
                  <button
                    onClick={() => openOrgForm('coOrganizers')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                  >
                    + Add Co-Organizer
                  </button>
                </div>
                
                {/* Inline Add Form */}
                {orgFormOpen === 'coOrganizers' && (
                  <div className="mb-3 bg-gray-700/50 p-4 rounded-lg border-2 border-green-500/50">
                    <h4 className="font-semibold mb-3 text-green-400">Add New Co-Organizer</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Organization Name"
                        value={orgFormData.name}
                        onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Logo Path or URL"
                        value={orgFormData.logo}
                        onChange={(e) => setOrgFormData({ ...orgFormData, logo: e.target.value })}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveOrganization}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setOrgFormOpen(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {coOrganizers.map((org, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                      <img src={org.logo} alt={org.name} className="w-12 h-12 object-contain rounded" />
                      <div className="flex-1">
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-gray-400 truncate">{org.logo}</p>
                      </div>
                      <button
                        onClick={() => removeOrganization('coOrganizers', index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associated With */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-lg font-semibold">Associated With</label>
                  <button
                    onClick={() => openOrgForm('associatedWith')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                  >
                    + Add Association
                  </button>
                </div>
                
                {/* Inline Add Form */}
                {orgFormOpen === 'associatedWith' && (
                  <div className="mb-3 bg-gray-700/50 p-4 rounded-lg border-2 border-green-500/50">
                    <h4 className="font-semibold mb-3 text-green-400">Add New Association</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Organization Name"
                        value={orgFormData.name}
                        onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Logo Path or URL"
                        value={orgFormData.logo}
                        onChange={(e) => setOrgFormData({ ...orgFormData, logo: e.target.value })}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveOrganization}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setOrgFormOpen(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {associatedWith.map((org, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                      <img src={org.logo} alt={org.name} className="w-12 h-12 object-contain rounded" />
                      <div className="flex-1">
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-gray-400 truncate">{org.logo}</p>
                      </div>
                      <button
                        onClick={() => removeOrganization('associatedWith', index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sponsors */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-lg font-semibold">💰 Sponsors (Optional)</label>
                  <button
                    onClick={() => openOrgForm('sponsors')}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm"
                  >
                    + Add Sponsor
                  </button>
                </div>
                
                {/* Inline Add Form */}
                {orgFormOpen === 'sponsors' && (
                  <div className="mb-3 bg-gray-700/50 p-4 rounded-lg border-2 border-yellow-500/50">
                    <h4 className="font-semibold mb-3 text-yellow-400">Add New Sponsor</h4>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Sponsor Name"
                        value={orgFormData.name}
                        onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mb-3"
                      />
                      <ImageInputWithPreview
                        label="Sponsor Logo"
                        value={orgFormData.logo}
                        sourceType={orgFormData.logo_source}
                        onValueChange={(value) => setOrgFormData({ ...orgFormData, logo: value })}
                        onSourceChange={(source) => setOrgFormData({ ...orgFormData, logo_source: source })}
                        minHeight="h-24"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveOrganization}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm"
                      >
                        Save Sponsor
                      </button>
                      <button
                        onClick={() => setOrgFormOpen(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sponsors.map((org, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition">
                      <div className="w-full h-16 flex items-center justify-center bg-gray-800 rounded">
                        <img src={org.logo} alt={org.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 w-full text-center">
                        <p className="font-medium text-sm line-clamp-2">{org.name}</p>
                      </div>
                      <button
                        onClick={() => removeOrganization('sponsors', index)}
                        className="text-red-500 hover:text-red-400 text-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                
                {sponsors.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No sponsors added yet. Click "+ Add Sponsor" to add sponsors.
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="mt-8">
                <button
                  onClick={handleSaveTournament}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Tournament Info'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tournament Games</h2>
              <button
                onClick={() => openGameForm()}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
              >
                + Add New Game
              </button>
            </div>

            {/* Games List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <div key={game.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start gap-3 mb-3">
                    {game.game_logo && (
                      <img src={game.game_logo} alt={game.game_name} className="w-16 h-16 object-contain rounded" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{game.game_name}</h3>
                      <span className="text-sm text-gray-400 capitalize">{game.category}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <p><strong>Prize:</strong> {game.prize_pool}</p>
                    <p><strong>Team Size:</strong> {game.team_size}</p>
                    {game.format && <p><strong>Format:</strong> {game.format}</p>}
                    {game.schedule && <p><strong>Schedule:</strong> {game.schedule}</p>}
                  </div>

                  {/* Registration Status Toggle */}
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <AnimatedToggle
                      isOn={game.registration_status !== 'closed'}
                      onToggle={(isOpen) => handleToggleGameRegistration(game.id, game.registration_status)}
                      label="Registration Status"
                      onLabel="Open"
                      offLabel="Closed"
                      size="sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openGameForm(game)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(game.id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {games.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl mb-2">No games added yet</p>
                <p>Click "Add New Game" to add games to this tournament</p>
              </div>
            )}
          </div>
        )}

        {/* Game Form Modal */}
        {gameFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Game Name *</label>
                    <input
                      type="text"
                      value={gameFormData.game_name}
                      onChange={(e) => setGameFormData({ ...gameFormData, game_name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      value={gameFormData.category}
                      onChange={(e) => setGameFormData({ ...gameFormData, category: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="casual">Casual</option>
                      <option value="mobile">Mobile</option>
                      <option value="pc">PC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Game Logo</label>
                    <input
                      type="text"
                      value={gameFormData.game_logo}
                      onChange={(e) => setGameFormData({ ...gameFormData, game_logo: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      placeholder="/images/pubg-logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Icon</label>
                    <input
                      type="text"
                      value={gameFormData.icon}
                      onChange={(e) => setGameFormData({ ...gameFormData, icon: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Prize Pool *</label>
                    <input
                      type="text"
                      value={gameFormData.prize_pool}
                      onChange={(e) => setGameFormData({ ...gameFormData, prize_pool: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      placeholder="$1,000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Team Size *</label>
                    <input
                      type="text"
                      value={gameFormData.team_size}
                      onChange={(e) => setGameFormData({ ...gameFormData, team_size: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      placeholder="Squad (4 players)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Format</label>
                    <input
                      type="text"
                      value={gameFormData.format}
                      onChange={(e) => setGameFormData({ ...gameFormData, format: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      placeholder="Battle Royale"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Schedule</label>
                    <input
                      type="text"
                      value={gameFormData.schedule}
                      onChange={(e) => setGameFormData({ ...gameFormData, schedule: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      placeholder="Dec 15, 10:00 AM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Participants</label>
                    <input
                      type="text"
                      value={gameFormData.max_participants}
                      onChange={(e) => setGameFormData({ ...gameFormData, max_participants: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      placeholder="32 Teams"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Display Order</label>
                    <input
                      type="number"
                      value={gameFormData.order_index}
                      onChange={(e) => setGameFormData({ ...gameFormData, order_index: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={gameFormData.description}
                    onChange={(e) => setGameFormData({ ...gameFormData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Registration Link *</label>
                  <input
                    type="url"
                    value={gameFormData.registration_link}
                    onChange={(e) => setGameFormData({ ...gameFormData, registration_link: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    placeholder="https://forms.google.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rulebook Link *</label>
                  <input
                    type="url"
                    value={gameFormData.rulebook_link}
                    onChange={(e) => setGameFormData({ ...gameFormData, rulebook_link: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveGame}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingGame ? 'Update Game' : 'Add Game'}
                </button>
                <button
                  onClick={() => setGameFormOpen(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border-2 border-red-500/50">
              <h3 className="text-xl font-bold mb-4 text-red-400">Confirm Delete</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this game? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await handleDeleteGame(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminHelpButton
        title="Tournament Management"
        instructions={[
          '**Tournament Banner**: Upload or link a 1920x600px banner image. Choose between URL (external link) or /public path (hosted locally)',
          '**Tournament Description**: Write tournament details as plain text OR use HTML templates for rich formatting. Supports tags like <h2>, <p>, <ul>, <li>, <strong>, <em>, <a>, <img>, <table>, etc.',
          '**Tournament Info**: Set tournament name, slogan, date, time, venue, prize pool, and registration deadline. These display in the info section with color-coded cards',
          '**Organizers, Co-Organizers, Associated With, Sponsors**: Add organization logos and names. Each section displays seamlessly on the public page with hover effects',
          '**Per-Game Registration Control**: Toggle registration status (open/closed) for individual games using the animated toggle. Closed games show "CLOSED" badge and disabled buttons on public page',
          '**Image Management**: All image uploads (banner, logos) support dual input - paste URL or select from /public folder. Live preview shows instantly',
          'Add and edit tournament games with categories, prize pools, team sizes, and registration links',
          'Track game registration status and manage participant limits'
        ]}
        tips={[
          'Only one tournament can be active at a time',
          'Use 1920x600px images for banners - they display full-width on public page',
          'HTML descriptions support paragraphs, lists, tables, links, and images for professional formatting',
          'Tournament name supports up to 100+ characters - give it plenty of space on the left side (50% width)',
          'Logo and organization images should be square or aspect ratio 1:1 for best display',
          'Info cards (Date, Time, Venue, Prize Pool) are color-coded: blue, green, orange, yellow',
          'Registration deadline is highlighted in red as a warning',
          'Game registration toggles allow you to control availability per-game without affecting others',
          'Sponsors display with a ⭐ star badge for professional branding'
        ]}
        actions={[
          { title: 'Edit Tournament Info', description: 'Update banner, name, slogan, date, time, venue, prize pool, and deadline' },
          { title: 'Add Tournament Description', description: 'Write plain text or HTML-formatted description for "About Tournament" section' },
          { title: 'Manage Organizations', description: 'Add organizers, co-organizers, associated with, and sponsors with logos' },
          { title: 'Upload Images', description: 'Use ImageInputWithPreview to upload banner and organization logos from URL or /public' },
          { title: 'Toggle Game Registration', description: 'Use animated toggle to open/close registration for individual games' },
          { title: 'Add Game', description: 'Create new tournament game with category, icon, prize pool, team size, and links' },
          { title: 'Update Game Details', description: 'Modify game information and registration settings' }
        ]}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
import AnimatedToggle from '@/components/AnimatedToggle';
import Modal from '@/components/Modal';
import { 
  getActiveTournament, 
  createTournament,
  updateTournament, 
  toggleTournamentStatus,
  updateTournamentGame,
  getTournamentGames,
  createTournamentGame,
  deleteTournamentGame
} from '@/lib/supabase-queries';
import type { Tournament, TournamentGame, Organization } from '@/lib/types/database';
import { 
  TrophyIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  PhotoIcon, 
  PencilSquareIcon, 
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
  VideoCameraIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function TournamentManagementPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [games, setGames] = useState<TournamentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'games' | 'glimpses'>('info');
  
  // Tournament form state - REMOVED BANNER
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    logo: '',
    teaser_video_url: '',
    description: '',
    about_event: '',
    about_organizer: '',
    date: '',
    time: '',
    venue: '',
    total_prize_pool: '',
    registration_deadline: '',
    status: 'closed' as 'open' | 'closed',
    registration_status: 'closed' as 'open' | 'closed'
  });

  // Organizations state
  const [organizers, setOrganizers] = useState<Organization[]>([]);
  const [coOrganizers, setCoOrganizers] = useState<Organization[]>([]);
  const [associatedWith, setAssociatedWith] = useState<Organization[]>([]);
  const [sponsors, setSponsors] = useState<Organization[]>([]);

  // Glimpses State
  const [previousGlimpses, setPreviousGlimpses] = useState<{ id: string; title: string; images: string[] }[]>([]);

  // Organization form states
  const [orgFormOpen, setOrgFormOpen] = useState<'organizers' | 'coOrganizers' | 'associatedWith' | 'sponsors' | null>(null);
  const [orgFormData, setOrgFormData] = useState({ name: '', logo: '' });

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
    registration_fee: '',
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
          teaser_video_url: tournamentData.teaser_video_url || '',
          description: tournamentData.description || '',
          about_event: tournamentData.about_event || '',
          about_organizer: tournamentData.about_organizer || '',
          date: tournamentData.date,
          time: tournamentData.time,
          venue: tournamentData.venue,
          total_prize_pool: tournamentData.total_prize_pool,
          registration_deadline: tournamentData.registration_deadline ? tournamentData.registration_deadline.split('T')[0] : '',
          status: tournamentData.status,
          registration_status: tournamentData.registration_status || 'closed'
        });
        setOrganizers(tournamentData.organizers || []);
        setCoOrganizers(tournamentData.co_organizers || []);
        setAssociatedWith(tournamentData.associated_with || []);
        setSponsors(tournamentData.sponsors || []);
        setPreviousGlimpses(tournamentData.previous_glimpses || []);

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
        sponsors,
        previous_glimpses: previousGlimpses
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

  const handleToggleRegistrationStatus = async () => {
    if (!tournament) return;

    const newStatus = formData.registration_status === 'open' ? 'closed' : 'open';
    try {
      await updateTournament(tournament.id, { registration_status: newStatus });
      alert(`Global Registration is now ${newStatus}!`);
      loadTournament();
    } catch (error) {
      console.error('Error toggling registration status:', error);
      alert('Failed to change registration status');
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

  const openOrgForm = (type: 'organizers' | 'coOrganizers' | 'associatedWith' | 'sponsors') => {
    setOrgFormOpen(type);
    setOrgFormData({ name: '', logo: '' });
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
    setOrgFormData({ name: '', logo: '' });
  };

  const removeOrganization = (type: 'organizers' | 'coOrganizers' | 'associatedWith' | 'sponsors', index: number) => {
    if (type === 'organizers') setOrganizers(organizers.filter((_, i) => i !== index));
    else if (type === 'coOrganizers') setCoOrganizers(coOrganizers.filter((_, i) => i !== index));
    else if (type === 'associatedWith') setAssociatedWith(associatedWith.filter((_, i) => i !== index));
    else if (type === 'sponsors') setSponsors(sponsors.filter((_, i) => i !== index));
  };

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
        registration_fee: game.registration_fee || '',
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
        registration_fee: '',
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
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      await deleteTournamentGame(gameId);
      loadTournament();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game');
    }
  };

  // Glimpses Functions
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newImageInputs, setNewImageInputs] = useState<{[key: number]: string}>({});

  const addGlimpseEvent = () => {
    if (!newEventTitle.trim()) {
        alert("Please enter an event name");
        return;
    }
    setPreviousGlimpses([{ id: Date.now().toString(), title: newEventTitle, images: [] }, ...previousGlimpses]);
    setNewEventTitle('');
  };

  const removeGlimpseEvent = (index: number) => {
    if (confirm("Remove this event and its images?")) {
        setPreviousGlimpses(previousGlimpses.filter((_, i) => i !== index));
    }
  };

  const addImageToGlimpse = (index: number) => {
      const url = newImageInputs[index];
      if (url && url.trim()) {
          const updated = [...previousGlimpses];
          if (updated[index].images.length >= 5) {
              alert("Max 5 images per event");
              return;
          }
          updated[index].images.push(url);
          setPreviousGlimpses(updated);
          setNewImageInputs({ ...newImageInputs, [index]: '' });
      }
  };

  const removeImageFromGlimpse = (eventIndex: number, imgIndex: number) => {
      const updated = [...previousGlimpses];
      updated[eventIndex].images = updated[eventIndex].images.filter((_, i) => i !== imgIndex);
      setPreviousGlimpses(updated);
  };


  const inputClassName = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-gray-500 hover:bg-black/30";
  const labelClassName = "block text-sm font-medium text-gray-300 mb-2";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 animate-pulse">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-6 animate-fadeIn">
            <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <TrophyIcon className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">No Active Tournament Found</h2>
            <p className="text-gray-400 max-w-md">Get started by launching a new tournament season. This will be the main event displayed on your website.</p>
            <button
                onClick={async () => {
                    const confirmCreate = confirm("Ready to launch a new tournament season?");
                    if (confirmCreate) {
                        try {
                            setLoading(true);
                            await createTournament({
                                ...formData,
                                name: "New Tournament Season",
                                status: "closed",
                                date: new Date().toISOString().split('T')[0],
                                time: "10:00 AM",
                                venue: "TBD",
                                total_prize_pool: "TBD",
                                registration_deadline: new Date().toISOString().split('T')[0]
                            });
                            await loadTournament();
                        } catch (e) {
                            console.error(e);
                            alert("Failed to create tournament");
                            setLoading(false);
                        }
                    }
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/25"
            >
                Create New Tournament
            </button>
        </div>
     );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Tournament Manager</h1>
           <p className="text-gray-400 text-lg">Manage the active season, competitive titles, and details</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
             {/* Tournament Status Toggle */}
             <div className="flex items-center gap-4 bg-gray-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${tournament.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    <div className={`w-2 h-2 rounded-full ${tournament.status === 'open' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    {tournament.status === 'open' ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
                </div>
                <AnimatedToggle
                    isOn={tournament.status === 'open'}
                    onToggle={(isOpen) => handleToggleStatus()}
                    label=""
                    onLabel="On"
                    offLabel="Off"
                    size="md"
                />
             </div>

             {/* Registration Status Toggle */}
             <div className="flex items-center gap-4 bg-gray-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${formData.registration_status === 'open' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                    <div className={`w-2 h-2 rounded-full ${formData.registration_status === 'open' ? 'bg-blue-400 animate-pulse' : 'bg-orange-400'}`} />
                    {formData.registration_status === 'open' ? 'REG OPEN' : 'REG CLOSED'}
                </div>
                <AnimatedToggle
                    isOn={formData.registration_status === 'open'}
                    onToggle={(isOpen) => handleToggleRegistrationStatus()}
                    label=""
                    onLabel="Open"
                    offLabel="Closed"
                    size="md"
                />
             </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-black/20 rounded-xl backdrop-blur-sm border border-white/5 w-fit overflow-x-auto">
        {[
            { id: 'info', icon: TrophyIcon, label: 'Tournament Info' },
            { id: 'games', icon: BuildingOffice2Icon, label: `Games (${games.length})` },
            { id: 'glimpses', icon: PhotoIcon, label: 'Previous Glimpses' },
        ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
        ))}
      </div>

      <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
        
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="p-6 lg:p-8 space-y-8">
             {/* General Details */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                      <TrophyIcon className="w-6 h-6 text-purple-500" />
                      General Details
                   </h3>
                   
                   <div className="grid grid-cols-1 gap-6">
                      <div>
                          <label className={labelClassName}>Tournament Name</label>
                          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClassName} />
                      </div>
                      <div>
                          <label className={labelClassName}>Slogan</label>
                          <input type="text" value={formData.slogan} onChange={(e) => setFormData({ ...formData, slogan: e.target.value })} className={inputClassName} />
                      </div>
                      <div>
                          <label className={labelClassName}>Tournament Logo (URL)</label>
                           <input type="text" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} className={inputClassName} />
                      </div>
                      {/* Teaser Video Section */}
                       <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                            <label className={labelClassName}>Teaser Video URL (Main Visual)</label>
                            <div className="relative mt-2">
                                <VideoCameraIcon className="absolute left-4 top-3.5 w-5 h-5 text-purple-500" />
                                <input type="text" value={formData.teaser_video_url} onChange={(e) => setFormData({ ...formData, teaser_video_url: e.target.value })} className={`${inputClassName} pl-12`} placeholder="https://www.youtube.com/embed/..." />
                            </div>
                            <p className="mt-2 text-xs text-gray-400">This video replaces the static banner on the main page. Supports YouTube, Vimeo, Twitch, and direct video links.</p>
                            {formData.teaser_video_url && (
                                <div className="mt-6 aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                                    <video src={formData.teaser_video_url} className="w-full h-full object-cover" controls muted />
                                </div>
                            )}
                       </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                      <CalendarIcon className="w-6 h-6 text-blue-500" />
                      Logistics
                   </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className={labelClassName}>Date</label>
                          <input type="text" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClassName} />
                      </div>
                      <div>
                          <label className={labelClassName}>Time</label>
                          <input type="text" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className={inputClassName} />
                      </div>
                      <div className="col-span-2">
                          <label className={labelClassName}>Venue</label>
                          <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className={inputClassName} />
                      </div>
                      <div>
                          <label className={labelClassName}>Prize Pool</label>
                          <input type="text" value={formData.total_prize_pool} onChange={(e) => setFormData({ ...formData, total_prize_pool: e.target.value })} className={`${inputClassName} text-green-400 font-bold`} />
                      </div>
                       <div>
                          <label className={labelClassName}>Reg Deadline</label>
                          <input type="date" value={formData.registration_deadline} onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })} className={inputClassName} />
                      </div>
                   </div>
                </div>
             </div>

              {/* Video Embedding Guide - Full Width Horizontal */}
              <div className="relative bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  {/* Header */}
                  <div className="p-5 border-b border-white/10 bg-black/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white shadow-lg shadow-purple-500/20">
                              <VideoCameraIcon className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="font-bold text-white text-lg tracking-wide">Video Embedding Guide</h3>
                              <p className="text-xs text-gray-500">Supported platforms for teaser videos</p>
                          </div>
                      </div>
                  </div>

                  {/* Horizontal Cards Grid */}
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* YouTube Card */}
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-red-500/40 transition-all group hover:bg-red-500/5 hover:shadow-lg hover:shadow-red-500/10">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-sm group-hover:text-red-400 transition-colors">YouTube</h4>
                                  <span className="text-[10px] text-gray-500">Share → Embed</span>
                              </div>
                          </div>
                          <code className="block w-full p-2.5 bg-black/60 rounded-lg border border-white/10 text-[10px] text-gray-400 font-mono truncate">youtube.com/embed/...</code>
                      </div>

                      {/* Vimeo Card */}
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-blue-500/40 transition-all group hover:bg-blue-500/5 hover:shadow-lg hover:shadow-blue-500/10">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.875 10.125c-.698 2.859-5.59 12.375-12.28 12.375-3.692 0-4.229-8.084-6.315-13.435-.747-1.742-1.233-1.637-2.66-.465l-1.62-2.1c2.18-1.92 4.364-4.14 5.733-4.265 2.155-.2 3.66 1.34 4.19 5.37.75 5.56 1.58 6.945 3.12 6.945 1.154 0 3.737-4.48 4.095-5.915.75-3.03 2.062-2.28 4.305-2.28 1.432 0 1.954 1.705 1.432 3.77z"/></svg>
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">Vimeo</h4>
                                  <span className="text-[10px] text-gray-500">Share → Embed</span>
                              </div>
                          </div>
                          <code className="block w-full p-2.5 bg-black/60 rounded-lg border border-white/10 text-[10px] text-gray-400 font-mono truncate">player.vimeo.com/video/...</code>
                      </div>

                      {/* Google Drive Card */}
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-green-500/40 transition-all group hover:bg-green-500/5 hover:shadow-lg hover:shadow-green-500/10">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="p-2.5 bg-green-500/10 text-green-500 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-all shadow-sm">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.643 14.286l2.142-3.715 5.286 9.143h-10.714l3.286-5.428zm6.571-3.714l-2.142 3.714h-6.572l5.429-9.429h6.571l-3.286 5.715zm1.5-2.572l-5.429 9.429h-4.286l5.429-9.429h4.286z"/></svg>
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-sm group-hover:text-green-400 transition-colors">Google Drive</h4>
                                  <span className="text-[10px] text-gray-500">Embed item</span>
                              </div>
                          </div>
                          <code className="block w-full p-2.5 bg-black/60 rounded-lg border border-white/10 text-[10px] text-gray-400 font-mono truncate">drive.google.com/file/...</code>
                      </div>

                      {/* ImageKit.io Card */}
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-pink-500/40 transition-all group hover:bg-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="p-2.5 bg-pink-500/10 text-pink-500 rounded-lg group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                              <div>
                                  <h4 className="text-white font-bold text-sm group-hover:text-pink-400 transition-colors">ImageKit.io</h4>
                                  <span className="text-[10px] text-gray-500">Direct URL</span>
                              </div>
                          </div>
                          <code className="block w-full p-2.5 bg-black/60 rounded-lg border border-white/10 text-[10px] text-gray-400 font-mono truncate">ik.imagekit.io/.../video.mp4</code>
                      </div>
                  </div>
              </div>

            {/* About Sections */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                 <div>
                    <label className={labelClassName}>About Event (HTML Supported)</label>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-2 text-xs text-blue-300">
                       <strong className="block mb-1">💡 Formatting Tips:</strong>
                       Use standard HTML tags. Avoid fixed widths (e.g., width: 500px). Use <code>w-full</code> or percentage widths for responsiveness.
                    </div>
                    <textarea value={formData.about_event} onChange={(e) => setFormData({ ...formData, about_event: e.target.value })} className={`${inputClassName} font-mono text-sm`} rows={8} placeholder="<p>Enter details...</p>" />
                 </div>
                 <div>
                    <label className={labelClassName}>About Organizer (HTML Supported)</label>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-2 text-xs text-blue-300">
                       <strong className="block mb-1">💡 Formatting Tips:</strong>
                       Ensure images are responsive (max-width: 100%). Layouts will stack on mobile devices automatically.
                    </div>
                    <textarea value={formData.about_organizer} onChange={(e) => setFormData({ ...formData, about_organizer: e.target.value })} className={`${inputClassName} font-mono text-sm`} rows={8} placeholder="<p>About us...</p>" />
                 </div>
             </div>

             {/* Organizations Section */}
             <div className="space-y-8 pt-8 border-t border-white/10">
                {['organizers', 'coOrganizers', 'associatedWith', 'sponsors'].map((type) => {
                   const titleMap: any = { organizers: 'Organizers', coOrganizers: 'Co-Organizers', associatedWith: 'Associated With', sponsors: 'Sponsors / Collaborators' };
                   const dataMap: any = { organizers, coOrganizers, associatedWith, sponsors };
                   const colorMap: any = { organizers: 'purple', coOrganizers: 'blue', associatedWith: 'pink', sponsors: 'yellow' };
                   const list = dataMap[type] as Organization[];
                   const color = colorMap[type];

                   return (
                      <div key={type} className="bg-black/20 rounded-xl p-6 border border-white/5">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-lg font-bold text-${color}-400 flex items-center gap-2`}>
                               {type === 'sponsors' ? <CurrencyDollarIcon className="w-5 h-5" /> : <BuildingOffice2Icon className="w-5 h-5" />}
                               {titleMap[type]}
                            </h3>
                            <button onClick={() => openOrgForm(type as any)} className={`px-4 py-2 bg-${color}-500/10 hover:bg-${color}-500/20 text-${color}-400 rounded-lg text-sm font-semibold transition-colors border border-${color}-500/20`}>+ Add</button>
                         </div>
                         {orgFormOpen === type && (
                            <div className={`mb-6 p-4 bg-${color}-900/10 border border-${color}-500/30 rounded-xl animate-scaleIn`}>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <input type="text" placeholder="Name" value={orgFormData.name} onChange={e => setOrgFormData({...orgFormData, name: e.target.value})} className={inputClassName} />
                                  <input type="text" placeholder="Logo URL" value={orgFormData.logo} onChange={e => setOrgFormData({...orgFormData, logo: e.target.value})} className={inputClassName} />
                               </div>
                               <div className="flex justify-end gap-3">
                                  <button onClick={() => setOrgFormOpen(null)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                  <button onClick={handleSaveOrganization} className={`px-6 py-2 bg-${color}-600 hover:bg-${color}-500 text-white rounded-lg font-bold`}>Save</button>
                               </div>
                            </div>
                         )}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {list.map((org, idx) => (
                               <div key={idx} className="group relative bg-gray-900/50 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all flex flex-col items-center gap-3">
                                  <button onClick={() => removeOrganization(type as any, idx)} className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><XMarkIcon className="w-4 h-4" /></button>
                                  <div className="h-16 w-full flex items-center justify-center bg-black/20 rounded-lg p-2">
                                     <img src={org.logo} alt={org.name} className="max-h-full max-w-full object-contain" />
                                  </div>
                                  <p className="text-sm font-medium text-center text-gray-300 line-clamp-1">{org.name}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   );
                })}
             </div>

             {/* Save Button */}
             <div className="pt-6 border-t border-white/10 flex justify-end">
                <button
                   onClick={handleSaveTournament}
                   disabled={saving}
                   className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center gap-2"
                >
                   {saving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <CheckCircleIcon className="w-6 h-6" />}
                   Save All Info Changes
                </button>
             </div>
          </div>
        )}

        {/* GLIMPSES TAB */}
        {activeTab === 'glimpses' && (
             <div className="p-6 lg:p-8 space-y-8">
                {/* Header with New Event Input */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Previous Glimpses</h2>
                        <p className="text-gray-400">Manage galleries for past events</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <input 
                            type="text" 
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="Event Name (e.g. Winter Cup 2023)"
                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 flex-1 md:w-64"
                        />
                        <button onClick={addGlimpseEvent} disabled={!newEventTitle.trim()} className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform whitespace-nowrap">
                            <PlusIcon className="w-5 h-5" /> Add Event
                        </button>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {previousGlimpses.map((event, idx) => (
                        <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                                    {event.title}
                                </h3>
                                <button onClick={() => removeGlimpseEvent(idx)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete Event"><TrashIcon className="w-5 h-5" /></button>
                            </div>

                            {/* Image Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                {event.images.map((img, imgIdx) => (
                                    <div key={imgIdx} className="group relative aspect-square bg-black/40 rounded-xl overflow-hidden border border-white/5">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={() => removeImageFromGlimpse(idx, imgIdx)} className="bg-red-600 p-2 rounded-full text-white hover:scale-110 transition-transform"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                                {/* Add Image Input Card */}
                                {event.images.length < 5 && (
                                    <div className="aspect-square bg-white/5 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center p-4 gap-2 group hover:border-purple-500/50 transition-colors">
                                        <input 
                                            type="text" 
                                            value={newImageInputs[idx] || ''} 
                                            onChange={(e) => setNewImageInputs({ ...newImageInputs, [idx]: e.target.value })}
                                            placeholder="Image URL..."
                                            className="w-full bg-black/40 text-xs border border-white/10 rounded px-2 py-1 text-white text-center focus:outline-none focus:border-purple-500"
                                        />
                                        <button 
                                            onClick={() => addImageToGlimpse(idx)}
                                            disabled={!newImageInputs[idx]}
                                            className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 text-right">{event.images.length}/5 Images</p>
                        </div>
                    ))}
                    {previousGlimpses.length === 0 && (
                        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                            No Previous Event Glimpses created.
                        </div>
                    )}
                </div>
                
                 <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button onClick={handleSaveTournament} disabled={saving} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold">{saving ? 'Saving...' : 'Save Glimpses'}</button>
                 </div>
             </div>
        )}

        {/* GAMES TAB */}
        {activeTab === 'games' && (
           <div className="p-6 lg:p-8">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h2 className="text-2xl font-bold text-white">Featured Games</h2>
                    <p className="text-gray-400">Manage the competitive titles</p>
                 </div>
                 <button onClick={() => openGameForm()} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Add Game
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {games.map((game) => (
                    <div key={game.id} className="group bg-black/20 rounded-2xl border border-white/5 hover:border-purple-500/50 transition-all hover:bg-black/30 flex flex-col overflow-hidden">
                       <div className="p-6 flex-1">
                          <div className="flex items-start gap-4 mb-4">
                             <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center text-4xl shadow-inner overflow-hidden">
                                {game.game_logo ? <img src={game.game_logo} className="w-full h-full object-cover" /> : game.icon}
                             </div>
                             <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{game.game_name}</h3>
                                <span className="text-xs font-bold px-2 py-0.5 rounded capitalize bg-gray-500/20 text-gray-400">{game.category}</span>
                             </div>
                          </div>
                          <div className="space-y-3 mb-4">
                             <div className="flex items-center justify-between text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                <span className="flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4 text-green-400" />Pool</span>
                                <span className="font-bold text-white">{game.prize_pool}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
                           <button onClick={() => openGameForm(game)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-blue-400 font-medium transition-colors">Edit</button>
                           <button onClick={() => handleDeleteGame(game.id)} className="flex-1 py-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-sm text-red-400 font-medium transition-colors">Delete</button>
                           <button onClick={() => handleToggleGameRegistration(game.id, game.registration_status)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${game.registration_status === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-700/30 text-gray-400 border-gray-600/30'}`}>{game.registration_status === 'open' ? 'Reg Open' : 'Reg Closed'}</button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* Game Modal */}
      <Modal
        isOpen={gameFormOpen}
        onClose={() => setGameFormOpen(false)}
        title={editingGame ? 'Edit Game' : 'Add New Game'}
      >
        <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">Game Details</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>Game Name</label>
                    <input type="text" value={gameFormData.game_name} onChange={e => setGameFormData({...gameFormData, game_name: e.target.value})} className={inputClassName} placeholder="Valorant" />
                  </div>
                  <div>
                    <label className={labelClassName}>Category</label>
                    <select value={gameFormData.category} onChange={e => setGameFormData({...gameFormData, category: e.target.value as any})} className={inputClassName}>
                        <option value="pc" className="bg-gray-800">PC</option>
                        <option value="mobile" className="bg-gray-800">Mobile</option>
                        <option value="casual" className="bg-gray-800">Casual</option>
                    </select>
                  </div>
              </div>
              <div>
                  <label className={labelClassName}>Game Logo URL</label>
                  <input type="text" value={gameFormData.game_logo} onChange={e => setGameFormData({...gameFormData, game_logo: e.target.value})} className={inputClassName} placeholder="https://..." />
              </div>
            </div>

            {/* Competition Specs */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">Competition Specs</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>Prize Pool</label>
                    <input type="text" value={gameFormData.prize_pool} onChange={e => setGameFormData({...gameFormData, prize_pool: e.target.value})} className={inputClassName} placeholder="10,000 BDT" />
                  </div>
                  <div>
                      <label className={labelClassName}>Team Size</label>
                      <input type="text" value={gameFormData.team_size} onChange={e => setGameFormData({...gameFormData, team_size: e.target.value})} className={inputClassName} placeholder="5v5" />
                  </div>
                  <div>
                      <label className={labelClassName}>Registration Fee (BDT)</label>
                      <input type="text" value={gameFormData.registration_fee} onChange={e => setGameFormData({...gameFormData, registration_fee: e.target.value})} className={inputClassName} placeholder="500 BDT" />
                  </div>
                  <div>
                      <label className={labelClassName}>Format</label>
                    <input type="text" value={gameFormData.format} onChange={e => setGameFormData({...gameFormData, format: e.target.value})} className={inputClassName} placeholder="Single Elimination" />
                  </div>
                  <div>
                    <label className={labelClassName}>Max Participants</label>
                    <input type="text" value={gameFormData.max_participants} onChange={e => setGameFormData({...gameFormData, max_participants: e.target.value})} className={inputClassName} placeholder="64 Teams" />
                  </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">Links</h3>
                <div>
                  <label className={labelClassName}>Registration Link (Slug or URL)</label>
                  <input type="text" value={gameFormData.registration_link} onChange={e => setGameFormData({...gameFormData, registration_link: e.target.value})} className={inputClassName} placeholder="/register/valorant" />
              </div>
                <div>
                  <label className={labelClassName}>Rulebook URL</label>
                  <input type="text" value={gameFormData.rulebook_link} onChange={e => setGameFormData({...gameFormData, rulebook_link: e.target.value})} className={inputClassName} placeholder="https://docs.google.com/..." />
              </div>
            </div>

            <button onClick={handleSaveGame} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:scale-[1.02] transition-transform">
              {editingGame ? 'Save Changes' : 'Create Game'}
            </button>
        </div>
      </Modal>

      <AdminHelpButton
         title="🏆 Tournament Manager"
         instructions={[
            "**Tournament Lifecycle**: Manage your tournament from `Setup` → `Registration` → `Live` → `Conclusion`.",
            "**System Status**: 'SYSTEM ONLINE' makes the page visible. 'SYSTEM OFFLINE' shows a maintenance screen.",
            "**Registration Status**: 'REG OPEN' enables buttons. 'REG CLOSED' disables all game registration buttons globally.",
            "**Featured Games**: Add games with individual registration fees, prize pools, and rulebooks.",
            "**Partner Showcase**: Add Organizers, Co-Organizers, Sponsors, and Collaborators with logos.",
            "**Glimpses Gallery**: Upload photo galleries from previous events to build excitement."
         ]}
         tips={[
            "**HTML Content**: When adding 'About' content, use responsive classes. Avoid fixed pixel widths to ensure mobile compatibility.",
            "**Teaser Video**: A looping background video creates a high-impact landing page experience.",
            "**Registration Deadline**: This triggers the countdown timer on the public page.",
            "**Venue Details**: Ensure address is accurate - it's displayed prominently to participants.",
            "**Total Prize Pool**: Displayed as headline stat on the tournament banner."
         ]}
         actions={[
            {
               title: "🎮 Adding Games",
               description:
                  "Each game can have unique settings:\n\n**Registration Fee**: e.g., `500 BDT` or `Free`\n**Rulebook Link**: External PDF or Google Doc URL\n**Prize Pool**: Game-specific winnings\n**Team Size**: Solo, Duo, Squad, etc.\n**Format**: Knockout, League, Swiss, etc."
            },
            {
               title: "🤝 Partner Tiers",
               description:
                  "**Organizers**: Primary hosts (largest display)\n**Co-Organizers**: Strategic partners\n**Sponsors**: Financial backers\n**Associated With**: Supporting organizations\n\n*Tip: Add partners in display order preference.*"
            },
            {
               title: "📸 Gallery (Glimpses)",
               description:
                  "**Create Event Group**: e.g., 'Winter Championship 2023'\n**Add Images**: Paste direct image URLs (max 5 per group)\n**Ordering**: First image becomes the featured large display\n**Removal**: Click X to remove outdated content"
            },
            {
               title: "🎬 Video Embedding",
               description:
                  "Use the embed URL format for teaser videos:\n\n**YouTube**: `https://www.youtube.com/embed/VIDEO_ID`\n**Vimeo**: `https://player.vimeo.com/video/VIDEO_ID`\n**Google Drive**: Share → Embed → Copy URL"
            }
         ]}
      />
    </div>
  );
}

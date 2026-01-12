'use client';

import AdminHelpButton from '@/components/AdminHelpButton';
import Modal from '@/components/Modal';
import { useState, useEffect } from 'react';
import {
  getAllSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  toggleSponsorPublish
} from '@/lib/supabase-queries';
import type { Sponsor } from '@/lib/types/database';
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  StarIcon,
  SignalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SponsorFormData {
  name: string;
  logo: string;
  type: 'sponsor' | 'collaborator';
  sponsor_types: string[];
  collaborator_types: string[];
  custom_type_name: string;
  website: string;
  description: string;
  events: string[];
  display_order: number;
  social_media: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  };
  is_published: boolean;
  is_featured: boolean;
}

const initialFormData: SponsorFormData = {
  name: '',
  logo: '',
  type: 'sponsor',
  sponsor_types: [],
  collaborator_types: [],
  custom_type_name: '',
  website: '',
  description: '',
  events: [],
  display_order: 0,
  social_media: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
  },
  is_published: false,
  is_featured: false,
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<SponsorFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sponsor' | 'collaborator'>('all');

  // Fetch sponsors from Supabase on mount
  useEffect(() => {
    fetchSponsors();
  }, []);

  async function fetchSponsors() {
    try {
      setLoading(true);
      const data = await getAllSponsors();
      setSponsors(data);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      alert('Failed to fetch sponsors. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const filteredSponsors = sponsors.filter((sponsor) => {
    const matchesSearch =
      sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || sponsor.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenForm = (sponsor?: Sponsor) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setFormData({
        name: sponsor.name,
        logo: sponsor.logo,
        type: sponsor.type,
        sponsor_types: sponsor.sponsor_types || [],
        collaborator_types: sponsor.collaborator_types || [],
        custom_type_name: sponsor.custom_type_name || '',
        website: sponsor.website,
        description: sponsor.description,
        events: sponsor.events || [],
        display_order: sponsor.display_order || 0,
        social_media: {
          facebook: sponsor.social_media?.facebook || '',
          instagram: sponsor.social_media?.instagram || '',
          linkedin: sponsor.social_media?.linkedin || '',
          twitter: sponsor.social_media?.twitter || '',
          youtube: sponsor.social_media?.youtube || '',
        },
        is_published: sponsor.is_published,
        is_featured: sponsor.is_featured,
      });
    } else {
      setEditingSponsor(null);
      setFormData({
        ...initialFormData,
        display_order: sponsors.length > 0 ? Math.max(...sponsors.map(s => s.display_order || 0)) + 1 : 1,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSponsor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        sponsor_types: formData.sponsor_types.length > 0 ? formData.sponsor_types : undefined,
        collaborator_types: formData.collaborator_types.length > 0 ? formData.collaborator_types : undefined,
        custom_type_name: formData.custom_type_name || undefined,
      };

      if (editingSponsor) {
        await updateSponsor(editingSponsor.id, submitData);
      } else {
        await createSponsor(submitData);
      }
      
      await fetchSponsors();
      handleCloseForm();
    } catch (error: any) {
      console.error('Error saving sponsor:', error);
      alert('Failed to save sponsor. Please check console for details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sponsor?')) {
      try {
        await deleteSponsor(id);
        await fetchSponsors();
      } catch (error) {
        console.error('Error deleting sponsor:', error);
        alert('Failed to delete sponsor. Please try again.');
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const sponsor = sponsors.find((s) => s.id === id);
      if (sponsor) {
        await toggleSponsorPublish(id, !sponsor.is_published);
        await fetchSponsors();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publish status. Please try again.');
    }
  };

  // Helper for input styles
  const inputClassName = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-gray-500 hover:bg-black/30";
  const labelClassName = "block text-sm font-medium text-gray-300 mb-2 ml-1";

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Sponsors Manager</h1>
          <p className="text-gray-400 text-lg">Manage sponsors, partners, and collaborators</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add New Sponsor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: sponsors.length, color: 'text-white', icon: BuildingOffice2Icon, border: 'border-white/10' },
          { label: 'Sponsors', value: sponsors.filter((s) => s.type === 'sponsor').length, color: 'text-blue-400', icon: StarIcon, border: 'border-blue-500/20' },
          { label: 'Collaborators', value: sponsors.filter((s) => s.type === 'collaborator').length, color: 'text-green-400', icon: UserGroupIcon, border: 'border-green-500/20' },
          { label: 'Featured', value: sponsors.filter((s) => s.is_featured).length, color: 'text-yellow-400', icon: SignalIcon, border: 'border-yellow-500/20' },
          { label: 'Published', value: sponsors.filter((s) => s.is_published).length, color: 'text-purple-400', icon: GlobeAltIcon, border: 'border-purple-500/20' },
        ].map((stat, index) => (
          <div key={index} className={`bg-gray-900/60 backdrop-blur-xl border ${stat.border} p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-lg`}>
            <stat.icon className={`w-6 h-6 mb-2 ${stat.color} opacity-80`} />
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 md:space-y-0 md:flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or description..."
            className={`${inputClassName} pl-12`}
          />
        </div>
        <div className="w-full md:w-64 relative">
          <FunnelIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className={`${inputClassName} pl-12 appearance-none`}
            style={{ backgroundImage: 'none' }}
          >
            <option value="all" className="bg-gray-800">All Types</option>
            <option value="sponsor" className="bg-gray-800">Sponsors</option>
            <option value="collaborator" className="bg-gray-800">Collaborators</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading partners...</p>
          </div>
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingOffice2Icon className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No partners found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Get started by adding your first sponsor or collaborator to showcase them on your platform.
          </p>
          <button
            onClick={() => handleOpenForm()}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            + Add New Sponsor
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="group bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                {/* Logo Area */}
                <div className="h-40 bg-black/40 rounded-xl mb-6 p-6 flex items-center justify-center border border-white/5 group-hover:bg-black/50 transition-colors relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                  />
                  {sponsor.is_featured && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-500/20 text-yellow-300 p-1.5 rounded-lg border border-yellow-500/30 shadow-lg backdrop-blur-sm">
                        <StarIcon className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{sponsor.name}</h3>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                     <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      sponsor.type === 'sponsor' 
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' 
                        : 'bg-green-500/10 text-green-300 border-green-500/20'
                    }`}>
                      {sponsor.type === 'sponsor' ? 'Sponsor' : 'Collaborator'}
                    </span>
                     {sponsor.custom_type_name && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500/10 text-orange-300 border border-orange-500/20">
                        {sponsor.custom_type_name}
                      </span>
                    )}
                    {/* Only show first 2 type tags to avoid clutter */}
                    {[...(sponsor.sponsor_types || []), ...(sponsor.collaborator_types || [])].slice(0, 2).map((type) => (
                      <span key={type} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    ))}
                    {((sponsor.sponsor_types?.length || 0) + (sponsor.collaborator_types?.length || 0)) > 2 && (
                       <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-700 text-gray-400 border border-gray-600">
                         +{((sponsor.sponsor_types?.length || 0) + (sponsor.collaborator_types?.length || 0)) - 2}
                       </span>
                    )}
                  </div>
                  
                  {/* Event Tags */}
                  {sponsor.events && sponsor.events.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {sponsor.events.slice(0, 2).map((event, idx) => (
                           <span key={idx} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-mono border border-indigo-500/30">
                              {event}
                           </span>
                        ))}
                         {sponsor.events.length > 2 && (
                           <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px] border border-gray-700">
                              +{sponsor.events.length - 2}
                           </span>
                        )}
                    </div>
                  )}
                  
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {sponsor.description || 'No description provided.'}
                  </p>

                   {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <GlobeAltIcon className="w-3.5 h-3.5 mr-1.5" />
                        Visit Website
                      </a>
                    )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
                 <button
                    onClick={() => handleTogglePublish(sponsor.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      sponsor.is_published
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {sponsor.is_published ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current"></div>}
                    {sponsor.is_published ? 'Published' : 'Draft'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenForm(sponsor)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

      {/* Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingSponsor ? 'Edit Partner' : 'Add New Partner'}
      >
        <form id="sponsor-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClassName}>Partner Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={inputClassName}
                    placeholder="e.g. Acme Corp"
                  />
                </div>

                  <div className="md:col-span-2">
                  <label className={labelClassName}>Logo URL *</label>
                  <div className="flex gap-4">
                    <input
                        type="text"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        required
                        className={inputClassName}
                        placeholder="https://..."
                    />
                      <div className="w-12 h-12 bg-black/40 rounded-lg border border-white/10 flex-shrink-0 flex items-center justify-center p-1">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Preview" className="max-w-full max-h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        ) : <div className="text-xs text-gray-600">Img</div>}
                      </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Type & Classification */}
          <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Classification</h3>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className={labelClassName}>Partner Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          type: e.target.value as any,
                          sponsor_types: e.target.value === 'collaborator' ? [] : formData.sponsor_types,
                          collaborator_types: e.target.value === 'sponsor' ? [] : formData.collaborator_types
                        })}
                        className={inputClassName}
                      >
                        <option value="sponsor" className="bg-gray-800">Sponsor</option>
                        <option value="collaborator" className="bg-gray-800">Collaborator</option>
                      </select>
                  </div>
                  
                  <div>
                      <label className={labelClassName}>Order Index</label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        className={inputClassName}
                      />
                  </div>
              </div>

              {/* Dynamic Categories based on Type */}
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Categories</label>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {(formData.type === 'sponsor' ? [
                          { value: 'title_sponsor', label: 'Title Sponsor' },
                          { value: 'platinum_sponsor', label: 'Platinum Sponsor' },
                          { value: 'gold_sponsor', label: 'Gold Sponsor' },
                          { value: 'silver_sponsor', label: 'Silver Sponsor' },
                          { value: 'official_sponsor', label: 'Official Sponsor' },
                          { value: 'co_sponsor', label: 'Co-Sponsor' },
                          { value: 'technology_partner', label: 'Technology Partner' },
                          { value: 'venue_partner', label: 'Venue Partner' },
                          { value: 'other', label: 'Other' },
                      ] : [
                          { value: 'academic_collaborator', label: 'Academic Collaborator' },
                          { value: 'research_collaborator', label: 'Research Collaborator' },
                          { value: 'industry_collaborator', label: 'Industry Collaborator' },
                          { value: 'technical_collaborator', label: 'Technical Collaborator' },
                          { value: 'event_collaborator', label: 'Event Collaborator' },
                          { value: 'student_organization', label: 'Student Organization' },
                          { value: 'other', label: 'Other' },
                      ]).map(option => (
                          <label key={option.value} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                              <div className="relative flex items-center">
                                  <input
                                      type="checkbox"
                                      checked={formData.type === 'sponsor'
                                          ? formData.sponsor_types.includes(option.value)
                                          : formData.collaborator_types.includes(option.value)
                                      }
                                      onChange={(e) => {
                                          const currentTypes = formData.type === 'sponsor' ? formData.sponsor_types : formData.collaborator_types;
                                          const newTypes = e.target.checked
                                              ? [...currentTypes, option.value]
                                              : currentTypes.filter(t => t !== option.value);

                                          setFormData(prev => ({
                                              ...prev,
                                              [prev.type === 'sponsor' ? 'sponsor_types' : 'collaborator_types']: newTypes,
                                              custom_type_name: !e.target.checked && option.value === 'other' ? '' : prev.custom_type_name
                                          }));
                                      }}
                                      className="peer w-5 h-5 border-2 border-gray-500 rounded text-purple-600 focus:ring-purple-500/50 bg-transparent checked:bg-purple-600 checked:border-purple-600 transition-all"
                                  />
                              </div>
                              <span className="text-gray-300 text-sm peer-checked:text-white">{option.label}</span>
                          </label>
                      ))}
                  </div>
              </div>

              {(formData.sponsor_types.includes('other') || formData.collaborator_types.includes('other')) && (
                <div className="animate-fadeIn">
                    <label className={labelClassName}>Custom Category Name</label>
                    <input
                      type="text"
                      value={formData.custom_type_name}
                      onChange={(e) => setFormData({ ...formData, custom_type_name: e.target.value })}
                      className={inputClassName}
                      placeholder="e.g. Strategic Partner"
                    />
                </div>
              )}
          </div>

          {/* Sponsored Events */}
          <div className="space-y-4 pt-4 border-t border-white/5">
              <label className={labelClassName}>Sponsored Events / History</label>
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="flex gap-2 mb-3">
                      <input
                          type="text"
                          placeholder="Add event name (e.g. VGS Winter Cup 2024)"
                          className={inputClassName}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = e.currentTarget.value.trim();
                                  if (val && !formData.events.includes(val)) {
                                      setFormData({ ...formData, events: [...formData.events, val] });
                                      e.currentTarget.value = '';
                                  }
                              }
                          }}
                          id="event-input"
                      />
                      <button
                          type="button"
                          onClick={() => {
                              const input = document.getElementById('event-input') as HTMLInputElement;
                              const val = input.value.trim();
                              if (val && !formData.events.includes(val)) {
                                  setFormData({ ...formData, events: [...formData.events, val] });
                                  input.value = '';
                              }
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10"
                      >
                          Add
                      </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {formData.events.map((event, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs font-medium flex items-center gap-2 border border-purple-500/30">
                              {event}
                              <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, events: formData.events.filter((_, i) => i !== idx) })}
                                  className="hover:text-white transition-colors"
                              >
                                  <XMarkIcon className="w-3 h-3" />
                              </button>
                          </span>
                      ))}
                      {formData.events.length === 0 && (
                          <span className="text-gray-500 text-sm italic">No specific events added yet.</span>
                      )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Tag the specific events this partner has supported.</p>
              </div>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Details</h3>

              <div>
                    <label className={labelClassName}>Website</label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className={`${inputClassName} pl-12`}
                        placeholder="https://example.com"
                      />
                    </div>
              </div>

                <div>
                    <label className={labelClassName}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={inputClassName}
                      placeholder="Brief description..."
                    />
              </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-500 text-purple-600 focus:ring-purple-500 bg-transparent"
                  />
                  <span className="text-gray-300 font-medium text-sm">Published</span>
              </label>
                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-500 text-yellow-500 focus:ring-yellow-500 bg-transparent"
                  />
                  <span className="text-gray-300 font-medium text-sm">Featured</span>
              </label>
          </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
            >
              {editingSponsor ? 'Save Changes' : 'Create Partner'}
            </button>
        </form>
      </Modal>

      {/* Admin Help */}
      <AdminHelpButton
        title="🤝 Sponsors & Collaborators Manager"
        instructions={[
          "**Role**: Manage the ecosystem of partners (Sponsors, Co-Organizers, Academic Partners).",
          "**Classification**: Use `Sponsor` for financial backers and `Collaborator` for strategic partners.",
          "**Event Linking**: Tag partners to specific events (e.g., 'Winter 2024') to auto-generate reports.",
          "**Logos**: Use high-res transparent PNGs for optimal dark-mode display."
        ]}
        tips={[
          "**Featured Status**: Highlights key partners in the scrolling marquee on the homepage.",
          "**Ordering**: Use `Display Order` to control the hierarchy (e.g., Title Sponsor = 1).",
          "**Custom Types**: Create niche categories like 'Venue Partner' if standard options don't fit."
        ]}
        actions={[
          {
            title: "🏷️ Categorization Guide",
            description: 
              "**Sponsors**:\n- *Title*: Top tier, max visibility.\n- *Gold/Silver*: standard tiers.\n\n**Collaborators**:\n- *Academic*: Universities.\n- *Technical*: Tech providers."
          },
          {
            title: "🌐 Website Linking",
            description: "Always include a `Website URL` so visitors can click through to the partner's page. This adds value to the sponsorship package."
          }
        ]}
      />

       <style jsx global>{`
        @keyframes slideRight {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideRight {
            animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

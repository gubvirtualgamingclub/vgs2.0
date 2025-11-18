'use client';

import { useState, useEffect } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
import {
  getAllSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  toggleSponsorPublish
} from '@/lib/supabase-queries';
import type { Sponsor } from '@/lib/types/database';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    type: 'sponsor' as 'sponsor' | 'collaborator',
    sponsor_types: [] as string[], // Changed to array for multiple selection
    collaborator_types: [] as string[], // Changed to array for multiple selection
    custom_type_name: '',
    website: '',
    description: '',
    events: [] as string[],
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
  });
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
        name: '',
        logo: '',
        type: 'sponsor',
        sponsor_types: [],
        collaborator_types: [],
        custom_type_name: '',
        website: '',
        description: '',
        events: [],
        display_order: sponsors.length > 0 ? Math.max(...sponsors.map(s => s.display_order || 0)) + 1 : 1,
        social_media: {
          facebook: '',
          instagram: '',
          linkedin: '',
          twitter: '',
          youtube: '',
        },
        is_published: false,
        is_featured: false,
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
      // Prepare data with proper types - convert empty strings to undefined
      const submitData = {
        ...formData,
        sponsor_types: formData.sponsor_types.length > 0 ? formData.sponsor_types : undefined,
        collaborator_types: formData.collaborator_types.length > 0 ? formData.collaborator_types : undefined,
        custom_type_name: formData.custom_type_name || undefined,
      };

      console.log('Submitting sponsor data:', submitData);

      if (editingSponsor) {
        await updateSponsor(editingSponsor.id, submitData);
      } else {
        await createSponsor(submitData);
      }
      
      await fetchSponsors();
      handleCloseForm();
      alert('Sponsor saved successfully!');
    } catch (error: any) {
      console.error('Error saving sponsor:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to save sponsor. ';
      if (error?.message) {
        errorMessage += error.message;
      }
      if (error?.details) {
        errorMessage += '\nDetails: ' + error.details;
      }
      if (error?.hint) {
        errorMessage += '\nHint: ' + error.hint;
      }
      
      // Check for common database errors
      if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        errorMessage += '\n\n⚠️ Database migration required! Please run the migration SQL in your Supabase dashboard:\n' +
                       'migrations/add_sponsor_display_order_remove_tier.sql';
      }
      
      alert(errorMessage);
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

  const getTierColor = (tier: string) => {
    const colors: Record<string, { bg: string; text: string; badge: string }> = {
      platinum: { bg: 'from-slate-400 to-slate-600', text: 'text-slate-200', badge: 'bg-slate-900/50 text-slate-300' },
      gold: { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-200', badge: 'bg-yellow-900/50 text-yellow-300' },
      silver: { bg: 'from-gray-400 to-gray-600', text: 'text-gray-200', badge: 'bg-gray-600/50 text-gray-200' },
      bronze: { bg: 'from-orange-600 to-orange-800', text: 'text-orange-200', badge: 'bg-orange-900/50 text-orange-300' },
    };
    return colors[tier] || colors.bronze;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sponsors Manager</h1>
          <p className="text-gray-400">Manage sponsors, partners, and collaborators</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Sponsor</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Sponsors</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Types</option>
              <option value="sponsor">Sponsors</option>
              <option value="collaborator">Collaborators</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{sponsors.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Sponsors</p>
          <p className="text-2xl font-bold text-blue-400">
            {sponsors.filter((s) => s.type === 'sponsor').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Collaborators</p>
          <p className="text-2xl font-bold text-green-400">
            {sponsors.filter((s) => s.type === 'collaborator').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Featured</p>
          <p className="text-2xl font-bold text-yellow-400">
            {sponsors.filter((s) => s.is_featured).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Published</p>
          <p className="text-2xl font-bold text-green-400">
            {sponsors.filter((s) => s.is_published).length}
          </p>
        </div>
      </div>

      {/* Sponsors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading sponsors...</p>
          </div>
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-400">No sponsors found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
        {filteredSponsors.map((sponsor) => {
          return (
            <div
              key={sponsor.id}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
            >
              <div className="p-6">
                {/* Logo */}
                <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center" style={{ minHeight: '120px' }}>
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '120px' }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white text-center">{sponsor.name}</h3>
                  
                  {/* Type and Sponsor Type Badges */}
                  <div className="flex justify-center flex-wrap gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sponsor.type === 'sponsor' 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-green-900/50 text-green-300'
                    }`}>
                      {sponsor.type === 'sponsor' ? '🏢 Sponsor' : '🤝 Collaborator'}
                    </span>
                    
                    {/* Display custom name if available */}
                    {sponsor.custom_type_name && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-900/50 text-orange-300">
                        {sponsor.custom_type_name}
                      </span>
                    )}
                    
                    {/* Display multiple sponsor types */}
                    {sponsor.sponsor_types && sponsor.sponsor_types.length > 0 && sponsor.sponsor_types.map((type: string) => (
                      <span key={type} className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/50 text-purple-300">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    ))}
                    
                    {/* Display multiple collaborator types */}
                    {sponsor.collaborator_types && sponsor.collaborator_types.length > 0 && sponsor.collaborator_types.map((type: string) => (
                      <span key={type} className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-900/50 text-teal-300">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    ))}
                    
                    {sponsor.is_featured && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-900/50 text-yellow-300 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm text-center line-clamp-2">
                    {sponsor.description}
                  </p>

                  {/* Website Link */}
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    🌐 Visit Website
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleTogglePublish(sponsor.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sponsor.is_published
                        ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                        : 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70'
                    } transition-colors`}
                  >
                    {sponsor.is_published ? '✓ Published' : '○ Draft'}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenForm(sponsor)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm}></div>
            
            <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 flex items-center justify-between p-6 border-b border-gray-700 z-10">
                <h2 className="text-2xl font-bold text-white">
                  {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sponsor Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL or Path *</label>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png or /logos/company.png"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter full URL or path from public folder (e.g., /logos/logo.png). Supports any aspect ratio (square, wide, tall).</p>
                  {formData.logo && (
                    <div className="mt-3 bg-white rounded-lg p-4 flex items-center justify-center" style={{ minHeight: '120px' }}>
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '120px' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x80/374151/9CA3AF?text=Invalid+Image';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      type: e.target.value as any, 
                      sponsor_types: e.target.value === 'collaborator' ? [] : formData.sponsor_types,
                      collaborator_types: e.target.value === 'sponsor' ? [] : formData.collaborator_types,
                      custom_type_name: ''
                    })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  >
                    <option value="sponsor">Sponsor</option>
                    <option value="collaborator">Collaborator</option>
                  </select>
                </div>

                {formData.type === 'sponsor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sponsor Categories (select multiple)</label>
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                      
                      {/* Primary Sponsors */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Primary Sponsors</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'title_sponsor', label: 'Title Sponsor' },
                            { value: 'presenting_sponsor', label: 'Presenting Sponsor' },
                            { value: 'platinum_sponsor', label: 'Platinum Sponsor' },
                            { value: 'gold_sponsor', label: 'Gold Sponsor' },
                            { value: 'silver_sponsor', label: 'Silver Sponsor' },
                            { value: 'official_sponsor', label: 'Official Sponsor' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.sponsor_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.sponsor_types, option.value]
                                    : formData.sponsor_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, sponsor_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Supporting Sponsors */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Supporting Sponsors</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'co_sponsor', label: 'Co-Sponsor' },
                            { value: 'associate_sponsor', label: 'Associate Sponsor' },
                            { value: 'powered_by', label: 'Powered By' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.sponsor_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.sponsor_types, option.value]
                                    : formData.sponsor_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, sponsor_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Media & Technology */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Media & Technology</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'media_partner', label: 'Media Partner' },
                            { value: 'broadcast_partner', label: 'Broadcast Partner' },
                            { value: 'digital_partner', label: 'Digital Partner' },
                            { value: 'technology_partner', label: 'Technology Partner' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.sponsor_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.sponsor_types, option.value]
                                    : formData.sponsor_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, sponsor_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Knowledge & Education */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Knowledge & Education</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'knowledge_partner', label: 'Knowledge Partner' },
                            { value: 'education_partner', label: 'Education Partner' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.sponsor_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.sponsor_types, option.value]
                                    : formData.sponsor_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, sponsor_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Hospitality & Logistics */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Hospitality & Logistics</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'venue_partner', label: 'Venue Partner' },
                            { value: 'hospitality_partner', label: 'Hospitality Partner' },
                            { value: 'food_beverage_partner', label: 'Food & Beverage Partner' },
                            { value: 'travel_partner', label: 'Travel Partner' },
                            { value: 'logistics_partner', label: 'Logistics Partner' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.sponsor_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.sponsor_types, option.value]
                                    : formData.sponsor_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, sponsor_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Special Categories */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Special Categories</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'merchandise_partner', label: 'Merchandise Partner' },
                            { value: 'gift_partner', label: 'Gift Partner' },
                            { value: 'trophy_partner', label: 'Trophy Partner' },
                            { value: 'strategic_partner', label: 'Strategic Partner' },
                            { value: 'community_partner', label: 'Community Partner' },
                            { value: 'supporting_partner', label: 'Supporting Partner' },
                            { value: 'other', label: 'Other (Custom)' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.sponsor_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.sponsor_types, option.value]
                                    : formData.sponsor_types.filter(t => t !== option.value);
                                  setFormData({ 
                                    ...formData, 
                                    sponsor_types: newTypes,
                                    custom_type_name: !e.target.checked && option.value === 'other' ? '' : formData.custom_type_name
                                  });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {formData.type === 'collaborator' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Collaborator Categories (select multiple)</label>
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                      
                      {/* Academic & Research */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Academic & Research</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'academic_collaborator', label: 'Academic Collaborator' },
                            { value: 'research_collaborator', label: 'Research Collaborator' },
                            { value: 'student_organization', label: 'Student Organization' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.collaborator_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.collaborator_types, option.value]
                                    : formData.collaborator_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, collaborator_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Industry & Professional */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Industry & Professional</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'industry_collaborator', label: 'Industry Collaborator' },
                            { value: 'professional_body', label: 'Professional Body' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.collaborator_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.collaborator_types, option.value]
                                    : formData.collaborator_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, collaborator_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Government & NGO */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Government & NGO</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'government_collaborator', label: 'Government Collaborator' },
                            { value: 'ngo_collaborator', label: 'NGO Collaborator' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.collaborator_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.collaborator_types, option.value]
                                    : formData.collaborator_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, collaborator_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Technical & Creative */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Technical & Creative</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'technical_collaborator', label: 'Technical Collaborator' },
                            { value: 'creative_collaborator', label: 'Creative Collaborator' },
                            { value: 'content_collaborator', label: 'Content Collaborator' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.collaborator_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.collaborator_types, option.value]
                                    : formData.collaborator_types.filter(t => t !== option.value);
                                  setFormData({ ...formData, collaborator_types: newTypes });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Event Support */}
                      <div className="mb-4">
                        <h4 className="text-purple-400 font-semibold text-sm mb-2">Event Support</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'event_collaborator', label: 'Event Collaborator' },
                            { value: 'volunteer_collaborator', label: 'Volunteer Collaborator' },
                            { value: 'other', label: 'Other (Custom)' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.collaborator_types.includes(option.value)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.collaborator_types, option.value]
                                    : formData.collaborator_types.filter(t => t !== option.value);
                                  setFormData({ 
                                    ...formData, 
                                    collaborator_types: newTypes,
                                    custom_type_name: !e.target.checked && option.value === 'other' ? '' : formData.custom_type_name
                                  });
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Custom Type Name Field - Shows when "other" is selected */}
                {((formData.type === 'sponsor' && formData.sponsor_types.includes('other')) || 
                  (formData.type === 'collaborator' && formData.collaborator_types.includes('other'))) && (
                  <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-yellow-300 mb-2">
                      Custom Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.custom_type_name}
                      onChange={(e) => setFormData({ ...formData, custom_type_name: e.target.value })}
                      placeholder="Enter custom category name (e.g., Gaming Hardware Partner)"
                      className="w-full px-4 py-2 bg-gray-700 border border-yellow-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <p className="text-xs text-yellow-200 mt-1">
                      Since you selected "Other", please specify a custom category name
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Order *</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    placeholder="1, 2, 3..."
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower numbers appear first (e.g., 1 will be shown before 2)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website *</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Events / Activities Association</label>
                  <textarea
                    value={formData.events.join('\n')}
                    onChange={(e) => setFormData({ ...formData, events: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Enter event names (one per line)"
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 resize-vertical"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter event names, one per line (e.g., press Enter after each event name)</p>
                </div>

                <div className="border border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Social Media Links</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={formData.social_media.facebook}
                        onChange={(e) => setFormData({ ...formData, social_media: { ...formData.social_media, facebook: e.target.value } })}
                        placeholder="https://facebook.com/..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Instagram</label>
                      <input
                        type="url"
                        value={formData.social_media.instagram}
                        onChange={(e) => setFormData({ ...formData, social_media: { ...formData.social_media, instagram: e.target.value } })}
                        placeholder="https://instagram.com/..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        value={formData.social_media.linkedin}
                        onChange={(e) => setFormData({ ...formData, social_media: { ...formData.social_media, linkedin: e.target.value } })}
                        placeholder="https://linkedin.com/..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Twitter / X</label>
                      <input
                        type="url"
                        value={formData.social_media.twitter}
                        onChange={(e) => setFormData({ ...formData, social_media: { ...formData.social_media, twitter: e.target.value } })}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">YouTube</label>
                      <input
                        type="url"
                        value={formData.social_media.youtube}
                        onChange={(e) => setFormData({ ...formData, social_media: { ...formData.social_media, youtube: e.target.value } })}
                        placeholder="https://youtube.com/..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 focus:ring-2"
                    />
                    <span className="text-gray-300 font-medium">Publish immediately</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-5 h-5 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                    />
                    <span className="text-gray-300 font-medium flex items-center">
                      <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Mark as Featured (shown on homepage)
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    {editingSponsor ? 'Update' : 'Add'} Sponsor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AdminHelpButton
        title="Sponsors Management"
        instructions={[
          'Add sponsor organizations',
          'Upload sponsor logos',
          'Set sponsor tier levels',
          'Add sponsor website links',
          'Remove outdated sponsors'
        ]}
        tips={[
          'Use high-resolution logos on transparent backgrounds',
          'Organize sponsors by tier importance',
          'Keep sponsor information up to date'
        ]}
        actions={[
          { label: 'Add Sponsor', description: 'create new entry' },
          { label: 'Edit Sponsor', description: 'modify details' },
          { label: 'Delete Sponsor', description: 'remove sponsor' }
        ]}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActivityPublish,
  getAllSponsors,
  updateActivitySponsors,
  getActivityWithSponsors,
} from '@/lib/supabase-queries';
import type { Activity, Sponsor, Guest } from '@/lib/types/database';

const initialFormData = {
  slug: '',
  title: '',
  category: 'Tournament',
  description: '',
  date: '',
  time: '',
  venue: '',
  status: 'upcoming',
  participants: '',
  is_published: false,
  is_featured: false,
  banner_image_url: '',
  short_description: '',
  facebook_post_url: '',
  tags: [] as string[],
  guests: [] as Guest[],
};

const initialTagInput = '';

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState(initialTagInput);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['Tournament', 'Social Event', 'Workshop', 'Seminar', 'Charity Event', 'Online Event', 'Offline Event'];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [activitiesData, sponsorsData] = await Promise.all([
          getAllActivities(),
          getAllSponsors(),
        ]);
        setActivities(activitiesData);
        setSponsors(sponsorsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        alert('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getAllActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || activity.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenForm = async (activity?: Activity) => {
    if (activity) {
      const activityWithDetails = await getActivityWithSponsors(activity.id);
      if (!activityWithDetails) {
        alert("Failed to fetch activity details.");
        return;
      }
      const { sponsorIds, ...activityDetails } = activityWithDetails;
      setEditingActivity(activity);
      setFormData({
        ...initialFormData,
        ...(activityDetails as Activity),
        tags: activityDetails.tags || [],
        guests: activityDetails.guests || [],
      });
      setSelectedSponsors(sponsorIds || []);
      setImagePreview(activityDetails.banner_image_url || '');
    } else {
      setEditingActivity(null);
      setFormData(initialFormData);
      setSelectedSponsors([]);
      setImagePreview('');
    }
    setTagInput('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingActivity(null);
    setImagePreview('');
    setTagInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, banner_image_url: url });
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activityData: Partial<Activity> = {
      slug: formData.slug || generateSlug(formData.title),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      status: formData.status,
      participants: formData.participants,
      is_published: formData.is_published,
      is_featured: formData.is_featured,
      banner_image_url: formData.banner_image_url,
      short_description: formData.short_description,
      facebook_post_url: formData.facebook_post_url,
      tags: formData.tags,
      guests: formData.guests,
    };

    try {
      let activityId = editingActivity?.id;

      if (editingActivity) {
        // Slug should not be updated for existing activities.
        const { slug, ...updateData } = activityData;
        await updateActivity(editingActivity.id, updateData);
      } else {
        const newActivity = await createActivity(activityData as Activity);
        activityId = newActivity.id;
      }
      
      if (activityId) {
        await updateActivitySponsors(activityId, selectedSponsors);
      }

      await fetchActivities();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivity(id);
        await fetchActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const activity = activities.find((a) => a.id === id);
      if (activity) {
        await toggleActivityPublish(id, !activity.is_published);
        await fetchActivities();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publish status. Please try again.');
    }
  };

  // Handlers for guests dynamic form
  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    const updatedGuests = [...formData.guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setFormData({ ...formData, guests: updatedGuests });
  };

  const addGuest = () => {
    setFormData({ ...formData, guests: [...formData.guests, { name: '', designation: '', photo: '' }] });
  };

  const removeGuest = (index: number) => {
    const updatedGuests = formData.guests.filter((_, i) => i !== index);
    setFormData({ ...formData, guests: updatedGuests });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Activities Manager</h1>
          <p className="text-gray-400">Manage events, workshops, and activities</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Activity</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white">{activity.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">{activity.short_description || activity.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleTogglePublish(activity.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${activity.is_published ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}
                >
                  {activity.is_published ? 'Published' : 'Draft'}
                </button>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleOpenForm(activity)} className="p-2 text-blue-400 hover:text-blue-300"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button onClick={() => handleDelete(activity.id)} className="p-2 text-red-400 hover:text-red-300"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm}></div>
            <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 flex items-center justify-between p-6 border-b border-gray-700 z-10">
                <h2 className="text-2xl font-bold text-white">{editingActivity ? 'Edit Activity' : 'Add New Activity'}</h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: editingActivity ? formData.slug : generateSlug(e.target.value) })} placeholder="Title *" className="w-full p-2 bg-gray-700 rounded" required />
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="Slug *" className="w-full p-2 bg-gray-700 rounded" required disabled={!!editingActivity} />
                </div>
                <textarea value={formData.short_description || ''} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} placeholder="Short Description (shows under title)" rows={2} className="w-full p-2 bg-gray-700 rounded" />
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Full Description *" rows={4} className="w-full p-2 bg-gray-700 rounded" required />
                
                {/* Details */}
                <div className="grid md:grid-cols-4 gap-6">
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 bg-gray-700 rounded" required />
                  <input type="text" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="Time *" className="w-full p-2 bg-gray-700 rounded" required />
                  <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} placeholder="Venue *" className="w-full p-2 bg-gray-700 rounded" required />
                  <input type="number" value={formData.participants} onChange={(e) => setFormData({ ...formData, participants: e.target.value })} placeholder="Participants *" className="w-full p-2 bg-gray-700 rounded" required />
                </div>

                {/* Links & Media */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Banner Image URL</label>
                        <input type="text" value={formData.banner_image_url || ''} onChange={handleImageUrlChange} placeholder="Banner Image URL (/events/my-banner.png)" className="w-full p-2 bg-gray-700 rounded" />
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                                <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ height: '180px' }}>
                                    <img 
                                        src={imagePreview.startsWith('http') ? imagePreview : `${imagePreview}`} 
                                        alt="Banner Preview" 
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={() => setImagePreview('')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Facebook Post URL</label>
                        <input type="text" value={formData.facebook_post_url || ''} onChange={(e) => setFormData({ ...formData, facebook_post_url: e.target.value })} placeholder="Facebook Post URL" className="w-full p-2 bg-gray-700 rounded" />
                    </div>
                </div>

                {/* Tags Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      value={tagInput} 
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag..." 
                      className="flex-1 p-2 bg-gray-700 rounded" 
                    />
                    <button 
                      type="button" 
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium"
                    >
                      Add Tag
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm flex items-center gap-2">
                          {tag}
                          <button 
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="hover:text-red-300 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Guests</h3>
                  {formData.guests.map((guest, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-900 rounded-lg">
                      <input type="text" value={guest.name} onChange={(e) => handleGuestChange(index, 'name', e.target.value)} placeholder="Guest Name" className="w-full p-2 bg-gray-700 rounded" />
                      <input type="text" value={guest.designation} onChange={(e) => handleGuestChange(index, 'designation', e.target.value)} placeholder="Designation" className="w-full p-2 bg-gray-700 rounded" />
                      <div className="flex gap-2">
                        <input type="text" value={guest.photo} onChange={(e) => handleGuestChange(index, 'photo', e.target.value)} placeholder="Photo URL" className="w-full p-2 bg-gray-700 rounded" />
                        <button type="button" onClick={() => removeGuest(index)} className="p-2 bg-red-600 rounded text-white">X</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addGuest} className="px-4 py-2 bg-blue-600 rounded text-white">Add Guest</button>
                </div>

                {/* Sponsors */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Sponsors</h3>
                    <div className="grid grid-cols-3 gap-4 max-h-48 overflow-y-auto p-4 bg-gray-900 rounded-lg">
                        {sponsors.map(sponsor => (
                            <label key={sponsor.id} className="flex items-center space-x-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={selectedSponsors.includes(sponsor.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedSponsors([...selectedSponsors, sponsor.id]);
                                        } else {
                                            setSelectedSponsors(selectedSponsors.filter(id => id !== sponsor.id));
                                        }
                                    }}
                                />
                                <span>{sponsor.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} /> <span className="text-white">Publish</span></label>
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} /> <span className="text-white">Featured</span></label>
                </div>

                {/* Category and Status */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white">
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="past">Past</option>
                            <option value="recurring">Recurring</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
                  <button type="button" onClick={handleCloseForm} className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg">{editingActivity ? 'Update' : 'Create'} Activity</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
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
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  TagIcon,
  PhotoIcon,
  LinkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

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

  // Helper for input styles
  const inputClassName = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-gray-500 hover:bg-black/30";
  const labelClassName = "block text-sm font-medium text-gray-300 mb-2 ml-1";

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
           <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Activities Manager</h1>
           <p className="text-gray-400 text-lg">Manage events, workshops, and community activities</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4 text-purple-400 font-medium uppercase tracking-wider text-xs">
            <FunnelIcon className="w-4 h-4" /> Filters
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
             <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
             <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className={`${inputClassName} pl-12`}
             />
          </div>
          <div className="relative">
             <TagIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
             <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`${inputClassName} pl-12 appearance-none`}
             >
                <option value="all" className="bg-gray-900">All Categories</option>
                {categories.map((cat) => <option key={cat} value={cat} className="bg-gray-900">{cat}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
           <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading events...</p>
          </div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-16 text-center">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
               <CalendarIcon className="w-10 h-10 text-gray-600" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">No activities found</h3>
           <p className="text-gray-400 mb-6">Create your first event to get started.</p>
           <button onClick={() => handleOpenForm()} className="text-purple-400 hover:text-purple-300 font-semibold">+ Add Activity</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="group bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col">
               {/* Banner Image */}
               <div className="h-48 bg-black/40 relative overflow-hidden">
                  {activity.banner_image_url ? (
                     <img 
                       src={activity.banner_image_url} 
                       alt={activity.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <PhotoIcon className="w-12 h-12" />
                     </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                        activity.status === 'upcoming' ? 'bg-blue-500/80 text-white' :
                        activity.status === 'ongoing' ? 'bg-green-500/80 text-white animate-pulse' :
                        'bg-gray-700/80 text-gray-300'
                     }`}>
                        {activity.status}
                     </span>
                  </div>
               </div>

               <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{activity.category}</span>
                     <button
                        onClick={() => handleTogglePublish(activity.id)}
                        className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            activity.is_published 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                        }`}
                     >
                        {activity.is_published ? 'Published' : 'Draft'}
                     </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">{activity.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{activity.short_description || activity.description}</p>
                  
                  <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span>{activity.date} • {activity.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          <span className="truncate">{activity.venue}</span>
                      </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                     <div className="flex -space-x-2">
                        {/* Placeholder for participant avatars if available, otherwise generic count */}
                         <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                            <UserGroupIcon className="w-4 h-4" />
                         </div>
                         <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[10px] text-gray-400 font-bold pl-1">
                            +{activity.participants}
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenForm(activity)}
                          className="p-2 bg-white/5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg transition-colors"
                          title="Edit"
                        >
                           <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="p-2 bg-white/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                          title="Delete"
                        >
                           <TrashIcon className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Form */}
      {isFormOpen && (
         <div className="fixed inset-0 z-50 overflow-hidden">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm} />
           <div className="absolute inset-y-0 right-0 max-w-2xl w-full flex">
             <div className="w-full bg-gray-900 border-l border-white/10 shadow-2xl flex flex-col animate-slideRight">
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-gray-900/50 backdrop-blur-xl z-10">
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <CalendarIcon className="w-5 h-5 text-purple-500" />
                     {editingActivity ? 'Edit Activity' : 'New Activity'}
                   </h2>
                   <button onClick={handleCloseForm} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                     <XMarkIcon className="w-6 h-6" />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    <form id="activity-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">Basic Info</h3>
                            <div>
                                <label className={labelClassName}>Activity Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: editingActivity ? formData.slug : generateSlug(e.target.value) })}
                                    className={inputClassName}
                                    required
                                />
                            </div>
                             <div>
                                <label className={labelClassName}>Slug (URL Friendly) *</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className={`${inputClassName} opacity-70`}
                                    disabled={!!editingActivity}
                                    required
                                />
                            </div>
                             <div>
                                <label className={labelClassName}>Short Description (2 lines max)</label>
                                <textarea
                                    value={formData.short_description || ''}
                                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    className={inputClassName}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className={labelClassName}>Full Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`${inputClassName} h-32`}
                                    required
                                />
                            </div>
                        </div>

                         {/* Logistics */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">Logistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClassName}>Date *</label>
                                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClassName} required />
                                </div>
                                <div>
                                    <label className={labelClassName}>Time *</label>
                                    <input type="text" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className={inputClassName} placeholder="10:00 AM" required />
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClassName}>Venue *</label>
                                    <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className={inputClassName} placeholder="Room 202 / Online" required />
                                </div>
                                <div>
                                    <label className={labelClassName}>Max Participants</label>
                                    <input type="number" value={formData.participants} onChange={(e) => setFormData({ ...formData, participants: e.target.value })} className={inputClassName} placeholder="0 for unlimited" />
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">Media & Links</h3>
                             <div>
                                <label className={labelClassName}>Banner Image URL</label>
                                <div className="space-y-3">
                                    <input type="text" value={formData.banner_image_url || ''} onChange={handleImageUrlChange} className={inputClassName} placeholder="/events/banner.jpg" />
                                    {imagePreview && (
                                        <div className="relative w-full h-40 bg-black/40 rounded-xl overflow-hidden border border-white/10">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div>
                                <label className={labelClassName}>Facebook Post Link</label>
                                <input type="url" value={formData.facebook_post_url || ''} onChange={(e) => setFormData({ ...formData, facebook_post_url: e.target.value })} className={inputClassName} placeholder="https://facebook.com/..." />
                            </div>
                        </div>

                         {/* Organization */}
                        <div className="space-y-4">
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">Organization</h3>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className={labelClassName}>Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClassName}>
                                        {categories.map(cat => <option key={cat} value={cat} className="bg-gray-900">{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClassName}>Status</label>
                                     <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClassName}>
                                        <option value="upcoming" className="bg-gray-900">Upcoming</option>
                                        <option value="ongoing" className="bg-gray-900">Ongoing</option>
                                        <option value="past" className="bg-gray-900">Past</option>
                                        <option value="recurring" className="bg-gray-900">Recurring</option>
                                    </select>
                                </div>
                             </div>

                             {/* Tags */}
                             <div>
                                <label className={labelClassName}>Tags</label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        value={tagInput} 
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        className={inputClassName}
                                        placeholder="Add tag..."
                                    />
                                    <button type="button" onClick={handleAddTag} className="px-4 bg-purple-600 rounded-xl font-bold text-white hover:bg-purple-500">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium text-purple-300 flex items-center gap-2 border border-white/5">
                                            {tag}
                                            <button type="button" onClick={() => handleRemoveTag(index)} className="hover:text-white"><XMarkIcon className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                             </div>

                             {/* Sponsors */}
                             <div>
                                <label className={labelClassName}>Associated Sponsors</label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-3 bg-black/20 rounded-xl border border-white/5">
                                    {sponsors.map(sponsor => (
                                        <label key={sponsor.id} className="flex items-center space-x-3 text-gray-300 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
                                            <div className="relative">
                                                 <input
                                                    type="checkbox"
                                                    checked={selectedSponsors.includes(sponsor.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedSponsors([...selectedSponsors, sponsor.id]);
                                                        else setSelectedSponsors(selectedSponsors.filter(id => id !== sponsor.id));
                                                    }}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-5 h-5 border-2 border-gray-600 rounded peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-all flex items-center justify-center">
                                                    <CheckCircleIcon className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100" />
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">{sponsor.name}</span>
                                        </label>
                                    ))}
                                </div>
                             </div>
                        </div>

                         {/* Guests */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2 flex justify-between items-center">
                                Specific Guests
                                <button type="button" onClick={addGuest} className="text-xs text-purple-400 hover:text-purple-300">+ Add Guest</button>
                            </h3>
                            {formData.guests.map((guest, index) => (
                                <div key={index} className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3 relative">
                                    <button type="button" onClick={() => removeGuest(index)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400"><XMarkIcon className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" value={guest.name} onChange={(e) => handleGuestChange(index, 'name', e.target.value)} placeholder="Name" className={inputClassName} />
                                        <input type="text" value={guest.designation} onChange={(e) => handleGuestChange(index, 'designation', e.target.value)} placeholder="Designation" className={inputClassName} />
                                    </div>
                                    <input type="text" value={guest.photo} onChange={(e) => handleGuestChange(index, 'photo', e.target.value)} placeholder="Photo URL" className={inputClassName} />
                                </div>
                            ))}
                            {formData.guests.length === 0 && <p className="text-gray-500 text-sm italic">No specific guests added.</p>}
                        </div>
                        
                        {/* Toggles */}
                        <div className="flex items-center gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                             <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="sr-only peer" />
                                    <div className="w-10 h-6 bg-gray-700 rounded-full peer-checked:bg-green-600 transition-all peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </div>
                                <span className="text-gray-300 font-medium">Publish</span>
                             </label>
                             <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="sr-only peer" />
                                    <div className="w-10 h-6 bg-gray-700 rounded-full peer-checked:bg-purple-600 transition-all peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </div>
                                <span className="text-gray-300 font-medium">Featured</span>
                             </label>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-white/10 bg-gray-900 z-10">
                   <button
                      type="submit"
                      form="activity-form"
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                     {editingActivity ? 'Update Activity' : 'Create Activity'}
                   </button>
                </div>
             </div>
           </div>
         </div>
      )}

      <AdminHelpButton
        title="📅 Activities & Events Manager"
        instructions={[
          "**Create Activity**: Click `+ Add Activity` to open the creation drawer with all fields.",
          "**Edit Mode**: Click the pencil icon on any card to modify existing activity details.",
          "**Quick Publish**: Use the 'Published/Draft' toggle directly on cards for instant visibility control.",
          "**Search & Filter**: Use the search bar for titles and the category dropdown to find events quickly.",
          "**Sponsors**: Link multiple sponsors to auto-display their logos on the activity page."
        ]}
        tips={[
          "**Featured Events**: Enabling 'Featured' displays the event prominently on the homepage hero section.",
          "**Auto-Slug**: Slugs are auto-generated from titles. You can customize them for better SEO URLs.",
          "**Banner Images**: Use 16:9 aspect ratio images (1920x1080 recommended) for best display.",
          "**Status Badges**: 'Ongoing' status adds a pulsing live indicator on the public page.",
          "**Tags**: Add relevant tags to improve event discoverability and categorization."
        ]}
        actions={[
          {
            title: "📝 Content Formatting",
            description: 
              "The description field supports Markdown-like formatting:\n\n**Bold text**: `**your text**`\n**Bullet points**: Start line with `-`\n**Links**: `[Link Text](https://url.com)`\n\n*Preview your content on the public page after saving.*"
          },
          {
            title: "🖼️ Image Guidelines",
            description:
              "**Recommended Size**: `1920 x 1080` (16:9 aspect ratio)\n**Max File Size**: 2MB for optimal loading\n\n**Hosting Options**:\n- Use direct image URLs from cloud storage\n- Imgur, Cloudinary, or S3 bucket links work best"
          },
          {
            title: "⚙️ Status Guide",
            description:
              "**Upcoming**: Visible in 'Upcoming Events' section\n**Ongoing**: Shows 'Live' badge with pulse animation\n**Past**: Moves to archive/history section\n**Recurring**: For weekly/monthly repeating events"
          },
          {
            title: "👥 Guest Speakers",
            description:
              "Add guest profiles that appear on the event detail page:\n\n**Name**: Full name of the speaker\n**Designation**: Title or role (e.g., 'CEO at Company')\n**Photo URL**: Direct link to their headshot image"
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
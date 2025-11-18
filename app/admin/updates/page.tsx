'use client';

import { useState, useEffect } from 'react';
import { 
  getAllUpdates, 
  createUpdate, 
  updateUpdate, 
  deleteUpdate,
  toggleUpdatePublish 
} from '@/lib/supabase-queries';
import type { Update } from '@/lib/types/database';

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    date: '',
    is_published: false,
    image_url: '',
    buttons: [] as { name: string; link: string }[],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [buttonInput, setButtonInput] = useState({ name: '', link: '' });

  // Fetch updates from Supabase on mount
  useEffect(() => {
    fetchUpdates();
  }, []);

  async function fetchUpdates() {
    try {
      setLoading(true);
      const data = await getAllUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Error fetching updates:', error);
      alert('Failed to fetch updates. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Filter updates
  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && update.is_published) ||
      (filterStatus === 'draft' && !update.is_published);
    return matchesSearch && matchesStatus;
  });

  const handleOpenForm = (update?: Update) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        title: update.title,
        summary: update.summary,
        content: update.content,
        date: update.date,
        is_published: update.is_published,
        image_url: update.image_url || '',
        buttons: update.buttons || [],
      });
      setImagePreview(update.image_url || '');
    } else {
      setEditingUpdate(null);
      setFormData({
        title: '',
        summary: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        is_published: false,
        image_url: '',
        buttons: [],
      });
      setImagePreview('');
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUpdate(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      date: '',
      is_published: false,
      image_url: '',
      buttons: [],
    });
    setImagePreview('');
    setButtonInput({ name: '', link: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUpdate) {
        // Update existing
        await updateUpdate(editingUpdate.id, formData);
      } else {
        // Create new
        await createUpdate(formData);
      }
      
      // Refresh the list
      await fetchUpdates();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving update:', error);
      alert('Failed to save update. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this update?')) {
      try {
        await deleteUpdate(id);
        await fetchUpdates();
      } catch (error) {
        console.error('Error deleting update:', error);
        alert('Failed to delete update. Please try again.');
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const update = updates.find((u) => u.id === id);
      if (update) {
        await toggleUpdatePublish(id, !update.is_published);
        await fetchUpdates();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publish status. Please try again.');
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
  };

  const handleAddButton = () => {
    if (buttonInput.name.trim() && buttonInput.link.trim()) {
      setFormData({
        ...formData,
        buttons: [...formData.buttons, { ...buttonInput }],
      });
      setButtonInput({ name: '', link: '' });
    }
  };

  const handleRemoveButton = (index: number) => {
    setFormData({
      ...formData,
      buttons: formData.buttons.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Updates Manager</h1>
          <p className="text-gray-400">
            Manage website updates and announcements
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Update</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Updates
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or summary..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Updates</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Total Updates</p>
          <p className="text-2xl font-bold text-white">{updates.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Published</p>
          <p className="text-2xl font-bold text-green-400">
            {updates.filter((u) => u.is_published).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">Drafts</p>
          <p className="text-2xl font-bold text-yellow-400">
            {updates.filter((u) => !u.is_published).length}
          </p>
        </div>
      </div>

      {/* Updates List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading updates...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUpdates.map((update) => (
                <tr key={update.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{update.title}</p>
                      <p className="text-gray-400 text-sm line-clamp-1">{update.summary}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(update.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(update.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        update.is_published
                          ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                          : 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70'
                      } transition-colors`}
                    >
                      {update.is_published ? '✓ Published' : '○ Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(update.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenForm(update)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUpdates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No updates found</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm}></div>
            
            <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full border border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">
                  {editingUpdate ? 'Edit Update' : 'Add New Update'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Summary *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="Image URL or public path (e.g., /images/update.png or https://...)"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                      <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                          onError={() => setImagePreview('')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Action Buttons (Optional)
                  </label>
                  <div className="space-y-2 mb-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={buttonInput.name}
                        onChange={(e) => setButtonInput({ ...buttonInput, name: e.target.value })}
                        placeholder="Button name (e.g., Join Meeting)"
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <input
                        type="text"
                        value={buttonInput.link}
                        onChange={(e) => setButtonInput({ ...buttonInput, link: e.target.value })}
                        placeholder="Link (e.g., https://...)"
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddButton}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                      >
                        Add Button
                      </button>
                    </div>
                  </div>
                  {formData.buttons.length > 0 && (
                    <div className="space-y-2">
                      {formData.buttons.map((button, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                          <div className="flex-1">
                            <p className="text-white font-medium">{button.name}</p>
                            <p className="text-sm text-gray-400 truncate">{button.link}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveButton(index)}
                            className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date and Publish */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) =>
                          setFormData({ ...formData, is_published: e.target.checked })
                        }
                        className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 focus:ring-2"
                      />
                      <span className="text-gray-300 font-medium">Publish immediately</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
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
                    {editingUpdate ? 'Update' : 'Create'} Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

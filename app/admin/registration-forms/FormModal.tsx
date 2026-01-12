'use client';

import { useState } from 'react';
import type { FormField } from '@/lib/types/database';

interface FormModalProps {
  formData: any;
  setFormData: (data: any) => void;
  formFields: FormField[];
  setFormFields: (fields: FormField[]) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
  onOpenFieldModal: (field?: FormField, index?: number) => void;
  onDeleteField: (fieldId: string) => void;
  isEditing: boolean;
}

export default function FormModal({
  formData,
  setFormData,
  formFields,
  onSave,
  onClose,
  onOpenFieldModal,
  onDeleteField,
  isEditing,
}: FormModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'design' | 'fields'>('basic');

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit' : 'Create'} Registration Form</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 py-3 bg-gray-700/50 border-b border-gray-700 overflow-x-auto">
          {['basic', 'design', 'fields'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {tab === 'basic' && '📝 Basic'}
              {tab === 'design' && '🎨 Design'}
              {tab === 'fields' && '📋 Fields'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* BASIC TAB */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Game Name *</label>
                  <input
                    type="text"
                    value={formData.game_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        game_name: e.target.value,
                        game_slug: generateSlug(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="PUBG Mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL Slug *</label>
                  <input
                    type="text"
                    value={formData.game_slug}
                    onChange={(e) => setFormData({ ...formData, game_slug: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="pubg-mobile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Form Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="PUBG Mobile Tournament Registration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-xs text-gray-400 font-normal ml-1">(Supports HTML: &lt;b&gt;, &lt;br&gt;, etc.)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Register for our tournament..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Google Sheet URL *</label>
                <input
                  type="url"
                  value={formData.google_sheet_url}
                  onChange={(e) => setFormData({ ...formData, google_sheet_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="https://script.google.com/macros/s/..."
                />
                <p className="text-xs text-gray-400 mt-1">Google Apps Script Web App URL for data collection</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Banner URL (Top of Form)</label>
                <input
                  type="text"
                  value={formData.banner_url || ''}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="https://... or /images/banner.jpg"
                />
                {formData.banner_url && (
                  <img
                    src={formData.banner_url}
                    alt="Banner Preview"
                    className="mt-2 w-full h-24 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Registration Fee (BDT)</label>
                  <input
                    type="text"
                    value={formData.registration_fee || ''}
                    onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, registration_deadline: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Form is Active (accepts submissions)</span>
                </label>
              </div>
            </div>
          )}

          {/* DESIGN TAB */}
          {activeTab === 'design' && (
            <div className="space-y-4">
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-3">Logos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organizer Logo</label>
                    <input
                      type="text"
                      value={formData.organizer_logo_url}
                      onChange={(e) =>
                        setFormData({ ...formData, organizer_logo_url: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="https://... or /logos/club.png"
                    />
                    {formData.organizer_logo_url && (
                      <img
                        src={formData.organizer_logo_url}
                        alt="Organizer"
                        className="mt-2 h-16 object-contain bg-white/5 rounded p-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tournament Logo</label>
                    <input
                      type="text"
                      value={formData.tournament_logo_url}
                      onChange={(e) =>
                        setFormData({ ...formData, tournament_logo_url: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="https://... or /logos/tournament.png"
                    />
                    {formData.tournament_logo_url && (
                      <img
                        src={formData.tournament_logo_url}
                        alt="Tournament"
                        className="mt-2 h-16 object-contain bg-white/5 rounded p-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Game Logo</label>
                    <input
                      type="text"
                      value={formData.game_logo_url}
                      onChange={(e) => setFormData({ ...formData, game_logo_url: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="https://... or /logos/game.png"
                    />
                    {formData.game_logo_url && (
                      <img
                        src={formData.game_logo_url}
                        alt="Game"
                        className="mt-2 h-16 object-contain bg-white/5 rounded p-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FIELDS TAB */}
          {activeTab === 'fields' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Form Fields ({formFields.length})</h3>
                <button
                  onClick={() => onOpenFieldModal()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                >
                  + Add Field
                </button>
              </div>

              {formFields.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No fields added yet. Click "Add Field" to create form fields.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{field.label}</p>
                        <p className="text-xs text-gray-400">
                          Type: <span className="uppercase">{field.type}</span>
                          {field.required && ' • Required'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onOpenFieldModal(field, index)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteField(field.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 bg-gray-700/50 border-t border-gray-700">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
          >
            {isEditing ? 'Update Form' : 'Create Form'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

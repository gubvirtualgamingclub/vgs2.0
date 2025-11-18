'use client';

import { useState, useEffect } from 'react';
import {
  getAllRegistrationForms,
  createRegistrationForm,
  updateRegistrationForm,
  deleteRegistrationForm,
  toggleFormStatus,
  getSubmissionCount,
} from '@/lib/registration-api';
import type { RegistrationForm, FormField } from '@/lib/types/database';

export default function RegistrationFormsAdmin() {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<RegistrationForm | null>(null);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});

  // Form state
  const [formData, setFormData] = useState({
    game_name: '',
    game_slug: '',
    title: '',
    description: '',
    google_sheet_url: '',
    is_active: false,
    max_registrations: '',
    registration_deadline: '',
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      setLoading(true);
      const data = await getAllRegistrationForms();
      setForms(data);

      // Fetch submission counts
      const counts: Record<string, number> = {};
      for (const form of data) {
        counts[form.id] = await getSubmissionCount(form.id);
      }
      setSubmissionCounts(counts);
    } catch (error) {
      console.error('Error fetching forms:', error);
      alert('Failed to load registration forms');
    } finally {
      setLoading(false);
    }
  }

  function openFormModal(form?: RegistrationForm) {
    if (form) {
      setEditingForm(form);
      setFormData({
        game_name: form.game_name,
        game_slug: form.game_slug,
        title: form.title,
        description: form.description || '',
        google_sheet_url: form.google_sheet_url,
        is_active: form.is_active,
        max_registrations: form.max_registrations?.toString() || '',
        registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString().slice(0, 16) : '',
      });
      setFormFields(form.form_fields || []);
    } else {
      setEditingForm(null);
      setFormData({
        game_name: '',
        game_slug: '',
        title: '',
        description: '',
        google_sheet_url: '',
        is_active: false,
        max_registrations: '',
        registration_deadline: '',
      });
      setFormFields([]);
    }
    setFormModalOpen(true);
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function handleSaveForm() {
    try {
      if (!formData.game_name || !formData.title || !formData.google_sheet_url) {
        alert('Please fill in all required fields');
        return;
      }

      if (formFields.length === 0) {
        alert('Please add at least one form field');
        return;
      }

      const payload: any = {
        ...formData,
        game_slug: formData.game_slug || generateSlug(formData.game_name),
        form_fields: formFields,
        max_registrations: formData.max_registrations ? parseInt(formData.max_registrations) : null,
        registration_deadline: formData.registration_deadline || null,
      };

      if (editingForm) {
        await updateRegistrationForm(editingForm.id, payload);
        alert('Registration form updated successfully!');
      } else {
        await createRegistrationForm(payload);
        alert('Registration form created successfully!');
      }

      setFormModalOpen(false);
      fetchForms();
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save registration form');
    }
  }

  async function handleDeleteForm(id: string) {
    if (!confirm('Are you sure you want to delete this registration form? All submissions will also be deleted.')) {
      return;
    }

    try {
      await deleteRegistrationForm(id);
      alert('Registration form deleted successfully!');
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete registration form');
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      await toggleFormStatus(id, !currentStatus);
      fetchForms();
    } catch (error) {
      console.error('Error toggling form status:', error);
      alert('Failed to update form status');
    }
  }

  function openFieldModal(field?: FormField, index?: number) {
    if (field && index !== undefined) {
      setEditingField({ ...field, id: index.toString() });
    } else {
      setEditingField({
        id: Date.now().toString(),
        label: '',
        type: 'text',
        required: false,
        options: [],
      });
    }
    setFieldModalOpen(true);
  }

  function handleSaveField(field: FormField) {
    const existingIndex = formFields.findIndex((f) => f.id === field.id);
    if (existingIndex >= 0) {
      const updated = [...formFields];
      updated[existingIndex] = field;
      setFormFields(updated);
    } else {
      setFormFields([...formFields, field]);
    }
    setFieldModalOpen(false);
  }

  function handleDeleteField(fieldId: string) {
    setFormFields(formFields.filter((f) => f.id !== fieldId));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p>Loading registration forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Registration Forms Management</h1>
              <p className="text-sm text-gray-400">Create and manage game registration forms</p>
            </div>
            <button
              onClick={() => openFormModal()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
            >
              + Create New Form
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {forms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold mb-3">No Registration Forms Yet</h3>
            <p className="text-gray-400 mb-6">Create your first registration form to start collecting submissions</p>
            <button
              onClick={() => openFormModal()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
            >
              Create Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{form.game_name}</h3>
                      <p className="text-sm text-gray-400">{form.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(form.id, form.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          form.is_active ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        {form.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Form Fields:</span>
                      <span className="font-semibold">{form.form_fields?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Submissions:</span>
                      <span className="font-semibold text-green-400">{submissionCounts[form.id] || 0}</span>
                    </div>
                    {form.max_registrations && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Max Registrations:</span>
                        <span className="font-semibold">{form.max_registrations}</span>
                      </div>
                    )}
                    {form.registration_deadline && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Deadline:</span>
                        <span className="font-semibold">{new Date(form.registration_deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openFormModal(form)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => window.open(`/register/${form.game_slug}`, '_blank')}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/register/${form.game_slug}`;
                        navigator.clipboard.writeText(url);
                        alert('✅ Registration link copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
                      title="Copy registration link"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold"
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

      {/* Form Modal (To be continued in next part...) */}
      {formModalOpen && (
        <FormModal
          formData={formData}
          setFormData={setFormData}
          formFields={formFields}
          setFormFields={setFormFields}
          onSave={handleSaveForm}
          onClose={() => setFormModalOpen(false)}
          onOpenFieldModal={openFieldModal}
          onDeleteField={handleDeleteField}
          isEditing={!!editingForm}
        />
      )}

      {/* Field Modal */}
      {fieldModalOpen && editingField && (
        <FieldModal
          field={editingField}
          onSave={handleSaveField}
          onClose={() => setFieldModalOpen(false)}
        />
      )}
    </div>
  );
}

// Form Modal Component (continued in next message...)
function FormModal({ formData, setFormData, formFields, setFormFields, onSave, onClose, onOpenFieldModal, onDeleteField, isEditing }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit' : 'Create'} Registration Form</h2>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Game Name *</label>
              <input
                type="text"
                value={formData.game_name}
                onChange={(e) => setFormData({ ...formData, game_name: e.target.value, game_slug: generateSlug(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                placeholder="PUBG Mobile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL Slug *</label>
              <input
                type="text"
                value={formData.game_slug}
                onChange={(e) => setFormData({ ...formData, game_slug: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
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
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="PUBG Mobile Tournament Registration"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              rows={3}
              placeholder="Register for our PUBG Mobile tournament..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Google Sheet URL *</label>
            <input
              type="url"
              value={formData.google_sheet_url}
              onChange={(e) => setFormData({ ...formData, google_sheet_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
            <p className="text-xs text-gray-400 mt-1">The Google Sheet where form submissions will be stored</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max Registrations</label>
              <input
                type="number"
                value={formData.max_registrations}
                onChange={(e) => setFormData({ ...formData, max_registrations: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Registration Deadline</label>
              <input
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Make form active (users can submit)</label>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Form Fields</h3>
            <button
              onClick={() => onOpenFieldModal()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
            >
              + Add Field
            </button>
          </div>

          {formFields.length === 0 ? (
            <div className="text-center py-8 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400">No fields added yet. Click "Add Field" to create form fields.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formFields.map((field: FormField, index: number) => (
                <div key={field.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{field.required ? '✅' : '⚪'}</div>
                    <div>
                      <p className="font-semibold">{field.label}</p>
                      <p className="text-xs text-gray-400">Type: {field.type}</p>
                    </div>
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

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={onSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
          >
            Save Form
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
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

// Field Modal Component
function FieldModal({ field, onSave, onClose }: { field: FormField; onSave: (field: FormField) => void; onClose: () => void }) {
  const [fieldData, setFieldData] = useState(field);
  const [optionsText, setOptionsText] = useState(field.options?.join('\n') || '');

  function handleSave() {
    if (!fieldData.label) {
      alert('Please enter a field label');
      return;
    }

    const finalField = {
      ...fieldData,
      options: ['select', 'radio', 'checkbox'].includes(fieldData.type)
        ? optionsText.split('\n').filter((o) => o.trim())
        : undefined,
    };

    onSave(finalField);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">Add/Edit Form Field</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Field Label *</label>
            <input
              type="text"
              value={fieldData.label}
              onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="Team Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Field Type *</label>
              <select
                value={fieldData.type}
                onChange={(e) => setFieldData({ ...fieldData, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="select">Dropdown</option>
                <option value="radio">Radio Buttons</option>
                <option value="checkbox">Checkboxes</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fieldData.required}
                  onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Required Field</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Placeholder</label>
            <input
              type="text"
              value={fieldData.placeholder || ''}
              onChange={(e) => setFieldData({ ...fieldData, placeholder: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="Enter team name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Help Text</label>
            <input
              type="text"
              value={fieldData.helpText || ''}
              onChange={(e) => setFieldData({ ...fieldData, helpText: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="Additional instructions for users..."
            />
          </div>

          {['select', 'radio', 'checkbox'].includes(fieldData.type) && (
            <div>
              <label className="block text-sm font-medium mb-2">Options (one per line) *</label>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                rows={5}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
          >
            Save Field
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

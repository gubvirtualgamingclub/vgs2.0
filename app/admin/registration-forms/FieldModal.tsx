'use client';

import { useState } from 'react';
import type { FormField } from '@/lib/types/database';

export default function FieldModal({
  field,
  onSave,
  onClose,
}: {
  field: FormField;
  onSave: (field: FormField) => void;
  onClose: () => void;
}) {
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
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Team Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Field Type *</label>
              <select
                value={fieldData.type}
                onChange={(e) => setFieldData({ ...fieldData, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter team name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Help Text</label>
            <input
              type="text"
              value={fieldData.helpText || ''}
              onChange={(e) => setFieldData({ ...fieldData, helpText: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Additional instructions for users..."
            />
          </div>

          {['select', 'radio', 'checkbox'].includes(fieldData.type) && (
            <div>
              <label className="block text-sm font-medium mb-2">Options (one per line) *</label>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                rows={5}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white"
          >
            Save Field
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

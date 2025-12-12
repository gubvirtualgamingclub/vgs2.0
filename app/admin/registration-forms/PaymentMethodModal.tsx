'use client';

import { useState, useEffect } from 'react';
import { PaymentMethod } from '@/lib/types/database';

interface PaymentMethodModalProps {
  method?: PaymentMethod | null;
  onSave: (data: Partial<PaymentMethod>) => Promise<void>;
  onClose: () => void;
}

export default function PaymentMethodModal({ method, onSave, onClose }: PaymentMethodModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    number: string;
    logo_url: string;
    account_type: 'personal' | 'merchant' | 'agent';
    instructions: string;
  }>({
    name: '',
    number: '',
    logo_url: '',
    account_type: 'personal',
    instructions: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (method) {
      setFormData({
        name: method.name,
        number: method.number,
        logo_url: method.logo_url || '',
        account_type: method.account_type,
        instructions: method.instructions || '',
      });
    }
  }, [method]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.number) return;

    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      alert('Failed to save payment method: ' + (error.message || error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden animate-zoomIn">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-800/50">
          <h2 className="text-xl font-bold text-white">
            {method ? 'Edit Payment Method' : 'Add Payment Method'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Method Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Bkash, Nagad"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Account Number</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="e.g. 017..."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Logo URL (Optional)</label>
            <input
              type="text"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://... or /images/bkash.png"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
            {formData.logo_url && (
               <img src={formData.logo_url} alt="Logo Preview" className="mt-2 h-8 w-auto object-contain bg-white/10 p-1 rounded" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Account Type</label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'personal' | 'merchant' | 'agent' })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="personal">Personal</option>
              <option value="merchant">Merchant</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Instructions (Optional)</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="e.g. Send Money / Cash Out..."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors min-h-[100px]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

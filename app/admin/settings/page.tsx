'use client';

import { useState, useEffect } from 'react';

import AdminHelpButton from '@/components/AdminHelpButton';

import { getSiteSetting, upsertSiteSetting } from '@/lib/supabase-queries';
import type { SiteSetting } from '@/lib/types/database';

import { 
  CloudArrowUpIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LinkIcon,
  DocumentTextIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partnershipBrochureUrl, setPartnershipBrochureUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsApp, setContactWhatsApp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const [brochure, email, phone, whatsapp] = await Promise.all([
        getSiteSetting('partnership_brochure_url'),
        getSiteSetting('contact_email'),
        getSiteSetting('contact_phone'),
        getSiteSetting('contact_whatsapp'),
      ]);
      
      if (brochure && brochure.setting_value) {
        setPartnershipBrochureUrl(brochure.setting_value);
      }
      if (email && email.setting_value) {
        setContactEmail(email.setting_value);
      }
      if (phone && phone.setting_value) {
        setContactPhone(phone.setting_value);
      }
      if (whatsapp && whatsapp.setting_value) {
        setContactWhatsApp(whatsapp.setting_value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setErrorMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      await Promise.all([
        upsertSiteSetting(
          'partnership_brochure_url',
          partnershipBrochureUrl,
          'Google Drive direct download link for partnership brochure PDF'
        ),
        upsertSiteSetting(
          'contact_email',
          contactEmail,
          'Partnership contact email address'
        ),
        upsertSiteSetting(
          'contact_phone',
          contactPhone,
          'Partnership contact phone number'
        ),
        upsertSiteSetting(
          'contact_whatsapp',
          contactWhatsApp,
          'WhatsApp number (without + or spaces)'
        ),
      ]);

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function convertToDirectDownloadLink(url: string): string {
    if (!url) return '';
    let fileId = '';
    const viewMatch = url.match(/\/file\/d\/([^/]+)/);
    if (viewMatch) fileId = viewMatch[1];
    const openMatch = url.match(/[?&]id=([^&]+)/);
    if (openMatch) fileId = openMatch[1];
    const ucMatch = url.match(/\/uc\?id=([^&]+)/);
    if (ucMatch) fileId = ucMatch[1];

    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
  }

  function handleUrlChange(value: string) {
    setPartnershipBrochureUrl(value);
    if (value.includes('drive.google.com') && !value.includes('export=download')) {
      const directLink = convertToDirectDownloadLink(value);
      if (directLink !== value) {
        setPartnershipBrochureUrl(directLink);
      }
    }
  }

  const inputClassName = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-gray-500 hover:bg-black/30";
  const labelClassName = "block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">System Settings</h1>
        <p className="text-gray-400 text-lg">Manage global configuration and contact details</p>
      </div>

       {/* Success/Error Messages */}
       {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl flex items-center gap-3 animate-slideDown backdrop-blur-sm">
            <CheckCircleIcon className="w-6 h-6" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 animate-slideDown backdrop-blur-sm">
            <ExclamationCircleIcon className="w-6 h-6" />
            {errorMessage}
          </div>
        )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Partnership Brochure Section */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl hover:border-purple-500/30 transition-all">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/20">
               <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Brochure Link</h2>
              <p className="text-gray-400 text-sm">Google Drive direct download link for the partnership brochure</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelClassName}>
                <CloudArrowUpIcon className="w-4 h-4 text-purple-400" />
                Google Drive URL
              </label>
              <input
                type="url"
                value={partnershipBrochureUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Paste Google Drive link here..."
                className={inputClassName}
              />
              <p className="text-gray-500 text-xs mt-2 pl-1">
                Automatic conversion to direct download link enabled.
              </p>
            </div>

            {/* Preview */}
            {partnershipBrochureUrl && (
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Generated Direct Link</p>
                <code className="text-xs text-purple-400 break-all bg-black/30 p-2 rounded block mb-3 font-mono border border-white/5">{partnershipBrochureUrl}</code>
                <a
                  href={partnershipBrochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  Test Download Link
                </a>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                <h4 className="text-purple-400 text-sm font-bold mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" /> Quick Guide
                </h4>
                <ol className="list-decimal list-inside text-xs text-gray-400 space-y-1 ml-1">
                    <li>Upload PDF to Google Drive</li>
                    <li>Set access to <strong>"Anyone with the link"</strong></li>
                    <li>Copy link and paste above</li>
                </ol>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl hover:border-blue-500/30 transition-all">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/20">
               <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Contact Info</h2>
              <p className="text-gray-400 text-sm">Manage contact details visible to users</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelClassName}>
                <EnvelopeIcon className="w-4 h-4 text-blue-400" />
                Partnership Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="partnerships@vgs.com"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>
                <PhoneIcon className="w-4 h-4 text-blue-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (234) 567-890"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={contactWhatsApp}
                onChange={(e) => setContactWhatsApp(e.target.value)}
                placeholder="1234567890"
                className={inputClassName}
              />
              <p className="text-gray-500 text-xs mt-2 pl-1">
                Numbers only (no + or spaces).
              </p>
            </div>
            
             <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
               <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Live Preview</p>
               <div className="text-sm text-gray-300 flex items-center gap-2">
                   <EnvelopeIcon className="w-4 h-4 text-gray-500" /> {contactEmail || 'Not set'}
               </div>
                <div className="text-sm text-gray-300 flex items-center gap-2">
                   <PhoneIcon className="w-4 h-4 text-gray-500" /> {contactPhone || 'Not set'}
               </div>
                <div className="text-sm text-gray-300 flex items-center gap-2">
                   <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> {contactWhatsApp ? `+${contactWhatsApp}` : 'Not set'}
               </div>
             </div>
          </div>
        </div>
      </div>

       {/* Actions */}
       <div className="flex justify-end gap-4 border-t border-white/10 pt-8">
           <button
            onClick={fetchSettings}
            disabled={saving}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Reset Changes
          </button>
           <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-900/20 hover:scale-[1.02]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Save All Settings
              </>
            )}
          </button>
       </div>

      <AdminHelpButton
        title="⚙️ Settings Instructions"
        instructions={[
            "Paste your Google Drive link for the brochure; it auto-converts to a download link.",
            "Update contact email and phone displayed on the site.",
            "Click 'Save All Settings' to apply changes instantly."
        ]}
        tips={[
            "Test the brochure link after saving to ensure it downloads.",
            "Use international format for phone numbers (e.g., +1...)"
        ]}
        actions={[
            {
               title: "About the Brochure",
               description: "We use a direct download link trick for Google Drive files. You just need the shareable link set to 'Anyone with the link'."
            }
        ]}
      />
    </div>
  );
}

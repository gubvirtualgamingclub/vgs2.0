'use client';

import { useState, useEffect } from 'react';
import type { EmailTemplate, EmailLog, Participant } from '@/lib/types/database';
import AdminHelpButton from '@/components/AdminHelpButton';
import EmailSendingOverlay from '@/components/EmailSendingOverlay';
import { EyeIcon, ClipboardDocumentIcon, TrashIcon, UserGroupIcon, TableCellsIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function EmailManagementPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history'>('compose');
  
  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState<EmailTemplate | null>(null);

  // Compose state
  const [inputMode, setInputMode] = useState<'sheet' | 'manual'>('sheet');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);
  
  // History state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  
  // Loading and status states
  const [loading, setLoading] = useState(false);
  const [fetchingParticipants, setFetchingParticipants] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sendResult, setSendResult] = useState<{ sent: number; total: number; failed: number } | null>(null);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetchTemplates();
    fetchEmailLogs();
  }, []);

  async function fetchTemplates() {
    try {
      const response = await fetch('/api/emails/templates');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTemplates(data.templates || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setMessage({ type: 'error', text: 'Network error loading templates' });
    }
  }

  async function fetchEmailLogs() {
    try {
      const response = await fetch('/api/emails/logs');
      const data = await response.json();
      setEmailLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  }

  async function fetchParticipants() {
    if (!googleSheetUrl) {
      setMessage({ type: 'error', text: 'Please enter a Google Sheet URL' });
      return;
    }

    setFetchingParticipants(true);
    setMessage(null);

    try {
      const response = await fetch('/api/emails/fetch-participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: googleSheetUrl })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch participants');

      setParticipants(data.participants);
      setSelectedParticipants(new Set(data.participants.map((p: Participant) => p.email)));
      setMessage({ type: 'success', text: `Found ${data.count} participants` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setParticipants([]);
    } finally {
      setFetchingParticipants(false);
    }
  }

  function parseManualInput() {
    if (!manualInput.trim()) return;

    const lines = manualInput.split('\n');
    const newParticipants: Participant[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Try CSV format (Name, Email)
      const parts = trimmed.split(',');
      let name = '';
      let email = '';

      if (parts.length >= 2) {
        name = parts[0].trim();
        email = parts.slice(1).join(',').trim(); // Join rest in case name has commas? No, usually email is last. Assume Name, Email
      } else {
        // Just email?
        email = trimmed;
        name = 'Participant';
      }

      // Basic email validation
      if (email.includes('@') && email.includes('.')) {
        newParticipants.push({ name, email });
      } else {
        errors.push(`Line ${index + 1}: Invalid email "${email}"`);
      }
    });

    if (newParticipants.length > 0) {
      setParticipants(prev => {
        // Merge without duplicates based on email
        const existingEmails = new Set(prev.map(p => p.email));
        const filteredNew = newParticipants.filter(p => !existingEmails.has(p.email));
        return [...prev, ...filteredNew];
      });
      
      // Auto-select new
      setSelectedParticipants(prev => {
        const newSet = new Set(prev);
        newParticipants.forEach(p => newSet.add(p.email));
        return newSet;
      });

      setMessage({ type: 'success', text: `Added ${newParticipants.length} participants.` });
      setManualInput(''); // Clear input
    }
    
    if (errors.length > 0) {
      console.warn('Parsing errors:', errors);
      // Maybe show errors somewhere?
      if (newParticipants.length === 0) {
        setMessage({ type: 'error', text: 'No valid emails found.' });
      }
    }
  }

  async function sendEmails() {
    if (selectedParticipants.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one participant' });
      return;
    }

    if (!subject || !htmlContent) {
      setMessage({ type: 'error', text: 'Please enter subject and email content' });
      return;
    }

    setSending(true);
    setSendResult({ sent: 0, total: selectedParticipants.size, failed: 0 }); // Init progress
    setMessage(null);

    try {
      const selectedRecipients = participants.filter(p => selectedParticipants.has(p.email));

      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedRecipients,
          subject,
          htmlContent,
          templateId: selectedTemplate?.id,
          googleSheetUrl: inputMode === 'sheet' ? googleSheetUrl : undefined,
          sentBy: 'admin@vgs.com' 
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to send emails');

      setSendResult(data.summary);
      fetchEmailLogs(); // Refresh logs immediately

    } catch (error: any) {
      setSendResult({ sent: 0, total: selectedParticipants.size, failed: selectedParticipants.size }); // Assume all failed on api error
      setMessage({ type: 'error', text: `Server Error: ${error.message}` });
    } finally {
       // Note: setSending(false) is handled by the overlay onComplete callback
    }
  }

  function toggleParticipant(email: string) {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(email)) newSelected.delete(email);
    else newSelected.add(email);
    setSelectedParticipants(newSelected);
  }

  function toggleAll() {
    if (selectedParticipants.size === participants.length) setSelectedParticipants(new Set());
    else setSelectedParticipants(new Set(participants.map(p => p.email)));
  }

  function loadTemplate(template: EmailTemplate) {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setHtmlContent(template.html_content);
    setMessage({ type: 'success', text: `Template "${template.name}" loaded` });
  }

  function getPreviewHtml(content: string) {
    return content
      .replace(/\{\{name\}\}/g, '<span style="background: yellow; color: black; padding: 0 4px; border-radius: 2px;">John Doe</span>')
      .replace(/\{\{email\}\}/g, '<span style="background: yellow; color: black; padding: 0 4px; border-radius: 2px;">john@example.com</span>');
  }

  async function saveAsTemplate() {
    if (!htmlContent || !subject) {
      setMessage({ type: 'error', text: '❌ Please enter subject and content first' });
      return;
    }

    const name = prompt('Enter template name:');
    if (!name) return;

    const description = prompt('Enter a short description (optional):');

    setLoading(true);
    try {
      const response = await fetch('/api/emails/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          html_content: htmlContent,
          description: description || '',
          category: 'general',
          is_active: true
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to save template');

      setMessage({ type: 'success', text: `✅ Template "${name}" saved successfully!` });
      fetchTemplates();
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Failed to save template: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/emails/templates?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete template');
      setMessage({ type: 'success', text: '✅ Template deleted' });
      fetchTemplates();
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Failed to delete: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }

  // Copy template content functionality
  const copyTemplateContent = (template: EmailTemplate) => {
    navigator.clipboard.writeText(template.html_content).then(() => {
        setMessage({ type: 'success', text: '📋 Template HTML copied to clipboard!' });
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
  };

  const clearCompose = () => {
      setParticipants([]);
      setSelectedParticipants(new Set());
      setGoogleSheetUrl('');
      setManualInput('');
      setSubject('');
      setHtmlContent('');
      setSendResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 p-6">
      <EmailSendingOverlay 
        isSending={sending} 
        progress={sendResult || { sent: 0, total: 0, failed: 0 }}
        onComplete={() => {
            setSending(false);
            if (sendResult?.failed === 0) {
                // Clear form on perfect success only? Or keep to allow resend?
                // Let's keep it but show a clear button.
            }
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📧 Email Management</h1>
            <p className="text-gray-300">Send personalized campaigns efficiently</p>
          </div>
          {activeTab === 'compose' && (
              <button onClick={clearCompose} className="text-gray-400 hover:text-white text-sm underline">
                  Clear Form
              </button>
          )}
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg animate-fadeIn ${message.type === 'success' ? 'bg-green-500/20 border border-green-500 text-green-300' : 'bg-red-500/20 border border-red-500 text-red-300'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-1">
          {[
            { id: 'compose', label: '✉️ Compose', icon: '' },
            { id: 'templates', label: '📝 Templates', icon: '' },
            { id: 'history', label: '📊 History', icon: '' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all relative ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>}
            </button>
          ))}
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            
            {/* Step 1: Participants */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">1. Add Participants</h2>
              
              {/* Input Method Toggle */}
              <div className="flex gap-4 mb-4">
                  <button 
                    onClick={() => setInputMode('sheet')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${inputMode === 'sheet' ? 'bg-blue-600/80 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                      <TableCellsIcon className="w-5 h-5" /> Google Sheets
                  </button>
                  <button 
                    onClick={() => setInputMode('manual')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${inputMode === 'manual' ? 'bg-blue-600/80 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                      <UserGroupIcon className="w-5 h-5" /> Manual Entry
                  </button>
              </div>

              {inputMode === 'sheet' ? (
                  <div className="flex gap-4 animate-fadeIn">
                    <input
                      type="url"
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={fetchParticipants}
                      disabled={fetchingParticipants}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {fetchingParticipants ? 'Loading...' : 'Fetch Sheet'}
                    </button>
                  </div>
              ) : (
                  <div className="animate-fadeIn">
                      <p className="text-gray-400 text-sm mb-2">Paste emails or enter manually (Format: "Name, Email" or just "Email" per line)</p>
                      <textarea 
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          placeholder="John Doe, john@example.com&#10;Jane Smith, jane@test.com&#10;admin@vgs.com"
                          className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm mb-3"
                      />
                      <button
                        onClick={parseManualInput}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                      >
                          Add to List
                      </button>
                  </div>
              )}
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-slideDown">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserGroupIcon className="w-6 h-6 text-purple-400" />
                    Recipients ({selectedParticipants.size} / {participants.length})
                  </h2>
                  <div className="flex gap-2"> 
                    <button onClick={() => setParticipants([])} className="text-red-400 hover:text-red-300 text-sm px-3">Clear List</button>
                    <button onClick={toggleAll} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm">
                        {selectedParticipants.size === participants.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto overflow-x-hidden space-y-1 pr-2 custom-scrollbar">
                  {participants.map((p, idx) => (
                    <label key={`${p.email}-${idx}`} className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-500/30">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.has(p.email)}
                        onChange={() => toggleParticipant(p.email)}
                        className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium truncate block">{p.name || 'Participant'}</span>
                        <span className="text-gray-400 text-sm truncate block">{p.email}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Content */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">2. Compose Content</h2>
                <div className="flex gap-2">
                  <button onClick={saveAsTemplate} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg flex items-center gap-2 text-sm border border-gray-600">
                    💾 Save Template
                  </button>
                  <button onClick={() => setShowLivePreview(!showLivePreview)} className={`px-4 py-2 font-semibold rounded-lg flex items-center gap-2 text-sm border ${showLivePreview ? 'bg-purple-600 text-white border-purple-500' : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'}`}>
                    {showLivePreview ? <EyeIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />} {showLivePreview ? 'Edit Mode' : 'Preview'}
                  </button>
                  {templates.length > 0 && (
                     <select 
                        onChange={(e) => {
                            const t = templates.find(temp => temp.id === e.target.value);
                            if(t) loadTemplate(t);
                        }}
                        className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
                     >
                         <option value="">Load saved template...</option>
                         {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                     </select>
                  )}
                </div>
              </div>

              {!showLivePreview ? (
                <div className="space-y-4 animate-fadeIn">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email Subject Line"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors font-medium text-lg"
                  />
                  <div className="relative">
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="<html>&#10;  <body>&#10;    <h1>Hello {{name}},</h1>&#10;    ...&#10;  </body>&#10;</html>"
                      rows={12}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 font-mono text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-gray-900/80 px-2 py-1 rounded">
                        HTML Supported • Variables: {'{{name}}, {{email}}'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg overflow-hidden animate-fadeIn h-[400px] flex flex-col">
                   <div className="bg-gray-100 border-b p-3 flex justify-between items-center">
                       <div>
                           <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Subject</span>
                           <div className="text-gray-800 font-bold text-lg">{subject || '(No Subject)'}</div>
                       </div>
                       <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded border border-yellow-200">Preview Mode</div>
                   </div>
                   <div className="flex-1 p-6 overflow-y-auto bg-white text-black email-preview-content">
                       <div dangerouslySetInnerHTML={{ __html: getPreviewHtml(htmlContent) }} />
                   </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <div className="sticky bottom-6 flex justify-end">
              <button
                onClick={sendEmails}
                disabled={sending || selectedParticipants.size === 0 || !subject || !htmlContent}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              >
                  <span className="flex items-center gap-2">
                       🚀 Send Campaign
                       <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                           {selectedParticipants.size}
                       </span>
                  </span>
              </button>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Saved Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <div key={template.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition-all flex flex-col group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{template.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => setShowTemplatePreview(template)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg" title="Preview">
                          <EyeIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => copyTemplateContent(template)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg" title="Copy HTML">
                          <ClipboardDocumentIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteTemplate(template.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg" title="Delete">
                          <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description || 'No description'}</p>
                  <div className="mt-auto pt-4 border-t border-gray-700 flex justify-between items-center">
                      <span className="text-xs text-gray-500">{new Date(template.created_at).toLocaleDateString()}</span>
                      <button 
                        onClick={() => { loadTemplate(template); setActiveTab('compose'); }}
                        className="px-4 py-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                          Use Template
                      </button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                      <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No saved templates found.</p>
                      <button onClick={() => setActiveTab('compose')} className="mt-2 text-purple-400 hover:text-purple-300 underline">Create one now</button>
                  </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Campaign History</h2>
                    <button onClick={fetchEmailLogs} className="text-sm text-purple-400 hover:text-purple-300">Refresh</button>
                </div>
                <div className="space-y-3">
                    {emailLogs.map(log => (
                        <div key={log.id} className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-800/60 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {log.status === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <XCircleIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">{log.subject}</h4>
                                    <p className="text-xs text-gray-400">
                                        {new Date(log.sent_at).toLocaleString()} • {log.recipients_count} Recipients
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-medium ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {log.status.toUpperCase()}
                                </span>
                                {/* Add view details button later if needed */}
                            </div>
                        </div>
                    ))}
                    {emailLogs.length === 0 && <p className="text-center text-gray-500 py-8">No history available yet.</p>}
                </div>
            </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {showTemplatePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowTemplatePreview(null)}>
              <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                      <div>
                          <h3 className="font-bold text-lg text-gray-800">{showTemplatePreview.name}</h3>
                          <p className="text-sm text-gray-500">Subject: {showTemplatePreview.subject}</p>
                      </div>
                      <button onClick={() => setShowTemplatePreview(null)} className="text-gray-400 hover:text-gray-600">
                          <XCircleIcon className="w-8 h-8" />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 bg-white">
                      <div dangerouslySetInnerHTML={{ __html: getPreviewHtml(showTemplatePreview.html_content) }} />
                  </div>
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                       <button onClick={() => { loadTemplate(showTemplatePreview); setShowTemplatePreview(null); setActiveTab('compose'); }} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                           Use This Template
                       </button>
                  </div>
              </div>
          </div>
      )}
      
      <AdminHelpButton
        title="📧 Email Campaign Manager"
        instructions={[
          "**Step 1 - Add Participants**: Choose between Google Sheets (bulk) or Manual Entry mode.",
          "**Step 2 - Compose Content**: Write your subject line and HTML email body.",
          "**Step 3 - Send Campaign**: Review recipients and click 'Send Campaign' to dispatch emails.",
          "**Templates**: Save frequently used email designs for quick reuse.",
          "**History Tab**: Track all sent campaigns with delivery status and timestamps."
        ]}
        tips={[
          "**Google Sheets Setup**: Your sheet MUST be publicly accessible (Anyone with the link can view).",
          "**Required Columns**: Sheet must have headers named exactly `Name` and `Email` (case-sensitive).",
          "**Preview Before Sending**: Always click the 'Eye' icon to preview your HTML before sending.",
          "**Rate Limiting**: System sends max ~50 emails/minute to avoid SMTP throttling.",
          "**Variables**: Use `{{name}}` and `{{email}}` in your content - they auto-replace per recipient."
        ]}
        actions={[
          {
            title: "📊 Google Sheets Format",
            description: 
              "Your spreadsheet must have these exact column headers:\n\n`Name` | `Email`\n`John Doe` | `john@example.com`\n`Jane Smith` | `jane@test.com`\n\n**Share Settings**: File → Share → General Access → 'Anyone with the link'"
          },
          {
            title: "✍️ Manual Entry Format",
            description:
              "Enter one participant per line in CSV format:\n\n`John Doe, john@example.com`\n`Jane Smith, jane@test.com`\n\nOr just emails (Name will default to 'Participant'):\n\n`admin@vgs.com`\n`support@vgs.com`"
          },
          {
            title: "🎨 Template Variables",
            description: 
              "Personalize emails with dynamic placeholders:\n\n**Input**: `Hello {{name}}, welcome to VGS!`\n**Output**: `Hello John Doe, welcome to VGS!`\n\n**Available Variables**:\n- `{{name}}` → Recipient's full name\n- `{{email}}` → Recipient's email address"
          },
          {
            title: "📝 HTML Email Tips",
            description:
              "**Do's**:\n- Use inline CSS styles\n- Keep images under 600px width\n- Test on multiple email clients\n\n**Don'ts**:\n- Avoid JavaScript (blocked by clients)\n- Don't use external stylesheets\n- Avoid complex layouts"
          }
        ]}
      />
    </div>
  );
}

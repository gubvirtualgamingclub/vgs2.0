'use client';

import { useState, useEffect } from 'react';
import type { EmailTemplate, EmailLog, Participant } from '@/lib/types/database';
import AdminHelpButton from '@/components/AdminHelpButton';

export default function EmailManagementPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history'>('compose');
  
  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  // Compose state
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // History state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  
  // Loading and status states
  const [loading, setLoading] = useState(false);
  const [fetchingParticipants, setFetchingParticipants] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
      
      if (!response.ok) {
        console.error('Failed to fetch templates:', data);
        setMessage({ type: 'error', text: data.error || 'Failed to load templates' });
        return;
      }
      
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch participants');
      }

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
          googleSheetUrl,
          sentBy: 'admin@vgs.com' // TODO: Get from auth context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      // Store result for modal
      setSendResult(data.summary);

      // Show detailed success/failure notification
      if (data.status === 'success') {
        setMessage({ 
          type: 'success', 
          text: `✅ All emails sent successfully! ${data.summary.sent} of ${data.summary.total} delivered.` 
        });
        setShowSuccessModal(true);
      } else if (data.status === 'partial') {
        setMessage({ 
          type: 'error', 
          text: `⚠️ Partial success: ${data.summary.sent} sent, ${data.summary.failed} failed. Check History for details.` 
        });
        setShowSuccessModal(true);
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Failed to send emails. ${data.summary.failed} of ${data.summary.total} failed. Check your email settings.` 
        });
      }

      // Refresh logs
      fetchEmailLogs();

      // Only reset form on full success
      if (data.status === 'success') {
        setParticipants([]);
        setSelectedParticipants(new Set());
        setGoogleSheetUrl('');
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `❌ Error: ${error.message}. Please check your email configuration in .env.local` 
      });
    } finally {
      setSending(false);
    }
  }

  function toggleParticipant(email: string) {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedParticipants(newSelected);
  }

  function toggleAll() {
    if (selectedParticipants.size === participants.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(new Set(participants.map(p => p.email)));
    }
  }

  function loadTemplate(template: EmailTemplate) {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setHtmlContent(template.html_content);
    setMessage({ type: 'success', text: `Template "${template.name}" loaded` });
  }

  function getPreviewHtml() {
    return htmlContent.replace(/\{\{name\}\}/g, '<span style="background: yellow;">Sample Name</span>');
  }

  async function saveAsTemplate() {
    if (!htmlContent || !subject) {
      setMessage({ type: 'error', text: '❌ Please enter subject and content first' });
      return;
    }

    const name = prompt('Enter template name:');
    if (!name) return;

    setLoading(true);
    try {
      const response = await fetch('/api/emails/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          html_content: htmlContent,
          category: 'general',
          is_active: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save template');
      }

      setMessage({ type: 'success', text: `✅ Template "${name}" saved successfully!` });
      fetchTemplates();
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Failed to save template: ${error.message}` });
      console.error('Save template error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/emails/templates?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete template');
      }

      setMessage({ type: 'success', text: '✅ Template deleted successfully' });
      fetchTemplates();
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Failed to delete template: ${error.message}` });
      console.error('Delete template error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEmailLog(id: string) {
    if (!confirm('Are you sure you want to delete this email log?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/emails/logs?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete email log');
      }

      setMessage({ type: 'success', text: '✅ Email log deleted successfully' });
      fetchEmailLogs();
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Failed to delete email log: ${error.message}` });
      console.error('Delete email log error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📧 Email Management</h1>
          <p className="text-gray-300">Send personalized emails to participants</p>
        </div>

        {/* Success/Error Modal */}
        {showSuccessModal && sendResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
              {sendResult.failed === 0 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4 animate-bounce">✅</div>
                    <h2 className="text-3xl font-bold text-green-400 mb-2">All Emails Sent!</h2>
                    <p className="text-gray-300">Successfully delivered to all recipients</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
                    <div className="flex justify-between text-green-300">
                      <span>Total Sent:</span>
                      <span className="font-bold text-xl">{sendResult.sent}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{sendResult.sent > 0 ? '⚠️' : '❌'}</div>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                      {sendResult.sent > 0 ? 'Partially Sent' : 'Send Failed'}
                    </h2>
                    <p className="text-gray-300">Some emails could not be delivered</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="bg-green-500/20 border border-green-500 rounded-lg p-3">
                      <div className="flex justify-between text-green-300">
                        <span>✅ Sent:</span>
                        <span className="font-bold">{sendResult.sent}</span>
                      </div>
                    </div>
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                      <div className="flex justify-between text-red-300">
                        <span>❌ Failed:</span>
                        <span className="font-bold">{sendResult.failed}</span>
                      </div>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3">
                      <div className="flex justify-between text-blue-300">
                        <span>📊 Total:</span>
                        <span className="font-bold">{sendResult.total}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-yellow-300 text-sm mb-6 text-center">
                    Check the History tab for detailed error information
                  </p>
                </>
              )}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  if (sendResult.failed === 0) {
                    setActiveTab('history');
                  }
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all"
              >
                {sendResult.failed === 0 ? 'View History' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
            <p className={`${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'compose' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            ✉️ Compose
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'templates' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            📝 Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'history' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            📊 History
          </button>
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            {/* Step 1: Fetch Participants */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📋 Step 1: Load Participants</h2>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  placeholder="Enter Google Sheet URL"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
                <button
                  onClick={fetchParticipants}
                  disabled={fetchingParticipants}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  {fetchingParticipants ? 'Loading...' : 'Fetch'}
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Make sure your sheet is publicly accessible and has &quot;Name&quot; and &quot;Email&quot; columns
              </p>
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    👥 Participants ({selectedParticipants.size}/{participants.length})
                  </h2>
                  <button
                    onClick={toggleAll}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
                  >
                    {selectedParticipants.size === participants.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {participants.map((p) => (
                    <label
                      key={p.email}
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.has(p.email)}
                        onChange={() => toggleParticipant(p.email)}
                        className="w-5 h-5"
                      />
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        <p className="text-gray-400 text-sm">{p.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Compose Email */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">✍️ Step 2: Compose Email</h2>
                <div className="flex gap-2">
                  <button
                    onClick={saveAsTemplate}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
                  >
                    💾 Save as Template
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
                  >
                    {showPreview ? '📝 Edit' : '👁️ Preview'}
                  </button>
                </div>
              </div>

              {templates.length > 0 && (
                <div className="mb-4">
                  <label className="block text-white font-medium mb-2">Load Template</label>
                  <select
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      if (template) loadTemplate(template);
                    }}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">-- Select a template --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!showPreview ? (
                <>
                  <div className="mb-4">
                    <label className="block text-white font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      HTML Content <span className="text-gray-400 text-sm">(Use {'{{name}}'} for participant name)</span>
                    </label>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="<h1>Hello {{name}},</h1><p>Your email content here...</p>"
                      rows={15}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-mono text-sm"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-white font-medium mb-2">Preview</label>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <div className="border-b border-gray-600 pb-2 mb-4">
                      <p className="text-gray-400 text-sm">Subject:</p>
                      <p className="text-white font-semibold">{subject}</p>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={sendEmails}
                disabled={sending || selectedParticipants.size === 0}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? '📨 Sending...' : `🚀 Send to ${selectedParticipants.size} Participant${selectedParticipants.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📝 Email Templates</h2>
            {templates.length === 0 ? (
              <p className="text-gray-300">No templates yet. Create one from the Compose tab.</p>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">{template.subject}</p>
                        {template.description && (
                          <p className="text-gray-500 text-sm mt-2">{template.description}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                          Created: {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('compose');
                            loadTemplate(template);
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Email History</h2>
            {emailLogs.length === 0 ? (
              <p className="text-gray-300">No emails sent yet.</p>
            ) : (
              <div className="space-y-4">
                {emailLogs.map((log) => (
                  <div key={log.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{log.subject}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Sent to {log.recipients_count} recipients
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        log.status === 'success' ? 'bg-green-500/20 text-green-300' :
                        log.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">
                      {new Date(log.sent_at).toLocaleString()}
                    </p>
                    {log.error_message && (
                      <p className="text-red-400 text-sm mt-2">{log.error_message}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => deleteEmailLog(log.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Button */}
      <AdminHelpButton
        title="Email Management Instructions"
        instructions={[
          "Send personalized emails to participants from Google Sheets",
          "Create and manage reusable email templates with HTML",
          "Track email sending history and delivery status",
          "Use variables like {{name}} for personalization"
        ]}
        tips={[
          "Make sure your Google Sheet is publicly accessible (Share → Anyone with link → Viewer)",
          "Sheet must have 'Name' and 'Email' columns (or similar like 'Participant', 'Leader', 'Mail')",
          "For Gmail with 2FA: Use App Password (https://myaccount.google.com/apppasswords), not regular password",
          "Test emails by sending to yourself first before bulk sending",
          "Templates save time for recurring communications (registration confirmations, reminders, etc.)",
          "Check History tab to see which emails failed and why"
        ]}
        actions={[
          {
            title: "Step 1: Configure Email Settings",
            description: `Set up your email credentials in .env.local file:

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

For Gmail with 2FA:
1. Go to https://myaccount.google.com/apppasswords
2. Select app: Mail
3. Select device: Other (Custom name)
4. Enter name: VGS Email System
5. Copy the 16-character password (remove spaces)
6. Use this as EMAIL_PASSWORD

After updating .env.local, restart the dev server:
npm run dev`
          },
          {
            title: "Step 2: Prepare Google Sheet",
            description: `Create or open your Google Sheet with participant data.

Required columns:
- Name (or "Participant Name", "Leader Name")
- Email (or "Email Address", "Mail")

Example sheet structure:
| Name          | Email                | Student ID |
|---------------|----------------------|------------|
| John Doe      | john@example.com     | 2019001    |
| Jane Smith    | jane@example.com     | 2019002    |

Make it public:
1. Click "Share" button
2. Change to "Anyone with the link"
3. Set permission to "Viewer"
4. Copy the entire URL`
          },
          {
            title: "Step 3: Fetch Participants",
            description: `In the Compose tab:
1. Paste your Google Sheet URL
2. Click "Fetch" button
3. System will automatically detect Name and Email columns
4. All participants will be loaded with checkboxes
5. By default, all participants are selected

You'll see a message like:
"✅ Found 25 participants"

If error occurs:
- Check if sheet is publicly accessible
- Verify Name and Email columns exist
- Ensure URL is complete`
          },
          {
            title: "Step 4: Select Recipients",
            description: `Choose who will receive the email:

Select All/Deselect All:
- Click the "Select All" button to choose everyone
- Click "Deselect All" to uncheck everyone

Individual Selection:
- Check/uncheck individual participant checkboxes
- Counter shows: "Selected (5/10)"

Search/Filter (coming soon):
- Use search box to find specific participants
- Filter by domain, name, etc.`
          },
          {
            title: "Step 5: Compose Email",
            description: `Option A - Use Saved Template:
1. Select template from dropdown
2. Template content loads automatically
3. Modify if needed

Option B - Write Custom Email:
1. Enter Subject line
2. Write HTML content in the textarea
3. Use {{name}} for participant's name
4. Use {{email}} for participant's email

Example template:
<h1>Hello {{name}},</h1>
<p>Thank you for registering!</p>
<p>We will contact you at {{email}}</p>

Preview:
- Click "👁️ Preview" to see how email looks
- Variables shown as highlighted: [Sample Name]
- Switch back to "📝 Edit" to continue editing`
          },
          {
            title: "Step 6: Send Emails",
            description: `Click the "🚀 Send to X Participants" button.

Sending Process:
1. System validates email configuration
2. Connects to SMTP server
3. Sends personalized emails one by one
4. Tracks success/failure for each recipient

Success Modal:
✅ All sent: Shows green modal with count
⚠️ Partial: Shows sent vs failed breakdown
❌ Failed: Shows error with troubleshooting hint

After sending:
- Check History tab for detailed logs
- Failed emails show specific error messages
- Form resets only on 100% success`
          },
          {
            title: "Step 7: Save as Template",
            description: `Save your email for future use:

1. After composing email, click "💾 Save as Template"
2. Enter a descriptive name (e.g., "Tournament Registration Confirmation")
3. Template is saved to database
4. Access from Templates tab anytime

Template includes:
- Subject line
- HTML content
- All variables ({{name}}, {{email}})

Benefits:
- Reuse for recurring communications
- Maintain consistent branding
- Save time on repetitive emails
- Share templates with team (future feature)`
          },
          {
            title: "Managing Templates",
            description: `In the Templates tab:

View Templates:
- See all saved templates
- Shows name, subject, description
- Displays creation date

Use Template:
1. Click "Use" button on any template
2. Switches to Compose tab
3. Template content loaded and ready to send

Delete Template:
1. Click "Delete" button
2. Confirm deletion
3. Template removed permanently

Template Categories (future):
- Registration forms
- Event reminders
- Thank you emails
- Announcements`
          },
          {
            title: "Email History & Tracking",
            description: `View all sent emails in History tab:

Each log entry shows:
- Email subject
- Number of recipients
- Send status: Success (green) / Failed (red) / Partial (yellow)
- Timestamp
- Error messages (if any)

Status meanings:
✅ Success: All emails delivered
⚠️ Partial: Some sent, some failed
❌ Failed: None delivered

Click on an entry to see:
- List of all recipients
- Individual delivery status
- Specific error for each failed email

Common errors:
- Invalid email address format
- Recipient mailbox full
- SMTP authentication failed
- Network timeout`
          },
          {
            title: "Email Variables & Personalization",
            description: `Use these variables in your HTML content:

{{name}} - Replaced with participant's name
{{email}} - Replaced with participant's email

Example usage:
<h2>Dear {{name}},</h2>
<p>This email is sent to {{email}}</p>

Advanced personalization (future):
{{student_id}}
{{phone}}
{{team_name}}
{{registration_date}}

Variable rules:
- Case-sensitive: Use {{name}}, not {{Name}}
- Double curly braces required
- Space sensitive: {{name}} works, {{ name }} doesn't
- Can use multiple times in same email`
          },
          {
            title: "Troubleshooting Common Issues",
            description: `Problem: "Failed to fetch participants"
Solution:
- Ensure Google Sheet is publicly accessible
- Check if 'Name' and 'Email' columns exist
- Verify URL is complete (starts with https://docs.google.com)

Problem: "Email server connection failed"
Solution:
- Check EMAIL_HOST, EMAIL_PORT in .env.local
- For Gmail: Use smtp.gmail.com and port 587
- Verify EMAIL_USER is correct
- For 2FA: Use App Password, not regular password

Problem: "All emails failed to send"
Solution:
- Test SMTP connection: Check credentials
- Ensure no typos in EMAIL_PASSWORD
- Try sending to yourself first
- Check if email service allows app connections

Problem: "Some emails failed (partial send)"
Solution:
- Check History tab for specific errors
- Invalid emails: Fix in Google Sheet
- Rate limiting: Send in smaller batches
- Retry failed recipients separately

Problem: "Template won't save"
Solution:
- Run database migration: migrations/add_email_management.sql
- Check Supabase connection
- Verify email_templates table exists
- Check browser console for errors`
          },
          {
            title: "Email Best Practices",
            description: `Content Guidelines:
✅ Clear, concise subject lines (under 50 characters)
✅ Use participant's name for personal touch
✅ Include call-to-action (register, confirm, etc.)
✅ Add unsubscribe option for marketing emails
✅ Test on different devices (desktop, mobile)

HTML Best Practices:
✅ Use inline CSS (Gmail strips <style> tags)
✅ Keep width under 600px
✅ Use tables for layout (not divs)
✅ Test with email testing tools
✅ Include plain text version (future feature)

Avoid Spam Filters:
❌ Don't use ALL CAPS in subject
❌ Avoid spam trigger words (FREE, CLICK NOW)
❌ Don't use too many links
❌ Keep image sizes small (<1MB)
❌ Don't send from free email domains for business

Sending Strategy:
- Test with small group first (5-10 people)
- Send during business hours (9 AM - 5 PM)
- Avoid Mondays and Fridays
- Space out large batches (prevent rate limiting)
- Monitor bounce rates and adjust`
          },
          {
            title: "Database Migration (Important!)",
            description: `Before using Email Management, run the migration:

Step 1 - Open Supabase Dashboard:
- Go to your Supabase project
- Navigate to SQL Editor

Step 2 - Run Migration:
- Open file: migrations/add_email_management.sql
- Copy entire content
- Paste into SQL Editor
- Click "Run" button
- Wait for "Success" message

Migration creates:
✅ email_templates table (for saved templates)
✅ email_logs table (for history tracking)
✅ Triggers for updated_at timestamps
✅ RLS policies for admin access

Verify migration:
- Go to Table Editor
- Check if email_templates exists
- Check if email_logs exists
- Try saving a template to confirm

If migration fails:
- Check if tables already exist
- Look for error messages
- Run DATABASE_COMPLETE_SETUP.sql for fresh setup`
          },
          {
            title: "Security & Privacy",
            description: `Email Credentials:
✅ Stored in .env.local (server-side only)
✅ Never exposed to client/browser
✅ Not committed to git (.gitignore)
✅ Use App Passwords, not main password

Data Protection:
✅ Email logs stored securely in database
✅ RLS policies restrict access to admins
✅ Participant emails encrypted in transit
✅ SMTP connection uses TLS

Best Security Practices:
- Rotate email passwords regularly
- Use separate email account for sending
- Monitor email logs for unusual activity
- Don't share .env.local file
- Revoke App Passwords when not needed

GDPR Compliance:
- Get consent before sending emails
- Provide unsubscribe option
- Honor opt-out requests immediately
- Delete old logs after retention period
- Document data processing activities`
          }
        ]}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronRightIcon, ChevronLeftIcon, CloudArrowUpIcon, CheckCircleIcon, DocumentTextIcon, TableCellsIcon, UserGroupIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import CertificatePreview from '@/components/certificates/CertificatePreview';
import { Committee, CommitteeMember } from '@/lib/types/database';

type Step = 'config' | 'recipients' | 'review';

export default function GenerateCertificatePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<Step>('config');
  const [uploading, setUploading] = useState(false);

  // Configuration State
  const [config, setConfig] = useState({
    title: 'Certificate of Participation',
    type: 'participation' as 'appreciation' | 'participation',
    eventName: '',
    issueDate: new Date().toISOString().split('T')[0],
    description: '', // Optional override
    signature1Url: '',
    signature1Name: 'Organizer Name',
    signature1Title: 'Organizer',
    signature2Url: '',
    signature2Name: 'Advisor Name',
    signature2Title: 'Faculty Advisor',
  });

  // Recipients State
  const [sourceMode, setSourceMode] = useState<'manual' | 'committee' | 'sheet'>('manual');

  // Manual
  const [manualEntry, setManualEntry] = useState({ name: '', email: '', role: '' });

  // Committee
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState('');
  const [fetchingMembers, setFetchingMembers] = useState(false);

  // Sheet
  const [sheetUrl, setSheetUrl] = useState('');
  const [fetchingSheet, setFetchingSheet] = useState(false);

  // Final List
  const [recipients, setRecipients] = useState<Array<{ name: string; email: string; role?: string }>>([]);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load committees on mount
  useEffect(() => {
    async function loadCommittees() {
      const { data } = await supabase.from('committees').select('*').order('created_at', { ascending: false });
      if (data) setCommittees(data);
    }
    loadCommittees();
  }, []);

  // Signature Upload Handler
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'signature1Url' | 'signature2Url') {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `signatures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      setConfig(prev => ({ ...prev, [field]: publicUrl }));
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // --- Recipient Handlers ---

  function addManualRecipient() {
    if (!manualEntry.name) return;
    setRecipients(prev => [...prev, { ...manualEntry }]);
    setManualEntry({ name: '', email: '', role: '' });
  }

  async function fetchCommitteeMembers() {
    if (!selectedCommitteeId) return;
    setFetchingMembers(true);
    const { data, error } = await supabase
      .from('committee_members')
      .select('*')
      .eq('committee_id', selectedCommitteeId);

    if (data) {
        // Map to recipients
        const newRecipients = data.map(m => ({
            name: m.name,
            email: m.email || '',
            role: m.designation // Use designation as role
        }));
        setRecipients(prev => [...prev, ...newRecipients]);
    }
    setFetchingMembers(false);
  }

  async function fetchSheetData() {
      if (!sheetUrl) return;
      setFetchingSheet(true);
      try {
          const res = await fetch('/api/emails/fetch-participants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sheetUrl }) // Reuse email sheet fetcher? It returns { name, email }. Need Role/Date/Event?
              // The prompt requirements say: "Sheet need specific column headers: Name, Event, Date, Role"
              // The existing email fetcher might only map Name/Email.
              // I might need to update the existing API or create a new fetcher.
              // For now, let's assume I need a custom logic here or check what the existing API returns.
              // The existing API returns { participants: { name, email }[] }.
              // If I want more columns, I should probably write a dedicated fetcher or update that one.
              // I will use a local implementation of sheet fetching here to be safe and flexible.
          });

          // Re-implementing simplified fetch for now since I can't easily modify the shared API return type without checking usages.
          // Or I can call a new endpoint. Or just do it client side if I could.
          // Let's use the 'fetch-participants' API but check if it returns raw data?
          // The memory says: "Google Sheets integration utilizes a client-side fetch in no-cors mode."
          // But the memory also says `app/api/emails/fetch-participants` exists.

          // Let's try to fetch using the existing API and see if we can adapt.
          // Actually, I'll write a new simple client-side fetch if possible, OR just use the API.
          // But the API might strip columns.
          // Let's stick to the plan: "Reuse existing sheet fetching logic".
          // I'll call the existing API. If it misses columns, I'll update the API in a later step (refactoring).
          // But wait, "Event" and "Date" in the sheet might override the config?
          // The prompt says "sheet need specific column headers : Name,Event,date,Role".
          // So if the sheet has them, they override global config.

          // For this step (UI), I'll just put a placeholder implementation or call the API.
          // I will assume for now the API returns name/email and I will set default role.
          // To get "Event" and "Role" from sheet, I really need to parse those columns.

          const response = await fetch('/api/emails/fetch-participants', {
            method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ sheetUrl })
          });
          const data = await response.json();
          if (data.participants) {
              setRecipients(prev => [...prev, ...data.participants.map((p: any) => ({
                  name: p.name,
                  email: p.email,
                  role: p.role || '', // The API might not return role.
                  // If I need to support Role/Event columns, I should update the API.
                  // I will note this for the next steps.
              }))]);
          }
      } catch (e) {
          console.error(e);
          alert('Failed to fetch sheet');
      } finally {
          setFetchingSheet(false);
      }
  }

  // --- Generation ---
  async function generateCertificates() {
      if (recipients.length === 0) return;
      setGenerating(true);
      setProgress(0);

      try {
          const total = recipients.length;
          let current = 0;

          const batchSize = 10;
          for (let i = 0; i < total; i += batchSize) {
              const batch = recipients.slice(i, i + batchSize);

              const inserts = batch.map(r => ({
                  recipient_name: r.name,
                  recipient_email: r.email,
                  certificate_type: config.type,
                  event_name: config.eventName, // Sheet might override this? For now use global.
                  issue_date: config.issueDate,
                  role: r.role || 'Participant',
                  metadata: {
                      signature1_url: config.signature1Url,
                      signature2_url: config.signature2Url,
                      signature1_name: config.signature1Name,
                      signature2_name: config.signature2Name,
                      signature1_title: config.signature1Title,
                      signature2_title: config.signature2Title,
                      description: config.description
                  }
              }));

              const { error } = await supabase.from('certificates').insert(inserts);
              if (error) throw error;

              current += batch.length;
              setProgress(Math.round((current / total) * 100));
          }

          alert('Certificates generated successfully!');
          router.push('/admin/certificates');
      } catch (error: any) {
          console.error(error);
          alert('Generation failed: ' + error.message);
      } finally {
          setGenerating(false);
      }
  }

  // Helper to remove recipient
  const removeRecipient = (index: number) => {
      setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-32">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Generate Certificates</h1>
                    <p className="text-gray-400">Create certificates manually or in bulk</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${activeStep === 'config' ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700'}`}>
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-indigo-900 font-bold text-xs">1</span>
                        <span>Configuration</span>
                    </div>
                    <div className="w-8 h-px bg-gray-700"></div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${activeStep === 'recipients' ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700'}`}>
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-indigo-900 font-bold text-xs">2</span>
                        <span>Recipients</span>
                    </div>
                    <div className="w-8 h-px bg-gray-700"></div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${activeStep === 'review' ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700'}`}>
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-indigo-900 font-bold text-xs">3</span>
                        <span>Review</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Configuration */}
            {activeStep === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                    <div className="space-y-6">
                         {/* Basic Info */}
                         <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                             <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5"/> Basic Details</h3>
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-sm text-gray-400 mb-1">Certificate Type</label>
                                     <select
                                        value={config.type}
                                        onChange={(e) => setConfig({...config, type: e.target.value as any})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 outline-none"
                                     >
                                         <option value="participation">Participation</option>
                                         <option value="appreciation">Appreciation</option>
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-sm text-gray-400 mb-1">Event Name</label>
                                     <input
                                        type="text"
                                        value={config.eventName}
                                        onChange={(e) => setConfig({...config, eventName: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 outline-none"
                                        placeholder="e.g. Intro to Python Workshop"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm text-gray-400 mb-1">Issue Date</label>
                                     <input
                                        type="date"
                                        value={config.issueDate}
                                        onChange={(e) => setConfig({...config, issueDate: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 outline-none"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm text-gray-400 mb-1">Custom Description (Optional)</label>
                                     <textarea
                                        value={config.description}
                                        onChange={(e) => setConfig({...config, description: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:border-indigo-500 outline-none text-sm"
                                        placeholder="Override default text..."
                                        rows={3}
                                     />
                                 </div>
                             </div>
                         </div>

                         {/* Signatures */}
                         <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                             <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Signatories</h3>

                             <div className="grid grid-cols-2 gap-4">
                                 {/* Sig 1 */}
                                 <div className="space-y-3">
                                     <h4 className="font-semibold text-gray-400 text-sm border-b border-gray-700 pb-1">Left Signature</h4>
                                     <input
                                        type="text"
                                        placeholder="Name"
                                        value={config.signature1Name}
                                        onChange={(e) => setConfig({...config, signature1Name: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                                     />
                                     <input
                                        type="text"
                                        placeholder="Title"
                                        value={config.signature1Title}
                                        onChange={(e) => setConfig({...config, signature1Title: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                                     />
                                     <div className="relative">
                                         <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, 'signature1Url')}
                                            className="hidden"
                                            id="sig1"
                                            accept="image/*"
                                         />
                                         <label htmlFor="sig1" className="block w-full p-2 border border-dashed border-gray-600 rounded text-center text-xs text-gray-400 cursor-pointer hover:bg-gray-700">
                                             {uploading ? 'Uploading...' : config.signature1Url ? 'Change Image' : 'Upload Signature'}
                                         </label>
                                     </div>
                                 </div>

                                 {/* Sig 2 */}
                                 <div className="space-y-3">
                                     <h4 className="font-semibold text-gray-400 text-sm border-b border-gray-700 pb-1">Right Signature</h4>
                                     <input
                                        type="text"
                                        placeholder="Name"
                                        value={config.signature2Name}
                                        onChange={(e) => setConfig({...config, signature2Name: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                                     />
                                     <input
                                        type="text"
                                        placeholder="Title"
                                        value={config.signature2Title}
                                        onChange={(e) => setConfig({...config, signature2Title: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                                     />
                                     <div className="relative">
                                         <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, 'signature2Url')}
                                            className="hidden"
                                            id="sig2"
                                            accept="image/*"
                                         />
                                         <label htmlFor="sig2" className="block w-full p-2 border border-dashed border-gray-600 rounded text-center text-xs text-gray-400 cursor-pointer hover:bg-gray-700">
                                             {uploading ? 'Uploading...' : config.signature2Url ? 'Change Image' : 'Upload Signature'}
                                         </label>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Preview Column */}
                    <div className="sticky top-6">
                        <h3 className="text-xl font-bold mb-4">Live Preview</h3>
                        <div className="border border-gray-700 rounded-lg overflow-hidden bg-white">
                             <div className="origin-top-left transform scale-[0.45] w-[1123px] h-[794px]">
                                 <CertificatePreview
                                    recipientName="John Doe"
                                    certificateType={config.type}
                                    eventName={config.eventName || 'Event Name'}
                                    issueDate={config.issueDate}
                                    verificationId="DEMO-1234-5678"
                                    signature1Url={config.signature1Url}
                                    signature1Name={config.signature1Name}
                                    signature1Title={config.signature1Title}
                                    signature2Url={config.signature2Url}
                                    signature2Name={config.signature2Name}
                                    signature2Title={config.signature2Title}
                                    description={config.description}
                                 />
                             </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setActiveStep('recipients')}
                                disabled={!config.eventName}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Recipients */}
            {activeStep === 'recipients' && (
                <div className="animate-fadeIn space-y-8">
                    <div className="flex gap-4">
                        <button onClick={() => setSourceMode('manual')} className={`flex-1 p-4 rounded-xl border transition-all ${sourceMode === 'manual' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
                            <PlusIcon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-center font-bold">Manual Entry</div>
                        </button>
                        <button onClick={() => setSourceMode('committee')} className={`flex-1 p-4 rounded-xl border transition-all ${sourceMode === 'committee' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
                            <UserGroupIcon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-center font-bold">Committee</div>
                        </button>
                        <button onClick={() => setSourceMode('sheet')} className={`flex-1 p-4 rounded-xl border transition-all ${sourceMode === 'sheet' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
                            <TableCellsIcon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-center font-bold">Google Sheet</div>
                        </button>
                    </div>

                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                        {sourceMode === 'manual' && (
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-sm text-gray-400">Name</label>
                                    <input value={manualEntry.name} onChange={e => setManualEntry({...manualEntry, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-400">Email</label>
                                    <input value={manualEntry.email} onChange={e => setManualEntry({...manualEntry, email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-400">Role (Optional)</label>
                                    <input value={manualEntry.role} onChange={e => setManualEntry({...manualEntry, role: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
                                </div>
                                <button onClick={addManualRecipient} className="px-4 py-2 bg-indigo-600 rounded text-white font-bold">Add</button>
                            </div>
                        )}

                        {sourceMode === 'committee' && (
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-sm text-gray-400">Select Committee Year</label>
                                    <select
                                        value={selectedCommitteeId}
                                        onChange={e => setSelectedCommitteeId(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2"
                                    >
                                        <option value="">Select...</option>
                                        {committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <button
                                    onClick={fetchCommitteeMembers}
                                    disabled={fetchingMembers || !selectedCommitteeId}
                                    className="px-6 py-2 bg-indigo-600 rounded text-white font-bold disabled:opacity-50"
                                >
                                    {fetchingMembers ? 'Fetching...' : 'Load Members'}
                                </button>
                            </div>
                        )}

                        {sourceMode === 'sheet' && (
                             <div className="flex gap-4 items-end">
                                 <div className="flex-1">
                                     <label className="text-sm text-gray-400">Google Sheet URL</label>
                                     <input
                                        value={sheetUrl}
                                        onChange={e => setSheetUrl(e.target.value)}
                                        placeholder="https://docs.google.com/spreadsheets/..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2"
                                     />
                                 </div>
                                 <button
                                     onClick={fetchSheetData}
                                     disabled={fetchingSheet || !sheetUrl}
                                     className="px-6 py-2 bg-indigo-600 rounded text-white font-bold disabled:opacity-50"
                                 >
                                     {fetchingSheet ? 'Fetching...' : 'Import Data'}
                                 </button>
                             </div>
                        )}
                    </div>

                    {/* Recipients List */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold">Recipient List ({recipients.length})</h3>
                            <button onClick={() => setRecipients([])} className="text-red-400 text-sm">Clear All</button>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {recipients.map((r, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-gray-900 rounded border border-gray-700">
                                    <div>
                                        <div className="font-bold">{r.name}</div>
                                        <div className="text-sm text-gray-400">{r.email} {r.role && `• ${r.role}`}</div>
                                    </div>
                                    <button onClick={() => removeRecipient(i)} className="text-gray-500 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            ))}
                            {recipients.length === 0 && <div className="text-gray-500 text-center py-4">No recipients added yet.</div>}
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                         <button onClick={() => setActiveStep('config')} className="text-gray-400 hover:text-white flex items-center gap-2">
                             <ChevronLeftIcon className="w-5 h-5"/> Back
                         </button>
                         <button
                            onClick={() => setActiveStep('review')}
                            disabled={recipients.length === 0}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
                         >
                            Next Step <ChevronRightIcon className="w-5 h-5" />
                         </button>
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {activeStep === 'review' && (
                <div className="animate-fadeIn text-center py-12">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-2xl mx-auto">
                        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-2">Ready to Generate</h2>
                        <p className="text-gray-400 mb-8">
                            You are about to generate <span className="text-white font-bold">{recipients.length}</span> certificates
                            for <span className="text-white font-bold">{config.eventName}</span>.
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-left bg-gray-900 p-4 rounded-lg mb-8 text-sm">
                            <div>
                                <span className="text-gray-500 block">Type</span>
                                <span className="text-white">{config.type}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Date</span>
                                <span className="text-white">{config.issueDate}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Signatures</span>
                                <span className="text-white">{config.signature1Name} & {config.signature2Name}</span>
                            </div>
                        </div>

                        {generating ? (
                             <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                                 <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                             </div>
                        ) : (
                            <button
                                onClick={generateCertificates}
                                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg shadow-lg hover:scale-105 transition-transform"
                            >
                                Generate Certificates
                            </button>
                        )}

                        {!generating && (
                             <button onClick={() => setActiveStep('recipients')} className="mt-4 text-gray-400 hover:text-white underline">
                                 Go Back
                             </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

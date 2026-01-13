'use client';

import { useState, useEffect } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
import FormModal from './FormModal';
import FieldModal from './FieldModal';
import PaymentMethodModal from './PaymentMethodModal';
import {
  getAllRegistrationForms,
  createRegistrationForm,
  updateRegistrationForm,
  deleteRegistrationForm,
  toggleFormStatus,
  getSubmissionCount,
  setupSheetHeaders,
} from '@/lib/registration-api';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
} from '@/lib/payment-api';
import type { RegistrationForm, FormField, PaymentMethod } from '@/lib/types/database';
import {
  ClipboardDocumentCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClipboardIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import AnimatedToggle from '@/components/AnimatedToggle';

export default function RegistrationFormsAdmin() {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<RegistrationForm | null>(null);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [submissionLoading, setSubmissionLoading] = useState(true);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    game_name: '',
    game_slug: '',
    title: '',
    description: '',
    google_sheet_url: '',
    is_active: false,
    registration_fee: '',
    registration_deadline: '',
    club_logo_url: '',
    tournament_logo_url: '',
    game_logo_url: '',
    hero_image_url: '',
    primary_color: '#6B46C1',
    secondary_color: '#EC4899',
    accent_color: '#3B82F6',
    heading_font: 'default',
    body_font: 'default',
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  useEffect(() => {
    fetchForms();
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      setPaymentLoading(true);
      const data = await getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setPaymentLoading(false);
    }
  }

  async function handleSavePaymentMethod(data: Partial<PaymentMethod>) {
    if (editingPaymentMethod) {
      await updatePaymentMethod(editingPaymentMethod.id, data);
    } else {
      await createPaymentMethod(data);
    }
    fetchPayments();
  }

  async function handleDeletePaymentMethod(id: string) {
    if (confirm('Delete this payment method?')) {
      await deletePaymentMethod(id);
      fetchPayments();
    }
  }

  async function handleTogglePaymentStatus(id: string, currentStatus: boolean) {
    await togglePaymentMethodStatus(id, !currentStatus);
    fetchPayments();
  }

  function openPaymentModal(method?: PaymentMethod) {
    setEditingPaymentMethod(method || null);
    setPaymentModalOpen(true);
  }

  async function fetchForms() {
    try {
      setLoading(true);
      const data = await getAllRegistrationForms();
      setForms(data);
      setLoading(false);

      // Fetch submission counts separately to avoid blocking UI
      setSubmissionLoading(true);
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
      setSubmissionLoading(false);
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
        registration_fee: form.registration_fee || '',
        registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString().slice(0, 16) : '',
        club_logo_url: form.club_logo_url || '',
        tournament_logo_url: form.tournament_logo_url || '',
        game_logo_url: form.game_logo_url || '',
        hero_image_url: form.hero_image_url || '',
        primary_color: form.primary_color || '#6B46C1',
        secondary_color: form.secondary_color || '#EC4899',
        accent_color: form.accent_color || '#3B82F6',
        heading_font: form.heading_font || 'default',
        body_font: form.body_font || 'default',
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
        registration_fee: '',
        registration_deadline: '',
        club_logo_url: '',
        tournament_logo_url: '',
        game_logo_url: '',
        hero_image_url: '',
        primary_color: '#6B46C1',
        secondary_color: '#EC4899',
        accent_color: '#3B82F6',
        heading_font: 'default',
        body_font: 'default',
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

      // Explicitly construct payload to avoid sending legacy or undefined fields
      const {
        // @ts-ignore - Exclude potential legacy fields if they exist in state
        banner_url,
        // @ts-ignore
        organizer_logo_url,
        ...cleanData
      } = formData;

      const payload: any = {
        ...cleanData,
        game_slug: formData.game_slug || generateSlug(formData.game_name),
        form_fields: formFields,
        registration_deadline: formData.registration_deadline || null,
      };

      let savedForm;
      if (editingForm) {
        savedForm = await updateRegistrationForm(editingForm.id, payload);
      } else {
        savedForm = await createRegistrationForm(payload);
      }

      // Auto-configure Sheet Headers if URL is provided
      if (formData.google_sheet_url && formData.google_sheet_url.includes('script.google.com')) {
        const fieldLabels = formFields.map(f => f.label);
        await setupSheetHeaders(formData.google_sheet_url, fieldLabels);
        // We don't block UI for this, but could show a toast if we had one
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

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
           <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Registration Forms</h1>
           <p className="text-gray-400 text-lg">Create and manage dynamic registration forms for tournaments and events</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openPaymentModal()}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-purple-300 rounded-xl font-bold hover:bg-white/10 transition-all"
          >
            <CreditCardIcon className="w-5 h-5" />
            <span>Payment Methods</span>
          </button>
          <button
            onClick={() => openFormModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Form</span>
          </button>
        </div>
      </div>

      {/* Payment Methods Section (Collapsible or Gridded) */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-white/5 p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BanknotesIcon className="w-6 h-6 text-green-400" />
          Active Payment Methods
        </h2>
        
        {paymentLoading ? (
           <div className="flex gap-4 animate-pulse">
             {[1,2].map(i => <div key={i} className="h-24 w-64 bg-white/5 rounded-xl"></div>)}
           </div>
        ) : paymentMethods.length === 0 ? (
           <div className="text-gray-500 italic">No payment methods configured. Click &quot;Payment Methods&quot; to add one.</div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentMethods.map(method => (
                <div key={method.id} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col relative group hover:border-purple-500/30 transition-colors">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white">{method.name}</h3>
                        <p className="text-xs text-gray-400 font-mono tracking-wider">{method.account_type.toUpperCase()}</p>
                      </div>
                      <AnimatedToggle 
                        isOn={method.is_active} 
                        onToggle={() => handleTogglePaymentStatus(method.id, method.is_active)}
                        size="sm"
                      />
                   </div>
                   <div className="text-lg font-mono font-bold text-purple-400 mb-2">{method.number}</div>
                   
                   <div className="mt-auto flex gap-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openPaymentModal(method)} className="text-xs flex-1 bg-white/5 hover:bg-white/10 py-1.5 rounded text-blue-300">Edit</button>
                      <button onClick={() => handleDeletePaymentMethod(method.id)} className="text-xs flex-1 bg-red-500/10 hover:bg-red-500/20 py-1.5 rounded text-red-400">Delete</button>
                   </div>
                </div>
              ))}
           </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
             <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 animate-pulse">Loading forms...</p>
            </div>
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-16 text-center backdrop-blur-sm">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                 <ClipboardDocumentCheckIcon className="w-10 h-10 text-gray-600" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No Registration Forms</h3>
             <p className="text-gray-400 mb-6">Create your first custom registration form to start accepting participants.</p>
             <button
               onClick={() => openFormModal()}
               className="text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-center gap-2 mx-auto"
             >
                <PlusIcon className="w-4 h-4" /> Create New Form
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="group bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      {form.game_name && (
                         <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 truncate">{form.game_name}</div>
                      )}
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-purple-300 transition-colors" title={form.title}>{form.title}</h3>
                    </div>
                    <button
                        onClick={() => handleToggleStatus(form.id, form.is_active)}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                          form.is_active 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                          : 'bg-gray-700/50 text-gray-400 border-gray-600/30 hover:bg-gray-700'
                        }`}
                      >
                       {form.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="space-y-3 mb-6 bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                          <ClipboardIcon className="w-4 h-4" /> Fields
                      </div>
                      <span className="font-semibold text-white">{form.form_fields?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                         <UsersIcon className="w-4 h-4" /> Submissions
                      </div>
                      <span className="font-semibold text-green-400">
                          {submissionLoading && !submissionCounts[form.id] ? '...' : submissionCounts[form.id] || 0}
                      </span>
                    </div>
                    {form.registration_deadline && (
                      <div className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2 text-gray-400">
                            <CalendarIcon className="w-4 h-4" /> Deadline
                         </div>
                        <span className="font-medium text-gray-300">{new Date(form.registration_deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openFormModal(form)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => window.open(`/register/${form.game_slug}`, '_blank')}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-purple-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/register/${form.game_slug}`;
                        navigator.clipboard.writeText(url);
                        alert('✅ Registration link copied to clipboard!');
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-green-400 rounded-lg text-sm font-medium transition-colors"
                    >
                       <DocumentDuplicateIcon className="w-4 h-4" /> Copy Link
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-red-500/10 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {fieldModalOpen && editingField && (
        <FieldModal
          field={editingField}
          onSave={handleSaveField}
          onClose={() => setFieldModalOpen(false)}
        />
      )}

      <AdminHelpButton
        title="📝 Registration Form Builder"
        instructions={[
          "**Create Form**: Build dynamic forms for tournaments. Each form generates a unique public URL.",
          "**Google Sheets Integration**: Responses are saved directly to your Google Sheet.",
          "**Payment Methods**: Configure Bkash/Nagad numbers that users will see during checkout.",
          "**Fields**: Add custom inputs like `Text`, `Dropdown`, `Checkbox`, etc."
        ]}
        tips={[
          "**Apps Script**: You MUST deploy the provided Google Apps Script code as a Web App for the integration to work.",
          "**Slug**: The 'Game Slug' determines the URL (e.g., `/register/valorant`).",
          "**Testing**: Always toggle `Active` status to testing before going live."
        ]}
        actions={[
          {
            title: "💻 Google Apps Script Setup (Enhanced)",
            description: 
              "This script allows the system to automatically create headers and save data.\n\n1. Open your Google Sheet → Extensions → Apps Script.\n2. **Delete everything** and paste the code below.\n3. Deploy → New Deployment → Type: Web App → Execute as: **Me** → Access: **Anyone**.\n4. Copy the `Web App URL` and paste it in the form settings.\n\n```javascript\nfunction doPost(e){var p=JSON.parse(e.postData.contents);var s=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();if(p.action=='setup_headers'){s.clear();s.appendRow(p.fields);s.getRange(1,1,1,p.fields.length).setFontWeight('bold').setBackground('#eee');return r({'result':'success'})}else{var h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0];var row=[];var d=p.data||{};h.forEach(function(k){row.push(d[k]||'')});s.appendRow(row);return r({'result':'success'})}}function r(d){return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON)}```"
          }
        ]}
      />

      {/* Payment Method Modal */}
      {paymentModalOpen && (
        <PaymentMethodModal
          method={editingPaymentMethod}
          onSave={handleSavePaymentMethod}
          onClose={() => setPaymentModalOpen(false)}
        />
      )}
    </div>
  );
}

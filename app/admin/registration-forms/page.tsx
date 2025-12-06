'use client';

import { useState, useEffect } from 'react';
import AdminHelpButton from '@/components/AdminHelpButton';
import FormModal from './FormModal';
import FieldModal from './FieldModal';
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
    club_logo_url: '',
    tournament_logo_url: '',
    game_logo_url: '',
    hero_image_url: '',
    primary_color: '#6B46C1',
    secondary_color: '#EC4899',
    accent_color: '#3B82F6',
    heading_font: 'default',
    body_font: 'default',
    tournament_details: {
      about: '',
      key_features: [] as string[],
      prize_pool_highlights: '',
    },
    game_details: {
      description: '',
      game_image_url: '',
    },
    schedule: {
      tournament_start: '',
      tournament_end: '',
    },
    rules_and_regulations: {
      summary: '',
      rulebook_url: '',
    },
    show_tournament_section: false,
    show_game_details_section: false,
    show_schedule_section: false,
    show_rules_section: false,
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
        club_logo_url: form.club_logo_url || '',
        tournament_logo_url: form.tournament_logo_url || '',
        game_logo_url: form.game_logo_url || '',
        hero_image_url: form.hero_image_url || '',
        primary_color: form.primary_color || '#6B46C1',
        secondary_color: form.secondary_color || '#EC4899',
        accent_color: form.accent_color || '#3B82F6',
        heading_font: form.heading_font || 'default',
        body_font: form.body_font || 'default',
        tournament_details: form.tournament_details || { about: '', key_features: [], prize_pool_highlights: '' } as any,
        game_details: form.game_details || { description: '', game_image_url: '' } as any,
        schedule: form.schedule || { tournament_start: '', tournament_end: '' } as any,
        rules_and_regulations: form.rules_and_regulations || { summary: '', rulebook_url: '' } as any,
        show_tournament_section: form.show_tournament_section ?? false,
        show_game_details_section: form.show_game_details_section ?? false,
        show_schedule_section: form.show_schedule_section ?? false,
        show_rules_section: form.show_rules_section ?? false,
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
        club_logo_url: '',
        tournament_logo_url: '',
        game_logo_url: '',
        hero_image_url: '',
        primary_color: '#6B46C1',
        secondary_color: '#EC4899',
        accent_color: '#3B82F6',
        heading_font: 'default',
        body_font: 'default',
        tournament_details: { about: '', key_features: [], prize_pool_highlights: '' },
        game_details: { description: '', game_image_url: '' },
        schedule: { tournament_start: '', tournament_end: '' },
        rules_and_regulations: { summary: '', rulebook_url: '' },
        show_tournament_section: false,
        show_game_details_section: false,
        show_schedule_section: false,
        show_rules_section: false,
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

      {/* Comprehensive Registration Forms Help Button */}
      <AdminHelpButton
        title="📝 Registration Forms - Complete Guide with Code"
        instructions={[
          "STEP 1: Click 'Create New Form' button to begin",
          "STEP 2: Enter Game Name (e.g., 'Valorant') and Game Slug (e.g., 'valorant-2025')",
          "STEP 3: Add Form Title and Description",
          "STEP 4: Create Google Sheet (see detailed setup below)",
          "STEP 5: Add Apps Script code to Google Sheet (CRITICAL - see code below)",
          "STEP 6: Deploy Apps Script as Web App and get URL",
          "STEP 7: Paste the Web App URL in 'Google Sheet URL' field",
          "STEP 8: Add custom form fields (Name, Email, Phone, etc.)",
          "STEP 9: Set Max Registrations and Deadline (optional)",
          "STEP 10: Test form while keeping it inactive",
          "STEP 11: Activate form and share URL with users",
          "STEP 12: Monitor submissions in your Google Sheet"
        ]}
        tips={[
          "🔑 Game Slug must be unique, lowercase, use hyphens only (e.g., valorant-2025)",
          "📊 Google Apps Script is REQUIRED to receive form data - copy the exact code below",
          "🚀 Web App URL looks like: https://script.google.com/macros/s/YOUR_ID/exec",
          "✅ Test the Web App URL first before adding to admin panel",
          "📧 Use 'email' type for email fields to enable validation",
          "💾 All submissions save automatically to Google Sheet in real-time",
          "🔒 Keep form inactive while testing to avoid incomplete submissions",
          "📱 Forms are mobile-responsive automatically",
          "🗓️ Forms automatically close after deadline if set",
          "⚙️ Apps Script must be deployed as 'Anyone' with 'Anonymous' access"
        ]}
        actions={[
          {
            title: "🆕 COMPLETE SETUP PROCESS",
            description: "1. Create Google Sheet → 2. Copy Apps Script code → 3. Deploy as Web App → 4. Get deployment URL → 5. Create form in admin panel → 6. Paste Web App URL → 7. Add form fields → 8. Test → 9. Activate"
          },
          {
            title: "📊 STEP-BY-STEP: Google Sheet Setup",
            description: "Go to sheets.google.com → Create new spreadsheet → Name it (e.g., 'Valorant Registrations') → Add headers: Timestamp | Name | Email | Phone | [Your Fields] → Save sheet"
          },
          {
            title: "💻 CRITICAL: Apps Script Code (COPY EXACT CODE)",
            description: `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Create row array with timestamp
    var rowData = [new Date()];
    
    // Add all field values in order
    for (var key in data) {
      rowData.push(data[key]);
    }
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`
          },
          {
            title: "🚀 DEPLOY APPS SCRIPT AS WEB APP",
            description: `After pasting code: Click 'Deploy' → 'New deployment' → Click ⚙️ gear icon → Select 'Web app' → Settings: Execute as: 'Me' | Who has access: 'Anyone' → Click 'Deploy' → Authorize (click your email → Advanced → Go to Form Handler → Allow) → Copy Web App URL → Click 'Done' → Paste URL in admin form's Google Sheet URL field`
          },
          {
            title: "✅ TEST YOUR WEB APP (IMPORTANT)",
            description: `Test URL format: https://script.google.com/macros/s/LONG_ID_HERE/exec → Open Postman or use browser console → Send POST request with test data → Check if data appears in Google Sheet → If working, proceed with form creation`
          },
          {
            title: "➕ CREATE FORM IN ADMIN PANEL",
            description: `Admin Panel → Registration Forms → Create New Form → Fill: Game Name, Slug, Title, Description → Paste Web App URL in 'Google Sheet URL' → Set max registrations & deadline → Save form`
          },
          {
            title: "📝 ADD CUSTOM FORM FIELDS",
            description: `Click 'Add Form Field' → Choose type (text/email/tel/select/etc.) → Enter label → For select/radio/checkbox: add options (one per line) → Mark 'Required' if mandatory → Save → Repeat for all fields → Field order = form appearance order`
          },
          {
            title: "🎮 COMPLETE EXAMPLE: Valorant Tournament",
            description: `Sheet Headers: Timestamp | Full Name | Email | Phone | In-Game Name | Rank | Team Name

Form Fields:
1. Full Name (text, required)
2. Email (email, required)
3. Phone (tel, required)
4. In-Game Name (text, required)
5. Rank (select, required) - Options: Iron, Bronze, Silver, Gold, Platinum, Diamond
6. Team Name (text, optional)

Game Slug: valorant-championship-2025
URL: yoursite.com/registration/valorant-championship-2025`
          },
          {
            title: "🔧 TROUBLESHOOTING GUIDE",
            description: `Problem: Submissions not saving → Check Apps Script deployed as 'Anyone' access | Problem: 'Authorization required' → Re-authorize in Apps Script | Problem: Wrong data order → Match sheet headers with form field order | Problem: Form URL 404 → Verify game slug format | Problem: Script error → Check code copied exactly, no extra spaces`
          },
          {
            title: "🔄 UPDATE EXISTING DEPLOYMENT",
            description: `If you need to update Apps Script: Open script → Make changes → Save → Click 'Deploy' → 'Manage deployments' → Click ✏️ edit icon → New version → Update → Paste new URL in admin panel`
          },
          {
            title: "📋 FULL DEPLOYMENT CHECKLIST",
            description: `□ Google Sheet created with proper headers
□ Apps Script code pasted exactly
□ Script saved with project name
□ Deployed as Web App
□ Execute as: 'Me' selected
□ Access: 'Anyone' selected
□ Authorization completed
□ Web App URL copied
□ Test submission successful
□ Data appears in sheet
□ Form created in admin panel
□ Web App URL pasted
□ All fields added
□ Field order correct
□ Required fields marked
□ Test form submission
□ Form activated
□ URL shared with users`
          },
          {
            title: "💡 ADVANCED: Email Notification Code (Optional)",
            description: `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var rowData = [new Date()];
    for (var key in data) {
      rowData.push(data[key]);
    }
    sheet.appendRow(rowData);
    
    // Send email notification
    MailApp.sendEmail({
      to: 'admin@yoursite.com',
      subject: 'New Registration Received',
      body: 'Name: ' + data.name + '\\nEmail: ' + data.email
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`
          }
        ]}
      />
    </div>
  );
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

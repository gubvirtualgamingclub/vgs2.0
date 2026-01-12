// Registration Forms API Functions
import { supabase } from '@/lib/supabase';
import type { RegistrationForm, RegistrationSubmission } from '@/lib/types/database';

// ============================================
// Registration Forms Management
// ============================================

export async function getAllRegistrationForms(): Promise<RegistrationForm[]> {
  const { data, error } = await supabase
    .from('registration_forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getActiveRegistrationForms(): Promise<RegistrationForm[]> {
  const { data, error } = await supabase
    .from('registration_forms')
    .select('*')
    .eq('is_active', true)
    .order('game_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getRegistrationFormBySlug(slug: string): Promise<RegistrationForm | null> {
  const { data, error } = await supabase
    .from('registration_forms')
    .select('*')
    .eq('game_slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createRegistrationForm(form: Omit<RegistrationForm, 'id' | 'created_at' | 'updated_at'>): Promise<RegistrationForm> {
  const { data, error } = await supabase
    .from('registration_forms')
    .insert([form])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRegistrationForm(id: string, updates: Partial<RegistrationForm>): Promise<RegistrationForm> {
  const { data, error } = await supabase
    .from('registration_forms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRegistrationForm(id: string): Promise<void> {
  const { error } = await supabase
    .from('registration_forms')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleFormStatus(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('registration_forms')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// Registration Submissions
// ============================================

export async function submitRegistration(
  formId: string,
  submissionData: Record<string, any>,
  transactionId?: string,
  paymentMethodId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<RegistrationSubmission> {
  const { data, error } = await supabase
    .from('registration_submissions')
    .insert([
      {
        form_id: formId,
        submission_data: submissionData,
        transaction_id: transactionId,
        payment_method_id: paymentMethodId,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFormSubmissions(formId: string): Promise<RegistrationSubmission[]> {
  const { data, error } = await supabase
    .from('registration_submissions')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSubmissionCount(formId: string): Promise<number> {
  const { count, error } = await supabase
    .from('registration_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId);

  if (error) throw error;
  return count || 0;
}

// ============================================
// Google Sheets Integration
// ============================================

export async function sendToGoogleSheets(
  googleSheetUrl: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    // Extract the sheet ID from the URL
    const sheetIdMatch = googleSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      throw new Error('Invalid Google Sheets URL');
    }

    // For Google Sheets integration, you'll need to:
    // 1. Set up Google Apps Script as a Web App
    // 2. Use the Apps Script URL here
    
    // This is a placeholder - you'll need to implement the actual API call
    // based on your Google Apps Script setup
    
    // Example implementation would be:
    // const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    
    // For now, we'll return true as the data is stored in Supabase
    // The actual Google Sheets integration will be set up separately
    return true;
  } catch (error) {
    console.error('Error sending to Google Sheets:', error);
    return false;
  }
}

import { supabase } from '@/lib/supabase';
import { PaymentMethod } from '@/lib/types/database';

export async function getPaymentMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PaymentMethod[];
}

export async function getActivePaymentMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PaymentMethod[];
}

export async function createPaymentMethod(paymentData: Partial<PaymentMethod>) {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert([{
      ...paymentData,
      is_active: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data as PaymentMethod;
}

export async function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>) {
  const { data, error } = await supabase
    .from('payment_methods')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as PaymentMethod;
}

export async function deletePaymentMethod(id: string) {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function togglePaymentMethodStatus(id: string, isActive: boolean) {
  const { error } = await supabase
    .from('payment_methods')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
}

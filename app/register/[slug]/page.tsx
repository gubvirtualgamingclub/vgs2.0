'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getRegistrationFormBySlug, submitRegistration, getSubmissionCount } from '@/lib/registration-api';
import { getActivePaymentMethods } from '@/lib/payment-api';
import type { RegistrationForm, FormField, PaymentMethod } from '@/lib/types/database';
import Link from 'next/link';

const getAnimationDelay = (index: number) => ({
  animationDelay: `${index * 0.05}s`
});

export default function RegistrationPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Payment State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState('');

  const fetchForm = useCallback(async () => {
    try {
      setLoading(true);
      const slug = await Promise.resolve(params.slug);
      const data = await getRegistrationFormBySlug(slug);
      
      if (!data) {
        router.push('/404');
        return;
      }

      setForm(data);
      if (!data.is_active) {
        setLoading(false);
        return;
      }

      const count = await getSubmissionCount(data.id);
      setSubmissionCount(count);

      // Fetch active payment methods
      const payments = await getActivePaymentMethods();
      setPaymentMethods(payments);
      if (payments.length > 0) setSelectedPaymentMethod(payments[0]);

      const initialData: Record<string, any> = {};
      data.form_fields.forEach((field) => {
        initialData[field.id] = field.type === 'checkbox' ? [] : '';
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  }, [params.slug, router]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  function validateStep1(): boolean {
    const newErrors: Record<string, string> = {};
    form?.form_fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) newErrors[field.id] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateField(field: FormField, value: any): string | null {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }
    if (!value) return null;
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email';
    }
    if (field.type === 'tel' && !/^[0-9+\-() ]+$/.test(value)) {
      return 'Invalid phone';
    }
    if (field.type === 'number' && isNaN(Number(value))) {
      return 'Invalid number';
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }
    if (!transactionId.trim()) {
      alert("Please enter the Transaction ID");
      return;
    }

    try {
      setSubmitting(true);
      
      // Combine form data with transaction info
      const submissionPayload = {
        ...formData,
        transaction_id: transactionId,
        payment_method: selectedPaymentMethod.name
      };

      await submitRegistration(form.id, formData, transactionId, selectedPaymentMethod.id);
      await sendToGoogleSheets(form.google_sheet_url, submissionPayload, form.form_fields);
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function sendToGoogleSheets(sheetUrl: string, data: Record<string, any>, fields: FormField[]) {
    try {
      const sheetData: Record<string, any> = {};
      fields.forEach((field) => {
        const value = data[field.id];
        sheetData[field.label] = Array.isArray(value) ? value.join(', ') : (value || '');
      });
      // Add Payment Info
      sheetData['Payment Method'] = data.payment_method;
      sheetData['Transaction ID'] = data.transaction_id;

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetData),
      });
    } catch (error) {
      console.error('Sheets error:', error);
    }
  }

  function handleFieldChange(fieldId: string, value: any, field: FormField) {
    setFormData({ ...formData, [fieldId]: value });
    const error = validateField(field, value);
    setErrors({ ...errors, [fieldId]: error || '' });
  }

  function renderField(field: FormField) {
    const value = formData[field.id];
    const error = errors[field.id];
    const hasError = error && error.trim() !== '';

    // Premium Input Styles
    const baseInputClass = `w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:bg-white/10 transition-all duration-300 outline-none backdrop-blur-sm ${hasError ? 'border-red-500/50 ring-2 ring-red-500/20' : 'hover:border-white/20'}`;

    return (
        <div className="relative group">
            {field.type === 'textarea' ? (
                 <textarea
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                    placeholder=" "
                    className={`${baseInputClass} min-h-32 pt-6`}
                    rows={4}
                 />
            ) : field.type === 'select' ? (
                <select
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                    className={`${baseInputClass} pt-6 appearance-none`}
                >
                    <option value="" className="bg-gray-900 text-gray-400">Select Option</option>
                    {field.options?.map((option) => (
                        <option key={option} value={option} className="bg-gray-900 text-white">
                            {option}
                        </option>
                    ))}
                </select>
            ) : field.type === 'radio' || field.type === 'checkbox' ? (
                <div className="pt-2 space-y-3">
                    {field.options?.map((option) => (
                        <label key={option} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-all group/option">
                             <input
                                type={field.type}
                                name={field.id}
                                value={option}
                                checked={field.type === 'radio' ? value === option : (Array.isArray(value) && value.includes(option))}
                                onChange={(e) => {
                                   if (field.type === 'radio') handleFieldChange(field.id, e.target.value, field);
                                   else {
                                       const curr = Array.isArray(value) ? [...value] : [];
                                       const newVal = e.target.checked ? [...curr, option] : curr.filter((v) => v !== option);
                                       handleFieldChange(field.id, newVal, field);
                                   }
                                }}
                                className={`w-5 h-5 accent-purple-500 border-gray-600 rounded focus:ring-offset-0 focus:ring-0 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`}
                             />
                             <span className="text-gray-300 font-medium group-hover/option:text-white transition-colors">{option}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <input
                    type={field.type}
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                    placeholder=" "
                    className={`${baseInputClass} pt-6`}
                />
            )}
            
            {/* Floating Label */}
            {field.type !== 'radio' && field.type !== 'checkbox' && (
                <label className={`absolute left-5 transition-all duration-300 pointer-events-none text-gray-400 font-medium text-sm
                    ${value ? 'top-2 text-xs text-purple-400' : 'top-4 group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-purple-400'}`}>
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
            )}
            
            {/* Input Line Animation */}
             {(field.type !== 'radio' && field.type !== 'checkbox') && (
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 group-focus-within:w-full rounded-b-xl" />
             )}

            {hasError && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-xs animate-slideDown">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}
        </div>
    );
  }

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      // Could show a toast here
      alert("Copied: " + text); 
  }

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">LOADING_ASSETS...</div>;
  if (!form || !form.is_active) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-red-500">FORM_OFFLINE</div>;
  
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-hidden relative">
        {/* Interactive Background */}
        <div className="fixed inset-0 z-0">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
             {/* Animated Gradient Orbs */}
             <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
             {/* Grid */}
             <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-20">
            
            {/* Header Logos - Floating Animation */}
            <div className="flex justify-center items-center gap-8 mb-16 animate-float">
                {form.club_logo_url && (
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                        <img src={form.club_logo_url} className="h-20 w-auto object-contain relative z-10 transition-transform hover:scale-110" />
                    </div>
                )}
                {form.tournament_logo_url && (
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                        <img src={form.tournament_logo_url} className="h-28 w-auto object-contain relative z-10 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-transform hover:scale-110" />
                    </div>
                )}
                {form.game_logo_url && (
                     <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                        <img src={form.game_logo_url} className="h-20 w-auto object-contain relative z-10 transition-transform hover:scale-110" />
                    </div>
                )}
            </div>

            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 mb-4 drop-shadow-sm uppercase">{form.title}</h1>
                <div className="flex items-center justify-center gap-3">
                    <span className="h-[1px] w-12 bg-purple-500/50"></span>
                    <p className="text-purple-400 font-mono text-sm tracking-[0.3em] uppercase">Official Registration</p>
                    <span className="h-[1px] w-12 bg-purple-500/50"></span>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-12 gap-6">
                <div className={`flex flex-col items-center gap-2 group cursor-default transition-all duration-500 ${currentStep === 1 ? 'scale-110' : 'opacity-50 grayscale'}`}>
                    <div className={`w-12 h-12 rounded-2xl rotate-45 flex items-center justify-center border-2 transition-all duration-500 shadow-[0_0_20px_rgba(168,85,247,0.2)] ${currentStep === 1 ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 bg-gray-900'}`}>
                         <span className="-rotate-45 text-lg font-bold">1</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 mt-2">Details</span>
                </div>
                
                <div className="w-24 h-[2px] bg-gradient-to-r from-purple-900 to-gray-800 rounded-full"></div>

                <div className={`flex flex-col items-center gap-2 group cursor-default transition-all duration-500 ${currentStep === 2 ? 'scale-110' : 'opacity-50 grayscale'}`}>
                    <div className={`w-12 h-12 rounded-2xl rotate-45 flex items-center justify-center border-2 transition-all duration-500 shadow-[0_0_20px_rgba(236,72,153,0.2)] ${currentStep === 2 ? 'border-pink-500 bg-pink-500/10' : 'border-gray-800 bg-gray-900'}`}>
                         <span className="-rotate-45 text-lg font-bold">2</span>
                    </div>
                     <span className="text-xs font-bold uppercase tracking-wider text-pink-300 mt-2">Payment</span>
                </div>
            </div>

            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden group/card">
                {/* Available Form Animation */}
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent translate-x-[-100%] group-hover/card:animate-shimmer"></div>

                {currentStep === 1 ? (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 gap-8">
                             {form.form_fields.map((field) => (
                                <div key={field.id} className="relative">
                                     {renderField(field)}
                                </div>
                             ))}
                        </div>
                        <button 
                            onClick={() => {
                                if(validateStep1()) setCurrentStep(2);
                                else alert("Please fill all required fields correctly.");
                            }}
                            className="w-full py-5 bg-gradient-to-r from-white to-gray-200 text-black font-black text-xl tracking-wide uppercase rounded-xl hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-[0.99]"
                        >
                            Next Step &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white italic">Select Payment Method</h3>
                            <span className="text-xs text-purple-400 font-mono border border-purple-500/30 px-3 py-1 rounded-full bg-purple-500/10">SECURE TRANSACTION</span>
                        </div>
                        
                        {/* Payment Method Tabs */ }
                        {paymentMethods.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                {paymentMethods.map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPaymentMethod(method)}
                                        className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${selectedPaymentMethod?.id === method.id
                                                ? 'bg-purple-900/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {method.logo_url ? (
                                            <img src={method.logo_url} alt={method.name} className="h-10 object-contain mb-1" />
                                        ) : (
                                            <span className="text-2xl mb-1">💳</span>
                                        )}
                                        <div className="text-center">
                                            <span className="block font-bold text-sm tracking-wide">{method.name}</span>
                                            <span className="block text-[10px] font-mono opacity-60 uppercase mt-1">{method.account_type}</span>
                                        </div>

                                        {/* Selected Glow */}
                                        {selectedPaymentMethod?.id === method.id && (
                                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent pointer-events-none"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 border border-white/10 rounded-2xl bg-white/5 mb-6">
                                <p className="text-gray-400">No payment methods available. Please contact support.</p>
                            </div>
                        )}

                        {selectedPaymentMethod && (
                            <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 border border-white/10 relative overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mixed-blend-overlay"></div>

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-8">
                                        <div className="w-full">
                                            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2">Send Money To</p>
                                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 group hover:border-purple-500/50 transition-colors">
                                                <p className="text-3xl font-mono font-bold text-white tracking-wider">{selectedPaymentMethod.number}</p>
                                                <button
                                                    onClick={() => copyToClipboard(selectedPaymentMethod.number)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-400 hover:text-white"
                                                    title="Copy Number"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8 p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                                        <p className="text-purple-400 text-xs uppercase tracking-wider mb-2 font-bold">Instructions & Rules</p>
                                        <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                                            {selectedPaymentMethod.instructions || "1. Send specified amount to the number above.\n2. Copy the Transaction ID (TrxID).\n3. Paste it in the box below."}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-white font-bold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                                            Transaction ID <span className="text-red-500">*</span>
                                            <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">CHECK SMS</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="Paste TrxID Here"
                                            className="w-full px-6 py-5 bg-black border-2 border-dashed border-gray-700 rounded-xl text-white text-xl font-mono focus:outline-none focus:border-purple-500 focus:bg-purple-900/10 transition-all placeholder-gray-700 text-center uppercase tracking-widest"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 font-bold uppercase tracking-wide transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !selectedPaymentMethod || !transactionId}
                                className="flex-1 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xl rounded-xl hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:shadow-none animate-gradient-x"
                            >
                                {submitting ? 'PROCESSING...' : 'CONFIRM REGISTRATION'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mt-12">
                 <p className="text-gray-600 text-xs uppercase tracking-[0.2em]">&copy; VGS 2.0 TOURNAMENT SYSTEM</p>
            </div>
        </div>

        {/* Success Popup */}
        {submitted && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
                <div className="bg-[#0f0f0f] border border-green-500/30 p-12 rounded-[2rem] text-center max-w-lg w-full shadow-[0_0_100px_rgba(34,197,94,0.2)] relative overflow-hidden animate-zoomIn">
                     {/* Confetti / Particle Effect Background */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 to-transparent"></div>
                     
                     <div className="relative z-10">
                         <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30 animate-bounce-slow">
                             <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                             </svg>
                         </div>
                         <h2 className="text-4xl font-black text-white mb-4 italic uppercase">Registration Successful!</h2>
                         <p className="text-gray-400 mb-8 text-lg font-light">Your seat has been reserved. Good luck, Soldier!</p>
                         
                         <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-8">
                             <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transaction ID</p>
                             <p className="text-xl font-mono text-green-400 tracking-widest">{transactionId}</p>
                         </div>

                         <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-wide rounded-xl transition-colors w-full">
                             Register Another Team
                         </button>
                     </div>
                </div>
             </div>
        )}

        <style jsx global>{`
           @keyframes float {
               0%, 100% { transform: translateY(0px); }
               50% { transform: translateY(-10px); }
           }
           @keyframes pulse-slow {
               0%, 100% { opacity: 0.1; transform: scale(1); }
               50% { opacity: 0.3; transform: scale(1.1); }
           }
           .animate-float { animation: float 6s ease-in-out infinite; }
           .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
           .animate-zoomIn { animation: zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
           @keyframes zoomIn {
               from { opacity: 0; transform: scale(0.9); }
               to { opacity: 1; transform: scale(1); }
           }
        `}</style>
    </div>
  );
}

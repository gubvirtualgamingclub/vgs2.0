'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRegistrationFormBySlug, submitRegistration, getSubmissionCount } from '@/lib/registration-api';
import type { RegistrationForm, FormField } from '@/lib/types/database';
import Link from 'next/link';

export default function RegistrationPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchForm();
  }, [params.slug]);

  async function fetchForm() {
    try {
      setLoading(true);
      const slug = await Promise.resolve(params.slug);
      const data = await getRegistrationFormBySlug(slug);
      
      if (!data) {
        router.push('/404');
        return;
      }

      if (!data.is_active) {
        // Form is not active
        setForm(data);
        setLoading(false);
        return;
      }

      setForm(data);
      const count = await getSubmissionCount(data.id);
      setSubmissionCount(count);

      // Initialize form data
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
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    form?.form_fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateField(field: FormField, value: any): string | null {
    // Required validation
    if (field.required) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return `${field.label} is required`;
      }
    }

    // Skip other validations if empty and not required
    if (!value) return null;

    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (field.type === 'tel') {
      const phoneRegex = /^[0-9+\-() ]+$/;
      if (!phoneRegex.test(value)) {
        return 'Please enter a valid phone number';
      }
    }

    // Number validation
    if (field.type === 'number') {
      if (isNaN(Number(value))) {
        return 'Please enter a valid number';
      }
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form) return;

    // Check if registration is still open
    if (form.registration_deadline) {
      const deadline = new Date(form.registration_deadline);
      if (new Date() > deadline) {
        alert('Registration deadline has passed');
        return;
      }
    }

    // Check if max registrations reached
    if (form.max_registrations && submissionCount >= form.max_registrations) {
      alert('Maximum registrations reached');
      return;
    }

    if (!validateForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    try {
      setSubmitting(true);

      // Get user's IP and user agent (optional)
      const userAgent = navigator.userAgent;

      // Submit to Supabase
      await submitRegistration(form.id, formData, undefined, userAgent);

      // Send to Google Sheets
      await sendToGoogleSheets(form.google_sheet_url, formData, form.form_fields);

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function sendToGoogleSheets(sheetUrl: string, data: Record<string, any>, fields: FormField[]) {
    try {
      // Prepare data object matching field labels (not IDs)
      const sheetData: Record<string, any> = {};
      
      fields.forEach((field) => {
        const value = data[field.id];
        // Use field label as key (matching Google Sheet headers)
        if (Array.isArray(value)) {
          sheetData[field.label] = value.join(', ');
        } else {
          sheetData[field.label] = value || '';
        }
      });

      // Send POST request to Google Apps Script Web App
      const response = await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetData),
      });

      console.log('Data sent to Google Sheets successfully');
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
      // Don't throw error - form submission should still succeed
    }
  }

  function handleFieldChange(fieldId: string, value: any, field: FormField) {
    setFormData({ ...formData, [fieldId]: value });
    
    // Real-time validation
    const error = validateField(field, value);
    setErrors({ ...errors, [fieldId]: error || '' });
  }

  function renderField(field: FormField) {
    const value = formData[field.id];
    const error = errors[field.id];
    const hasError = error && error.trim() !== '';

    const baseInputClass = `w-full px-4 py-3 sm:px-5 sm:py-4 bg-white/5 backdrop-blur-sm border-2 ${
      hasError ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-purple-500'
    } rounded-xl text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all duration-300`;

    switch (field.type) {
      case 'textarea':
        return (
          <>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder={field.placeholder}
              className={baseInputClass}
              rows={4}
              required={field.required}
            />
            {hasError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slideDown">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </>
        );

      case 'select':
        return (
          <>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              className={baseInputClass}
              required={field.required}
            >
              <option value="" className="bg-gray-900">Select an option</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option} className="bg-gray-900">
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slideDown">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </>
        );

      case 'radio':
        return (
          <>
            <div className="space-y-2 sm:space-y-3">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                    className="w-5 h-5 text-purple-600"
                    required={field.required}
                  />
                  <span className="text-white group-hover:text-purple-300 transition-colors">{option}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slideDown">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </>
        );

      case 'checkbox':
        return (
          <>
            <div className="space-y-2 sm:space-y-3">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      const newValue = e.target.checked
                        ? [...currentValue, option]
                        : currentValue.filter((v: string) => v !== option);
                      handleFieldChange(field.id, newValue, field);
                    }}
                    className="w-5 h-5 text-purple-600"
                  />
                  <span className="text-white group-hover:text-purple-300 transition-colors">{option}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slideDown">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </>
        );

      default:
        return (
          <>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder={field.placeholder}
              className={baseInputClass}
              required={field.required}
            />
            {hasError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slideDown">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </>
        );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-600/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-pink-600 animate-spin"></div>
          </div>
          <p className="text-lg sm:text-xl font-semibold animate-pulse">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl sm:text-7xl mb-6 animate-bounce">❌</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Form Not Found</h1>
          <p className="text-gray-300 mb-8">The registration form you're looking for doesn't exist.</p>
          <Link href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!form.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 flex items-center justify-center p-4">
        <div className="text-center text-white px-4 max-w-2xl">
          <div className="text-6xl sm:text-7xl mb-6 animate-pulse">⏸️</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Registration Closed</h1>
          <p className="text-xl sm:text-2xl text-purple-300 mb-4">{form.title}</p>
          <p className="text-gray-300 mb-8">This registration form is currently not accepting responses.</p>
          <Link href="/tournaments" className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
            View Other Tournaments
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 flex items-center justify-center p-4">
        <div className="text-center text-white px-4 max-w-2xl">
          <div className="relative inline-block mb-6">
            <div className="text-7xl sm:text-8xl animate-bounce">✅</div>
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="text-7xl sm:text-8xl">✅</div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Registration Successful!</h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8">Your registration has been submitted successfully. Check your email for confirmation.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tournaments" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
              View Tournaments
            </Link>
            <Link href="/" className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deadlinePassed = form.registration_deadline && new Date() > new Date(form.registration_deadline);
  const maxReached = form.max_registrations && submissionCount >= form.max_registrations;

  // Calculate progress percentage
  const totalFields = form.form_fields.length;
  const filledFields = form.form_fields.filter(field => {
    const value = formData[field.id];
    return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '');
  }).length;
  const progressPercentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back to home button - top left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 hover:scale-105 transition-all shadow-lg">
          <span className="text-lg">←</span>
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>

      <div className="relative z-10 py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Club and Tournament Logos Section */}
          {(form.club_logo_url || form.tournament_logo_url) && (
            <div className="flex justify-center items-center gap-6 sm:gap-8 mb-8 animate-fadeIn">
              {form.club_logo_url && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:scale-110 transition-transform shadow-xl">
                  <img 
                    src={form.club_logo_url} 
                    alt="Club Logo" 
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                </div>
              )}
              {form.tournament_logo_url && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:scale-110 transition-transform shadow-xl">
                  <img 
                    src={form.tournament_logo_url} 
                    alt="Tournament Logo" 
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Header Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-12 mb-8 border border-white/20 shadow-2xl animate-fadeIn">
            <div className="text-center">
              {/* Game Logo - Above Title */}
              {form.game_logo_url ? (
                <div className="flex justify-center mb-6 animate-fadeIn">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-400/40 rounded-2xl p-4 hover:scale-110 transition-transform shadow-2xl">
                    <img 
                      src={form.game_logo_url} 
                      alt="Game Logo" 
                      className="h-20 sm:h-24 w-auto object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                  <span className="text-4xl sm:text-5xl">🎮</span>
                </div>
              )}
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 sm:mb-5 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                {form.title}
              </h1>
              <div className="inline-block mb-5">
                <div className="px-6 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-purple-400/40 rounded-full">
                  <p className="text-xl sm:text-2xl text-purple-300 font-bold">{form.game_name}</p>
                </div>
              </div>
              {form.description && (
                <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">{form.description}</p>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
                {form.max_registrations && (
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative flex items-center gap-3 px-5 sm:px-7 py-3 sm:py-4 bg-purple-600/30 backdrop-blur-sm border border-purple-400/40 rounded-full shadow-lg">
                      <span className="text-2xl sm:text-3xl">👥</span>
                      <div className="text-left">
                        <p className="text-xs text-purple-300 font-medium">Registrations</p>
                        <p className="text-white font-bold text-lg sm:text-xl">{submissionCount} / {form.max_registrations}</p>
                      </div>
                    </div>
                  </div>
                )}
                {form.registration_deadline && (
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative flex items-center gap-3 px-5 sm:px-7 py-3 sm:py-4 bg-pink-600/30 backdrop-blur-sm border border-pink-400/40 rounded-full shadow-lg">
                      <span className="text-2xl sm:text-3xl">⏰</span>
                      <div className="text-left">
                        <p className="text-xs text-pink-300 font-medium">Deadline</p>
                        <p className="text-white font-bold text-lg sm:text-xl">
                          {new Date(form.registration_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form or Status Message */}
          {deadlinePassed ? (
            <div className="bg-red-500/20 backdrop-blur-xl border-2 border-red-500 rounded-3xl p-8 sm:p-12 text-center shadow-2xl animate-fadeIn">
              <div className="text-5xl sm:text-6xl mb-4">⏰</div>
              <p className="text-xl sm:text-2xl text-white font-bold">Registration Deadline Has Passed</p>
              <p className="text-gray-300 mt-3">This registration form is no longer accepting submissions</p>
            </div>
          ) : maxReached ? (
            <div className="bg-yellow-500/20 backdrop-blur-xl border-2 border-yellow-500 rounded-3xl p-8 sm:p-12 text-center shadow-2xl animate-fadeIn">
              <div className="text-5xl sm:text-6xl mb-4">🎯</div>
              <p className="text-xl sm:text-2xl text-white font-bold">Registration Full</p>
              <p className="text-gray-300 mt-3">Maximum registrations reached for this tournament</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/20 shadow-2xl animate-fadeIn">
              {/* Progress Bar */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                    <span>📝</span>
                    <span>Form Progress</span>
                  </span>
                  <span className="text-purple-300 font-bold text-sm sm:text-base">{progressPercentage}%</span>
                </div>
                <div className="relative h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mt-2 text-center">
                  {filledFields} of {totalFields} fields completed
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {form.form_fields.map((field, index) => (
                  <div key={field.id} className="animate-fadeIn group" style={{ animationDelay: `${index * 0.05}s` }}>
                    <label className="block text-white font-bold mb-3 text-base sm:text-lg flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-purple-600/30 border border-purple-400/40 rounded-lg text-sm font-bold">
                        {index + 1}
                      </span>
                      <span>{field.label}</span>
                      {field.required && <span className="text-red-400 ml-1 text-xl">*</span>}
                    </label>
                    {renderField(field)}
                    {field.helpText && !errors[field.id] && (
                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                        <span>💡</span>
                        <span>{field.helpText}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="my-8 sm:my-10 flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <span className="text-gray-400 text-sm">⬇️</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || progressPercentage < 100}
                className="group/btn relative w-full mt-6 px-8 py-5 sm:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg sm:text-xl shadow-2xl transform hover:scale-[1.02] active:scale-95 overflow-hidden"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>
                </div>

                <span className="relative z-10 flex items-center justify-center gap-3">
                  {submitting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting Your Registration...</span>
                    </>
                  ) : progressPercentage < 100 ? (
                    <>
                      <span>⚠️</span>
                      <span>Complete All Required Fields</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">✅</span>
                      <span>Submit Registration</span>
                      <span className="text-2xl group-hover/btn:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </span>
              </button>

              {/* Security & Info */}
              <div className="mt-6 sm:mt-8 space-y-3">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <span className="text-lg">🔒</span>
                  <span>Your information is secure and encrypted</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <span className="text-lg">📧</span>
                  <span>You'll receive a confirmation email shortly</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <span className="text-lg">⏱️</span>
                  <span>Registration takes about {Math.ceil(totalFields / 3)} minutes</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

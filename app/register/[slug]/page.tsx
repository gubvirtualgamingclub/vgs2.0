'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getRegistrationFormBySlug, submitRegistration, getSubmissionCount } from '@/lib/registration-api';
import type { RegistrationForm, FormField } from '@/lib/types/database';
import Link from 'next/link';

const getAnimationDelay = (index: number) => ({
  animationDelay: `${index * 0.05}s`
});

export default function RegistrationPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  function validateForm(): boolean {
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

    if (form.registration_deadline && new Date() > new Date(form.registration_deadline)) {
      alert('Deadline passed');
      return;
    }

    if (form.max_registrations && submissionCount >= form.max_registrations) {
      alert('Full');
      return;
    }

    if (!validateForm()) {
      alert('Fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await submitRegistration(form.id, formData, undefined, navigator.userAgent);
      await sendToGoogleSheets(form.google_sheet_url, formData, form.form_fields);
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed');
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

    const baseInputClass = `w-full px-4 py-3 bg-white/5 border-2 ${
      hasError ? 'border-red-500' : 'border-white/20'
    } rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500`;

    switch (field.type) {
      case 'textarea':
        return (
          <div>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder={field.placeholder}
              className={`${baseInputClass} min-h-32`}
              rows={5}
            />
            {hasError && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              className={baseInputClass}
            >
              <option value="">Select</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option} className="flex gap-3">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                    className="w-5 h-5"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option} className="flex gap-3">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const curr = Array.isArray(value) ? [...value] : [];
                      const newVal = e.target.checked
                        ? [...curr, option]
                        : curr.filter((v) => v !== option);
                      handleFieldChange(field.id, newVal, field);
                    }}
                    className="w-5 h-5"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        );

      default:
        return (
          <div>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder={field.placeholder}
              className={baseInputClass}
            />
            {hasError && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 flex items-center justify-center">
        <p className="text-white">Not found</p>
      </div>
    );
  }

  if (!form.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 flex items-center justify-center">
        <p className="text-white">Closed</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">✅</p>
          <p className="text-2xl text-white font-bold">Success!</p>
        </div>
      </div>
    );
  }

  const deadlinePassed = form.registration_deadline && new Date() > new Date(form.registration_deadline);
  const maxReached = form.max_registrations && submissionCount >= form.max_registrations;
  const totalFields = form.form_fields.length;
  const filledFields = form.form_fields.filter(field => {
    const value = formData[field.id];
    return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '');
  }).length;
  const progressPercentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-pink-900/30">
      <div className="py-12 px-4 max-w-5xl mx-auto">
        {form.hero_image_url && (
          <div className="relative h-64 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img src={form.hero_image_url} alt="Tournament" className="w-full h-full object-cover" />
          </div>
        )}

        {(form.club_logo_url || form.tournament_logo_url || form.game_logo_url) && (
          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            {form.club_logo_url && <img src={form.club_logo_url} alt="Club" className="h-20" />}
            {form.tournament_logo_url && <img src={form.tournament_logo_url} alt="Tournament" className="h-20" />}
            {form.game_logo_url && <img src={form.game_logo_url} alt="Game" className="h-20" />}
          </div>
        )}

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {form.title}
            </h1>
            <p className="text-purple-300 text-xl font-bold mb-4">{form.game_name}</p>
            {form.description && <p className="text-gray-300 max-w-2xl mx-auto mb-6">{form.description}</p>}

            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {form.max_registrations && (
                <div className="flex gap-3 px-6 py-3 bg-purple-600/30 border border-purple-400/40 rounded-full">
                  <span>👥</span>
                  <div>
                    <p className="text-xs text-purple-300">Registrations</p>
                    <p className="text-white font-bold">{submissionCount}/{form.max_registrations}</p>
                  </div>
                </div>
              )}
              {form.registration_deadline && (
                <div className="flex gap-3 px-6 py-3 bg-pink-600/30 border border-pink-400/40 rounded-full">
                  <span>⏰</span>
                  <div>
                    <p className="text-xs text-pink-300">Deadline</p>
                    <p className="text-white font-bold">
                      {new Date(form.registration_deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {deadlinePassed ? (
          <div className="text-center text-white py-12">
            <p className="text-5xl mb-4">⏰</p>
            <p className="text-2xl font-bold">Deadline Passed</p>
          </div>
        ) : maxReached ? (
          <div className="text-center text-white py-12">
            <p className="text-5xl mb-4">🎯</p>
            <p className="text-2xl font-bold">Registration Full</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">Progress</span>
                <span className="text-purple-300">{progressPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              {form.form_fields.map((field, index) => (
                <div key={field.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <label className="block text-white font-bold mb-2 flex gap-2">
                    <span className="w-7 h-7 bg-purple-600/30 border border-purple-400/40 rounded text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span>{field.label}</span>
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting || progressPercentage < 100}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold rounded-2xl disabled:opacity-50 text-lg"
            >
              {submitting ? '⏳' : progressPercentage < 100 ? '⚠️ Complete' : '✅ Submit'}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

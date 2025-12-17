'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getSiteSetting } from '@/lib/supabase-queries';

// Dynamic imports for animations
const ScrollAnimation = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.ScrollAnimation),
  { ssr: false }
);
const ScrollProgressBar = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.ScrollProgressBar),
  { ssr: false }
);
const GamingCursor = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.GamingCursor),
  { ssr: false }
);
const FloatingIcons = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.FloatingIcons),
  { ssr: false }
);

export default function ContactUsPage() {
  const [contactEmail, setContactEmail] = useState<string>('vgs.green.edu@gmail.com');
  const [contactPhone, setContactPhone] = useState<string>('+880 1234-567890');
  const [contactWhatsApp, setContactWhatsApp] = useState<string>('1234567890');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const universityLocation = {
    name: 'Green University of Bangladesh',
    address: 'Purbachal American City, Kanchan, Rupganj, Narayanganj-1461, Dhaka, Bangladesh',
    latitude: 23.829548,
    longitude: 90.566360,
  };

  // Fetch contact information
  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const [email, phone, whatsapp] = await Promise.all([
          getSiteSetting('contact_email'),
          getSiteSetting('contact_phone'),
          getSiteSetting('contact_whatsapp'),
        ]);

        if (email?.setting_value) setContactEmail(email.setting_value);
        if (phone?.setting_value) setContactPhone(phone.setting_value);
        if (whatsapp?.setting_value) setContactWhatsApp(whatsapp.setting_value);
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      // Send email via mailto (client-side)
      const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(
        `${formData.subject} - From: ${formData.name}`
      )}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;

      window.location.href = mailtoLink;
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      value: contactEmail,
      href: `mailto:${contactEmail}`,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Phone',
      value: contactPhone,
      href: `tel:${contactPhone.replace(/[^0-9+]/g, '')}`,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      title: 'WhatsApp',
      value: contactWhatsApp,
      href: `https://wa.me/${contactWhatsApp}`,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b] text-gray-900 dark:text-white selection:bg-purple-500/30 selection:text-purple-200">
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <ScrollAnimation animation="slideUp" delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">24/7 Support</span>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="gameOver" delay={200}>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 dark:from-white via-gray-600 dark:via-gray-200 to-gray-400 dark:to-gray-500">
                Get In
              </span>{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient-x">
                Touch
              </span>
            </h1>
          </ScrollAnimation>

          <ScrollAnimation animation="fadeIn" delay={400}>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Have questions, partnership ideas, or just want to say hi? We'd love to hear from you.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Methods Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                {contactMethods.map((method, index) => (
                    <ScrollAnimation key={index} animation="slideLeft" delay={index * 100}>
                        <a
                            href={method.href}
                            target={method.title === 'WhatsApp' ? '_blank' : undefined}
                            rel={method.title === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                            className={`group flex items-center gap-5 p-6 rounded-2xl bg-gray-100 dark:bg-[#0f0f10]/80 backdrop-blur-sm border ${method.border} hover:border-opacity-50 transition-all duration-300 hover:-translate-x-2 hover:shadow-lg`}
                        >
                            <div className={`w-14 h-14 rounded-xl ${method.bg} flex items-center justify-center ${method.color} shadow-lg group-hover:scale-110 transition-transform`}>
                                {method.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">{method.title}</h3>
                                <p className={`font-mono text-lg font-bold text-gray-900 dark:text-white group-hover:${method.color} transition-colors`}>{method.value}</p>
                            </div>
                        </a>
                    </ScrollAnimation>
                ))}

                {/* Location Card */}
                <ScrollAnimation animation="slideLeft" delay={400}>
                    <div className="p-6 rounded-2xl bg-[#0f0f10]/80 backdrop-blur-sm border border-white/5 space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                            <span className="text-orange-500">📍</span> Visit Campus
                        </h3>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                {universityLocation.name}
                            </p>
                            <p className="text-white/80 font-medium leading-relaxed border-l-2 border-purple-500 pl-3">
                                {universityLocation.address}
                            </p>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>

            {/* Contact Form & Map */}
            <div className="lg:col-span-2 space-y-8">
                <ScrollAnimation animation="slideUp" delay={200}>
                    <div className="rounded-3xl bg-[#0f0f10] border border-white/5 p-8 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
                        
                        <h2 className="text-3xl font-bold text-white mb-8 relative z-10">Send a Message</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all font-medium"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all font-medium"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all font-medium"
                                    placeholder="Partnership Inquiry / General Question"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all font-medium resize-none"
                                    placeholder="How can we help you level up?"
                                />
                            </div>

                            {/* Status Messages */}
                            {submitStatus === 'success' && (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium flex items-center gap-2 animate-fadeIn">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Opening your email client...
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2 animate-fadeIn">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Something went wrong. Please try again.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitStatus === 'loading'}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10"
                            >
                                {submitStatus === 'loading' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Send Transmission</span>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-4m6 4l6-4" /></svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </ScrollAnimation>

                {/* Map Section */}
                <ScrollAnimation animation="slideUp" delay={300}>
                    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/5 relative bg-[#0f0f10]">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.827940632145!2d${universityLocation.longitude}!3d${universityLocation.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c2a8c8c8c8c1%3A0x0!2sGreen%20University%20of%20Bangladesh!5e0!3m2!1sen!2sbd!4v$(Date.now())`}
                            className="opacity-100 hover:opacity-100 transition-opacity duration-700"
                        ></iframe>
                    </div>
                </ScrollAnimation>
            </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-24 pt-12 border-t border-white/5">
            <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">Common Queries</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                    { q: 'What is the best way to contact VGS?', a: 'Email queries are preferred for formal issues. For quick questions, hit us up on WhatsApp or socials.' },
                    { q: 'Response times?', a: 'We patrol the comms channels daily. Expect a ping back within 24 hours.' },
                    { q: 'Campus visits?', a: 'Permission required. Contact our admin team to secure a visitor pass.' },
                    { q: 'Partnerships?', a: 'We are always scouting for allies. Use the form above to propose an alliance.' }
                ].map((faq, i) => (
                    <ScrollAnimation key={i} animation="fadeIn" delay={i * 100}>
                        <div className="bg-[#0f0f10] border border-white/5 p-6 rounded-2xl hover:border-purple-500/30 transition-colors">
                            <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    </ScrollAnimation>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}

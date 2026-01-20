'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Certificate } from '@/lib/types/database';
import Link from 'next/link';
import { PlusIcon, ArrowDownTrayIcon, EnvelopeIcon, MagnifyingGlassIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { pdf } from '@react-pdf/renderer';
import CertificatePDF from '@/components/certificates/CertificatePDF';
import QRCode from 'qrcode';

// Dynamically import to avoid server-side issues with PDF generation if any
// Though @react-pdf/renderer works in client components.

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Action States
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [page, search]);

  async function fetchCertificates() {
    setLoading(true);
    let query = supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) {
      query = query.ilike('recipient_name', `%${search}%`);
    }

    const { data, error } = await query;
    if (data) setCertificates(data);
    setLoading(false);
  }

  // Helper to generate PDF Blob
  async function generatePdfBlob(cert: Certificate) {
      // 1. Generate QR Code Data URL
      // The verification URL: [Origin]/verify/[id]
      const origin = window.location.origin;
      const verifyUrl = `${origin}/verify/${cert.verification_code || cert.id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

      // 2. Render PDF to Blob
      const blob = await pdf(
          <CertificatePDF
              recipientName={cert.recipient_name}
              certificateType={cert.certificate_type}
              eventName={cert.event_name}
              issueDate={cert.issue_date}
              role={cert.role}
              verificationId={cert.verification_code || cert.id}
              qrCodeUrl={qrCodeDataUrl}
              signature1Url={cert.metadata?.signature1_url}
              signature1Name={cert.metadata?.signature1_name}
              signature1Title={cert.metadata?.signature1_title}
              signature2Url={cert.metadata?.signature2_url}
              signature2Name={cert.metadata?.signature2_name}
              signature2Title={cert.metadata?.signature2_title}
              description={cert.metadata?.description}
          />
      ).toBlob();

      return blob;
  }

  async function handleDownload(cert: Certificate) {
      setProcessingId(cert.id);
      try {
          const blob = await generatePdfBlob(cert);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${cert.recipient_name}-${cert.event_name}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (e) {
          console.error(e);
          alert('Failed to generate PDF');
      } finally {
          setProcessingId(null);
      }
  }

  async function handleEmail(cert: Certificate) {
      if (!cert.recipient_email) {
          alert('No email address for this recipient.');
          return;
      }
      if (!confirm(`Send certificate to ${cert.recipient_email}?`)) return;

      setProcessingId(cert.id);
      try {
          const blob = await generatePdfBlob(cert);

          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
              const base64data = reader.result; // Data URL

              const res = await fetch('/api/emails/send-certificate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      recipientEmail: cert.recipient_email,
                      recipientName: cert.recipient_name,
                      eventName: cert.event_name,
                      pdfBase64: base64data
                  })
              });

              if (res.ok) alert('Email sent successfully!');
              else alert('Failed to send email.');
              setProcessingId(null);
          };
      } catch (e) {
          console.error(e);
          alert('Error sending email');
          setProcessingId(null);
      }
  }

  async function handleDelete(id: string) {
      if (!confirm('Are you sure you want to delete this certificate?')) return;
      await supabase.from('certificates').delete().eq('id', id);
      fetchCertificates();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Certificates</h1>
                    <p className="text-gray-400">Manage and issue certificates</p>
                </div>
                <Link href="/admin/certificates/generate" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Issue New
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by recipient name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:border-indigo-500 outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 border-b border-gray-700">
                        <tr>
                            <th className="p-4 text-gray-400 font-medium text-sm">Recipient</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Event / Date</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Type</th>
                            <th className="p-4 text-gray-400 font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : certificates.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No certificates found.</td></tr>
                        ) : (
                            certificates.map(cert => (
                                <tr key={cert.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{cert.recipient_name}</div>
                                        <div className="text-sm text-gray-500">{cert.recipient_email || 'No Email'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-300">{cert.event_name}</div>
                                        <div className="text-sm text-gray-500">{cert.issue_date}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${cert.certificate_type === 'appreciation' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                                            {cert.certificate_type}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleDownload(cert)}
                                            disabled={processingId === cert.id}
                                            className="p-2 hover:bg-gray-600 rounded text-gray-300 hover:text-white disabled:opacity-50"
                                            title="Download PDF"
                                        >
                                            {processingId === cert.id ? <span className="animate-spin">⏳</span> : <ArrowDownTrayIcon className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleEmail(cert)}
                                            disabled={processingId === cert.id || !cert.recipient_email}
                                            className="p-2 hover:bg-gray-600 rounded text-gray-300 hover:text-white disabled:opacity-50"
                                            title="Email Certificate"
                                        >
                                            <EnvelopeIcon className="w-5 h-5" />
                                        </button>
                                        <Link href={`/verify/${cert.verification_code || cert.id}`} target="_blank" className="p-2 hover:bg-gray-600 rounded text-gray-300 hover:text-white" title="View Public Page">
                                            <EyeIcon className="w-5 h-5" />
                                        </Link>
                                        <button onClick={() => handleDelete(cert.id)} className="p-2 hover:bg-red-900/50 rounded text-gray-500 hover:text-red-400">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between items-center">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700 disabled:opacity-50">Previous</button>
                <span className="text-gray-500 text-sm">Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={certificates.length < pageSize} className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700 disabled:opacity-50">Next</button>
            </div>
        </div>
    </div>
  );
}

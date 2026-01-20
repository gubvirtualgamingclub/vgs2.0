'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Certificate } from '@/lib/types/database';
import CertificatePreview from '@/components/certificates/CertificatePreview';
import QRCode from 'qrcode';
import { CheckBadgeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function VerificationPageClient({ id }: { id: string }) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    async function fetchCert() {
      // Try to find by verification_code or id
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .or(`id.eq.${id},verification_code.eq.${id}`)
        .single();

      if (error || !data) {
        setError('Certificate not found or invalid ID.');
      } else {
        setCert(data);
        // Generate QR for preview
        const url = `${window.location.origin}/verify/${data.verification_code || data.id}`;
        QRCode.toDataURL(url).then(setQrCodeUrl);
      }
      setLoading(false);
    }
    fetchCert();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">Verifying...</div>;
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
         <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mb-4" />
         <h1 className="text-3xl font-bold text-gray-800 mb-2">Verification Failed</h1>
         <p className="text-gray-600 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Verification Badge */}
        <div className="bg-green-600 text-white p-4 rounded-xl shadow-lg mb-8 flex items-center gap-4 animate-fade-in-down">
           <CheckBadgeIcon className="w-12 h-12" />
           <div>
              <h1 className="text-2xl font-bold">Official Certificate</h1>
              <p className="opacity-90">This certificate was issued by Green University Computer Club and is valid.</p>
           </div>
        </div>

        {/* Certificate Display */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden md:p-8 flex justify-center">
            {/*
               We wrap the preview in a container that allows scrolling or scaling
               since the preview is fixed size (A4).
               We use a transform scale approach for responsiveness.
            */}
            <div className="relative w-full overflow-x-auto md:overflow-visible flex justify-center">
                <div className="origin-top transform scale-[0.5] md:scale-[0.7] lg:scale-[0.9] xl:scale-100 transition-transform">
                   {/* We need a wrapper div with fixed size because scale doesn't affect flow layout size */}
                   <div style={{ width: '1123px', height: '794px' }}>
                      <CertificatePreview
                          recipientName={cert.recipient_name}
                          certificateType={cert.certificate_type}
                          eventName={cert.event_name}
                          issueDate={cert.issue_date}
                          role={cert.role}
                          verificationId={cert.verification_code || cert.id}
                          qrCodeUrl={qrCodeUrl}
                          signature1Url={cert.metadata?.signature1_url}
                          signature1Name={cert.metadata?.signature1_name}
                          signature1Title={cert.metadata?.signature1_title}
                          signature2Url={cert.metadata?.signature2_url}
                          signature2Name={cert.metadata?.signature2_name}
                          signature2Title={cert.metadata?.signature2_title}
                          description={cert.metadata?.description}
                      />
                   </div>
                </div>
            </div>
        </div>

        {/* Metadata Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
           <p>Certificate ID: {cert.verification_code || cert.id}</p>
           <p>Issued on: {new Date(cert.issue_date).toLocaleDateString()}</p>
        </div>

      </div>
    </div>
  );
}

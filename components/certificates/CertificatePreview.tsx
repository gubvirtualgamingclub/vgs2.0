import React from 'react';
import Image from 'next/image';

interface CertificatePreviewProps {
  recipientName: string;
  certificateType: 'appreciation' | 'participation' | string;
  eventName: string;
  issueDate: string;
  role?: string;
  verificationId: string;
  qrCodeUrl?: string; // Data URL or Image URL
  signature1Url?: string;
  signature1Name?: string;
  signature1Title?: string;
  signature2Url?: string;
  signature2Name?: string;
  signature2Title?: string;
  description?: string;
  scale?: number; // For scaling down in previews
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  recipientName,
  certificateType,
  eventName,
  issueDate,
  role,
  verificationId,
  qrCodeUrl,
  signature1Url,
  signature1Name = 'Authorized Signature',
  signature1Title = 'Organizer',
  signature2Url,
  signature2Name = 'Authorized Signature',
  signature2Title = 'Faculty Advisor',
  description,
  scale = 1
}) => {
  const title = certificateType.toLowerCase().includes('appreciation')
    ? 'Certificate of Appreciation'
    : 'Certificate of Participation';

  const defaultDescription = certificateType.toLowerCase().includes('appreciation')
    ? `In recognition of their outstanding contribution and dedication as ${role ? role : 'a volunteer'} during`
    : `This certifies that they have successfully participated in`;

  const finalDescription = description || defaultDescription;

  // A4 Landscape Aspect Ratio is approx 1.414 (297mm x 210mm)
  // We use Tailwind arbitrary values to simulate the look

  return (
    <div
      className="bg-white text-black shadow-2xl relative overflow-hidden origin-top-left select-none"
      style={{
        width: '1123px', // A4 Landscape width at 96 DPI
        height: '794px', // A4 Landscape height at 96 DPI
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
    >
      <div className="w-full h-full p-12 flex flex-col">
        <div className="flex-1 border-4 border-indigo-600 p-8 relative flex flex-col">

          {/* Header */}
          <div className="flex justify-between items-center mb-12">
             <div className="w-24 h-24 relative">
                 <Image src="/logos/GUB-New.png" alt="GUB Logo" fill className="object-contain" />
             </div>
             <div className="text-center flex-1">
                 <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Green University Computer Club</h2>
                 <p className="text-gray-500 text-sm tracking-[0.2em] mt-2 uppercase">Since 2012 • Excellence in Technology</p>
             </div>
             <div className="w-24 h-24 relative">
                 <Image src="/logos/vgs.png" alt="VGS Logo" fill className="object-contain" />
             </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-indigo-600 mb-6 uppercase tracking-wider font-serif">
               {title}
            </h1>
            <p className="text-gray-600 text-lg uppercase tracking-widest mb-4">Is Proudly Presented To</p>
            <div className="inline-block relative px-12 pb-2">
                 <p className="text-5xl font-bold text-gray-900 font-serif italic z-10 relative">
                    {recipientName}
                 </p>
                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
            </div>
          </div>

          {/* Body */}
          <div className="text-center px-16 mb-16">
             <p className="text-xl leading-relaxed text-gray-700">
                {finalDescription} <span className="font-bold text-indigo-700">{eventName}</span>.
             </p>
             <p className="text-xl leading-relaxed text-gray-700 mt-4">
                Given on this day, <span className="font-bold text-indigo-700">{issueDate}</span>.
             </p>
          </div>

          {/* Footer / Signatures */}
          <div className="mt-auto pt-8 flex justify-between items-end pb-4">
             {/* Sig 1 */}
             <div className="flex flex-col items-center w-48">
                 <div className="h-16 w-full flex items-end justify-center mb-2 relative">
                     {signature1Url && (
                        <div className="relative w-32 h-16">
                             <Image src={signature1Url} alt="Sig" fill className="object-contain" />
                        </div>
                     )}
                 </div>
                 <div className="w-full h-px bg-gray-400 mb-2"></div>
                 <p className="font-bold text-gray-800 text-sm">{signature1Name}</p>
                 <p className="text-xs text-gray-500 uppercase">{signature1Title}</p>
             </div>

             {/* QR Code */}
             <div className="flex flex-col items-center">
                 <div className="w-20 h-20 bg-white p-1 border border-gray-200 mb-2 relative">
                    {qrCodeUrl ? (
                         // If it's a data URL, Next.js Image handles it.
                         <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">QR</div>
                    )}
                 </div>
                 <p className="text-[10px] text-gray-400 uppercase tracking-wider">Scan to Verify</p>
                 <p className="text-[10px] text-gray-400 font-mono mt-0.5">{verificationId}</p>
             </div>

             {/* Sig 2 */}
             <div className="flex flex-col items-center w-48">
                 <div className="h-16 w-full flex items-end justify-center mb-2 relative">
                     {signature2Url && (
                        <div className="relative w-32 h-16">
                             <Image src={signature2Url} alt="Sig" fill className="object-contain" />
                        </div>
                     )}
                 </div>
                 <div className="w-full h-px bg-gray-400 mb-2"></div>
                 <p className="font-bold text-gray-800 text-sm">{signature2Name}</p>
                 <p className="text-xs text-gray-500 uppercase">{signature2Title}</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;

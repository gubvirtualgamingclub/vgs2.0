import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed (optional, using default Helvetica for now to be safe)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  border: {
    border: '4px solid #4F46E5', // Indigo-600
    flex: 1,
    padding: 30,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  headerText: {
    textAlign: 'center',
    flex: 1,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // Gray-800
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 10,
    color: '#6B7280', // Gray-500
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: 30,
  },
  certificateTitle: {
    fontSize: 36,
    fontWeight: 'heavy', // Bold
    color: '#4F46E5',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  presentedTo: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 10,
  },
  recipientName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 5,
    marginHorizontal: 40,
    textAlign: 'center',
  },
  bodySection: {
    marginTop: 20,
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 10,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
    paddingTop: 20,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 150,
  },
  signatureImage: {
    height: 40,
    marginBottom: 5,
    objectFit: 'contain',
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#9CA3AF',
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  signatureTitle: {
    fontSize: 8,
    color: '#6B7280',
  },
  verificationSection: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  verificationText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  idText: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 2,
  }
});

interface CertificatePDFProps {
  recipientName: string;
  certificateType: 'appreciation' | 'participation' | string;
  eventName: string;
  issueDate: string;
  role?: string;
  verificationId: string;
  qrCodeUrl: string; // Data URL
  signature1Url?: string;
  signature1Name?: string;
  signature1Title?: string;
  signature2Url?: string;
  signature2Name?: string;
  signature2Title?: string;
  description?: string; // Optional override
}

const CertificatePDF: React.FC<CertificatePDFProps> = ({
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
  description
}) => {
  // Determine title based on type
  const title = certificateType.toLowerCase().includes('appreciation')
    ? 'Certificate of Appreciation'
    : 'Certificate of Participation';

  const defaultDescription = certificateType.toLowerCase().includes('appreciation')
    ? `In recognition of their outstanding contribution and dedication as ${role ? role : 'a volunteer'} during`
    : `This certifies that they have successfully participated in`;

  const finalDescription = description || defaultDescription;

  // Use absolute URL for logo in PDF generation environment or verify if relative works.
  // In React-PDF client-side, relative usually works if served from public.
  // We'll try using the window.location.origin if available, or just the path.
  // Note: For SSR/Server-side generation, full URL is safer.
  // We will assume this component is used in a context where public assets are accessible.

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          {/* Header */}
          <View style={styles.header}>
             {/* Left Logo - GUB */}
             {/* Note: React-PDF requires valid URLs or base64. Paths starting with / might fail in Node context. */}
            <Image src="/logos/GUB-New.png" style={styles.logo} />

            <View style={styles.headerText}>
              <Text style={styles.clubName}>Green University Computer Club</Text>
              <Text style={styles.subHeader}>Since 2012 • Excellence in Technology</Text>
            </View>

            {/* Right Logo - VGS */}
            <Image src="/logos/vgs.png" style={styles.logo} />
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.certificateTitle}>{title}</Text>
            <Text style={styles.presentedTo}>IS PROUDLY PRESENTED TO</Text>
            <Text style={styles.recipientName}>{recipientName}</Text>
          </View>

          {/* Body */}
          <View style={styles.bodySection}>
            <Text style={styles.bodyText}>
              {finalDescription} <Text style={styles.highlight}>{eventName}</Text>.
            </Text>
            <Text style={styles.bodyText}>
              Given on this day, <Text style={styles.highlight}>{issueDate}</Text>.
            </Text>
          </View>

          {/* Footer - Signatures */}
          <View style={styles.footer}>
            {/* Signature 1 */}
            <View style={styles.signatureBlock}>
              {signature1Url && <Image src={signature1Url} style={styles.signatureImage} />}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{signature1Name}</Text>
              <Text style={styles.signatureTitle}>{signature1Title}</Text>
            </View>

            {/* QR Code Center Bottom */}
            <View style={{ alignItems: 'center' }}>
               {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
               <Text style={styles.verificationText}>Scan to Verify</Text>
               <Text style={styles.idText}>ID: {verificationId}</Text>
            </View>

            {/* Signature 2 */}
            <View style={styles.signatureBlock}>
              {signature2Url && <Image src={signature2Url} style={styles.signatureImage} />}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{signature2Name}</Text>
              <Text style={styles.signatureTitle}>{signature2Title}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CertificatePDF;

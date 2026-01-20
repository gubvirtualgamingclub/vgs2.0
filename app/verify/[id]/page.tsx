import VerificationPageClient from './VerificationPageClient';

export default function Page({ params }: { params: { id: string } }) {
  return <VerificationPageClient id={params.id} />;
}

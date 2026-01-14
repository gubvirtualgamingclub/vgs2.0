import { NextResponse } from 'next/server';

export async function GET() {
  // Only expose Public keys
  // Service ID is needed for both, Public Key for client-side sending
  return NextResponse.json({
    serviceId: process.env.EMAILJS_SERVICE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
  });
}

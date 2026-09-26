import { NextResponse } from 'next/server';

// For Facebook to verify your webhook
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// When customer replies
export async function POST(req) {
  const body = await req.json();
  console.log('Incoming WhatsApp:', JSON.stringify(body, null, 2));
  return NextResponse.json({ status: 'ok' });
}
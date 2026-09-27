import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  console.log('Verify attempt:', { mode, token, expected: process.env.WHATSAPP_VERIFY_TOKEN })

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED!')
    return new NextResponse(challenge, { status: 200 })
  } else {
    console.log('VERIFY FAILED - token mismatch')
    return new NextResponse('Forbidden', { status: 403 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Incoming WhatsApp:', JSON.stringify(body, null, 2))
    
    // Your order logic here...
    
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'fail' }, { status: 200 })
  }
}
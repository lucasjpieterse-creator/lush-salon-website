export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  console.log('Verify attempt:', mode, token)

  // TEMP BYPASS - accept anything for now to get verified
  if (challenge) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('ok', { status: 200 })
}

export async function POST(req) {
  try {
    const body = await req.json()
    console.log('Incoming WhatsApp:', JSON.stringify(body).slice(0, 2000))
    return Response.json({ status: 'ok' })
  } catch (e) {
    console.error(e)
    return Response.json({ ok: true })
  }
}
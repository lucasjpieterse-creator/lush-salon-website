export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('hub.mode') === 'subscribe' && searchParams.get('hub.verify_token') === process.env.VERIFY_TOKEN) {
    return new Response(searchParams.get('hub.challenge'), { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Incoming WhatsApp:', JSON.stringify(body));

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body?.toLowerCase() || '';

    if (!from ||!message) {
      return new Response('OK', { status: 200 });
    }

    // Your chicken logic
    let reply = `Hi! Send "I want X chickens" e.g. "I want 2 chickens"`;

    const match = text.match(/(\d+)\s*chicken/);
    if (match) {
      const qty = parseInt(match[1]);
      const price = 120; // R120 each - change to your price
      reply = `Hi Lucas! Your ${qty} chickens = R${qty * price}. Delivery? Reply YES to confirm.`;
    } else if (text.includes('yes')) {
      reply = `Perfect! Order confirmed for ${from}. We will deliver to Secunda. Cash on delivery.`;
    }

    // SEND REPLY - This is what was missing before
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1464228660115976';

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: reply }
      })
    });

    const result = await res.json();
    console.log('Send result:', result);

    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('OK', { status: 200 });
  }
}
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const VERIFY = process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN;
  if (mode === 'subscribe' && token === VERIFY) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Incoming WhatsApp:', JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) return new Response('OK', { status: 200 });

    const from = message.from;
    const text = (message.text?.body || '').toLowerCase();
    const phoneId = value.metadata.phone_number_id;

    let replyText = '';
    if (text.includes('chicken')) {
      const m = text.match(/(\d+)/);
      const num = m? m[1] : '2';
      replyText = `🐔 Got it! ${num} chickens - R180.\n\n1. Confirm delivery to Secunda?\n2. Pay with Paystack?\n\nReply YES to confirm!`;
    } else if (text.includes('yes') || text.includes('confirm')) {
      replyText = `✅ Order confirmed! 2 chickens on the way! Pay here: https://paystack.link...\nOrder #${Math.floor(Math.random()*90000)+10000}`;
    } else {
      replyText = `Hi! Welcome to HustleHub Secunda 🐓\n\nTell me: "i want 2 chickens" and I'll take your order!`;
    }

    const TOKEN = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: replyText }
      })
    });

    const result = await res.json();
    console.log('Send result:', JSON.stringify(result));

    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('OK', { status: 200 });
  }
}
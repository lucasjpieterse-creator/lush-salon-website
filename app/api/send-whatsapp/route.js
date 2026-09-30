export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { to, service, price, business } = await req.json();
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      return Response.json({ error: 'Missing WHATSAPP_TOKEN or PHONE_ID in Vercel ENV' }, { status: 500 });
    }

    let cleanTo = to.replace(/\D/g, '');
    if (cleanTo.startsWith('0')) cleanTo = '27' + cleanTo.substring(1);

    const msg = `✅ HustleHub - Booking Confirmed

Business: ${business}
Service: ${service}
Price: R${price}

See you soon in Secunda!
Reply YES to confirm.`;

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanTo,
        type: 'text',
        text: { body: msg }
      })
    });

    const data = await res.json();
    console.log('WhatsApp result:', data);
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
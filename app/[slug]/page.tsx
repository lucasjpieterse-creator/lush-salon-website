export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Incoming send-whatsapp body:', body);

    const to = body.to;
    const service = body.service || 'Service';
    const price = body.price || 0;
    const business = body.business || 'Business';

    if (!to) {
      console.error('Missing "to" number');
      return Response.json({ error: 'Missing to number' }, { status: 400 });
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!token || !phoneId) {
      return Response.json({ error: 'Missing ENV vars' }, { status: 500 });
    }

    // Safe clean
    let cleanTo = String(to).replace(/\D/g, '');
    if (cleanTo.startsWith('0')) cleanTo = '27' + cleanTo.substring(1);
    if (!cleanTo.startsWith('27') && cleanTo.length <= 10) {
       cleanTo = '27' + cleanTo;
    }

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
    console.error('SEND ERROR', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
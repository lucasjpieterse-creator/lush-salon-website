export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { to, service, price, business } = await req.json();
  
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.log("Missing ENV");
    return Response.json({ error: "Missing WHATSAPP_TOKEN or PHONE_ID" }, { status: 500 });
  }

  // Clean number: 0821234567 -> 27821234567
  let cleanTo = to.replace(/\D/g,'');
  if (cleanTo.startsWith('0')) cleanTo = '27' + cleanTo.substring(1);

  const message = `✅ HustleHub Booking Confirmed

Business: ${business}
Service: ${service}
Price: R${price}

See you soon in Secunda! 
Reply YES to confirm.`;

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: cleanTo,
      type: 'text',
      text: { body: message }
    })
  });

  const data = await res.json();
  console.log('WhatsApp send result:', data);
  return Response.json(data);
}
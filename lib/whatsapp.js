export async function sendWhatsApp(to, message) {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace('+','').replace(' ',''),
      type: 'text',
      text: { body: message }
    })
  });
  
  const data = await res.json();
  console.log('WhatsApp sent:', data);
  return data;
}
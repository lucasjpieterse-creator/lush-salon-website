/**
 * Clean phone number to ensure pure numeric international format
 * Example: "+27 65 075 3499" -> "27650753499"
 */
function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Send a custom text WhatsApp message via Meta Cloud API
 */
export async function sendWhatsApp(to, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('WhatsApp API Error: Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN environment variables');
    return { error: 'Missing environment variables' };
  }

  const cleanTo = sanitizePhoneNumber(to);
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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

    if (!res.ok) {
      console.error('WhatsApp API Error Response:', data);
    } else {
      console.log('WhatsApp sent successfully:', data);
    }

    return data;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return { error };
  }
}
import { createClient } from '@supabase/supabase-js';

// Initialize your free Supabase client using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for server automations
);

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Supabase Webhooks send data nested inside 'record' (new data) and 'old_record' (prior state)
    const { record, old_record, type } = body; 
    
    const WHATSAPP_TOKEN = process.env.WHATSAPP_SYSTEM_USER_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    // FIXED: Corrected the Meta Graph API URL endpoint structure
    const metaUrl = `https://facebook.com{PHONE_NUMBER_ID}/messages`;

    // ─── FLOW 1: NEW BOOKING REQUEST (SENT TO OWNER) ───
    if (type === 'INSERT') {
      // 1. Fetch the owner's actual phone number using the business_id from the new booking row
      const { data: businessProfile, error: dbError } = await supabase
        .from('business_profiles')
        .select('owner_whatsapp_phone')
        .eq('business_id', record.business_id)
        .single();

      if (dbError || !businessProfile) {
        console.error('Could not locate owner phone number:', dbError);
        return new Response('Owner phone mapping error', { status: 404 });
      }

      // SANITIZATION: Clean the owner's phone number for Meta
      let ownerNumber = businessProfile.owner_whatsapp_phone.replace(/\D/g, '');
      if (ownerNumber.startsWith('0')) {
        ownerNumber = '27' + ownerNumber.substring(1);
      }

      // 2. Format the message for the Business Owner
      const ownerPayload = {
        messaging_product: "whatsapp",
        to: ownerNumber, // <-- TARGETS THE SANITIZED OWNER'S NUMBER ONLY
        type: "text",
        text: {
          body: `⚡ NEW BOOKING REQUEST via TeksBook!\n\n🏢 Service Provider: ${record.business_name || 'N/A'}\n👤 Client: ${record.client_name || record.customer_name}\n📱 Contact: ${record.client_phone || record.customer_phone}\n📅 Date: ${record.booking_date}\n🕒 Time: ${record.booking_time}\n🛠️ Selected Services: ${record.service_name}\n💰 Total Price: R${record.total_price || record.price}\n\nNotes: ${record.notes || record.client_notes || 'None'}`
        }
      };

      // 3. Dispatch to Meta
      await fetch(metaUrl, {
        method: "POST",
        headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(ownerPayload)
      });
    }

    // ─── FLOW 2: CONFIRMATION NOTIFICATION (SENT TO CLIENT) ───
    if (type === 'UPDATE' && old_record.status !== 'confirmed' && record.status === 'confirmed') {
      
      let clientNumber = record.client_phone || record.customer_phone;

      if (!clientNumber) {
        return new Response('No client phone string discovered', { status: 400 });
      }

      // SANITIZATION: Automatically convert standard local numbers (072...) to Meta's format (2772...)
      clientNumber = clientNumber.replace(/\D/g, ''); // Remove spaces, symbols, and plus signs
      if (clientNumber.startsWith('0')) {
        clientNumber = '27' + clientNumber.substring(1); // Strip 0 and prepend country code
      }

      // Format the message for the Client
      const clientPayload = {
        messaging_product: "whatsapp",
        to: clientNumber, // <-- TARGETS THE SANITIZED CLIENT'S DEVICE ONLY
        type: "text",
        text: {
          body: `Hi ${record.client_name || record.customer_name}! ⚡ Your booking for "${record.service_name}" on ${record.booking_date} at ${record.booking_time} with ${record.business_name} is CONFIRMED! See you then.`
        }
      };

      // Dispatch to Meta
      await fetch(metaUrl, {
        method: "POST",
        headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(clientPayload)
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Global Webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

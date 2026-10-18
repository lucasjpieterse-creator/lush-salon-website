import { sendWhatsApp } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const { to, clientName, message } = await req.json();

    if (!to) {
      return Response.json({ error: "Missing phone number ('to')" }, { status: 400 });
    }

    // Determine message text (supports custom message or default fallback)
    const textToSend = message || `Hi ${clientName || 'Valued Client'} 👋, your booking on TekSBook has been confirmed!`;

    // Send via our unified WhatsApp helper
    const result = await sendWhatsApp(to, textToSend);

    console.log("WhatsApp route result:", result);
    return Response.json(result);
  } catch (e) {
    console.error("WhatsApp route error:", e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
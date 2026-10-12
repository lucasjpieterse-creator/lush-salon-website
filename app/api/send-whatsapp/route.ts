export async function POST(req: Request) {
  try {
    const { to, clientName, bookingDate } = await req.json();
    if (!to) return Response.json({ error: "no number" }, { status: 400 });

    const cleanTo = to.toString().replace(/\D/g, '').replace(/^0/, '27');

    const payload = {
      messaging_product: "whatsapp",
      to: cleanTo,
      type: "template",
      template: {
        name: "booking_notification",
        language: { code: "en_US" },
        // Add components if your template has variables like {{1}}, {{2}}
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: clientName || "Valued Customer" },
              { type: "text", text: bookingDate || "your scheduled time" }
            ]
          }
        ]
      }
    };

    const res = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    console.log("WhatsApp API Response:", result);
    return Response.json(result);
  } catch (e) {
    console.error(e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
export async function POST(req) {
  try {
    const { to } = await req.json();
    if (!to) return Response.json({ error: "no number" }, { status: 400 });

    const cleanTo = to.toString().replace(/\D/g, '').replace(/^0/, '27');

    const res = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanTo,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" }
        }
      })
    });

    const result = await res.json();
    console.log("WhatsApp result:", result);
    return Response.json(result);
  } catch (e) {
    console.error(e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
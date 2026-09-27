require('dotenv').config({ path: '.env.local' });

async function testWhatsApp() {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "27725023999",
      type: "text",
      text: { 
        body: "HustleHub: Thanks John! Order #1234 R250 paid. Driver on the way!" 
      }
    })
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  
  if(data.messages) console.log("RECEIPT SENT! Check WhatsApp");
  else console.log("Failed:", data.error);
}

testWhatsApp();
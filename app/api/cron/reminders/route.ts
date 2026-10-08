import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret")!== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: bookings } = await supabase
   .from("bookings")
   .select("*, businesses(name, slug)")
   .in("booking_date", [todayStr, tomorrowStr])
   .eq("status", "confirmed");

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  let sent = 0;
  let skipped = 0;

  for (const b of bookings || []) {
    if (!b.client_phone) continue;
    const clean = b.client_phone.replace(/\D/g, "");
    const isTomorrow = b.booking_date === tomorrowStr;

    // ANTI-DUPLICATE CHECK
    if (isTomorrow && b.reminder_1day_sent) { skipped++; continue; }
    if (!isTomorrow && b.reminder_today_sent) { skipped++; continue; }

    const message = isTomorrow
     ? `⏰ Hi ${b.client_name || ''}! Reminder: Tomorrow ${b.booking_date} at ${b.booking_time} you have ${b.service_name} at ${b.businesses.name}. Confirm here: ${siteUrl}/confirm/${b.id}`
      : `📍 Hi ${b.client_name || ''}! TODAY at ${b.booking_time} you have ${b.service_name} at ${b.businesses.name}. See you soon! ${siteUrl}/confirm/${b.id}`;

    try {
      await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: clean,
          type: "text",
          text: { body: message }
        })
      });

      // Mark as sent
      await supabase.from("bookings").update(
        isTomorrow? { reminder_1day_sent: true } : { reminder_today_sent: true }
      ).eq("id", b.id);

      sent++;
    } catch (e) {
      console.error(e);
    }
  }

  return NextResponse.json({ checked: bookings?.length || 0, sent, skipped });
}
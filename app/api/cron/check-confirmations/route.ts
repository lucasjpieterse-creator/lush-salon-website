import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // find overdue bookings
  const { data: overdue } = await supabase
    .from('bookings')
    .select('id, client_name, client_phone, booking_time')
    .eq('client_confirmed', false)
    .eq('status', 'confirmed')
    .lt('booking_time', new Date().toISOString())

  if (!overdue || overdue.length === 0) {
    return Response.json({ cancelled: 0 })
  }

  for (const booking of overdue) {
    // 1. Cancel in DB
    await supabase
      .from('bookings')
      .update({ status: 'cancelled_no_confirm' })
      .eq('id', booking.id)

    // 2. Send cancel WhatsApp
    try {
      const cleanTo = booking.client_phone.toString().replace(/\D/g, '').replace(/^0/, '27')
      const timeStr = new Date(booking.booking_time).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })
      
      // Try to send a TEXT message (works if 24h window is open)
      await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanTo,
          type: "text",
          text: {
            body: `Hi ${booking.client_name} 👋 Your booking for ${timeStr} at HustleHub was cancelled because you didn't confirm on WhatsApp.\n\nNo worries, you can rebook anytime on our site.`
          }
        })
      })
    } catch (e) {
      console.log('whatsapp fail', e)
    }
  }

  return Response.json({ cancelled: overdue.length, ids: overdue.map(b => b.id) })
}
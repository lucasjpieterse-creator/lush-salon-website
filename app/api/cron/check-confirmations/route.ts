import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find bookings that are in the past and not confirmed
  const { data: overdue } = await supabase
    .from('bookings')
    .select('id, booking_time')
    .eq('client_confirmed', false)
    .eq('status', 'confirmed')
    .lt('booking_time', new Date().toISOString())

  if (!overdue || overdue.length === 0) {
    return NextResponse.json({ cancelled: 0, message: 'No overdue bookings' })
  }

  const ids = overdue.map(b => b.id)

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled_no_confirm' })
    .in('id', ids)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cancelled: ids.length, ids })
}
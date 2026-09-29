import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// This handles "I want 2 chickens" without touching your homepage
export async function POST(req: NextRequest) {
  try {
    const { from, message } = await req.json()
    const text = (message || "").toLowerCase()

    let reply = ""

    if (text.includes("2") && text.includes("chicken")) {
      await supabase.from("orders").insert({
        phone: from || "unknown",
        item: "2 chickens",
        status: "pending",
        created_at: new Date().toISOString()
      })

      reply = "Got it! 🍗 2 chickens = R280\nDelivery 30-45min Secunda\nReply YES + location to confirm."
    } else {
      reply = "Hi! Welcome to HustleHub Secunda 🐔\nType 'I want 2 chickens' to order."
    }

    return NextResponse.json({ reply, ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: "WhatsApp bot ready - POST to this URL" })
}

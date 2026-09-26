"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ManagerPage(){
  const { slug } = useParams() as { slug: string }
  const [business, setBusiness] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [pinOk, setPinOk] = useState(false)
  const [pin, setPin] = useState('')

  useEffect(()=>{
    async function load(){
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      if(biz){
        const { data } = await supabase.from('bookings').select('*').eq('business_id', biz.id).order('created_at', { ascending: false }).limit(50)
        setBookings(data||[])
      }
    }
    if(slug) load()
  },[slug])

  const handlePin = () => {
    if(pin === (business?.manager_pin || '1234')) setPinOk(true)
    else alert('Wrong PIN')
  }

  const confirmBooking = async (b: any) => {
    // 1. Update DB to confirmed
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', b.id)
    setBookings(prev=> prev.map(x=> x.id===b.id? {...x, status: 'confirmed'} : x))

    // 2. Auto WhatsApp to CLIENT
    const clientRaw = (b.client_phone || b.customer_phone || '').replace(/[^0-9]/g,'')
    let wa = clientRaw.startsWith('0')? '27'+clientRaw.slice(1) : clientRaw

    // Parse notes for service name if needed
    const serviceInfo = b.notes || 'your booking'
    const dateInfo = b.booking_date || 'tomorrow'

    const icon = business.name.toLowerCase().includes('paw')? '🐾' : business.name.toLowerCase().includes('nail')? '💅' : '✂️'

    const msg = `${icon} *${business.name} - BOOKING CONFIRMED* ✅\n\nHi ${b.client_name || b.customer_name}!\n\nYour booking is CONFIRMED:\n📅 ${dateInfo}\n💈 ${serviceInfo}\n\n📍 ${business.location_text || 'Secunda'}\nWe can't wait to see you!\n\nReply YES to confirm or call us if you need to change.`

    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const cancelBooking = async (b:any) => {
    if(!confirm(`Cancel booking for ${b.client_name}?`)) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
    setBookings(prev=> prev.map(x=> x.id===b.id? {...x, status: 'cancelled'} : x))
  }

  if(!business) return <div className="min-h-screen bg-black text-white p-10">Loading manager...</div>

  if(!pinOk){
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-7 w-full max-w-sm">
          <h1 className="font-black text-2xl">{business.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">Manager Access • {business.location_text}</p>
          <input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="Owner PIN (1234)" className="w-full mt-6 bg-black border border-zinc-800 rounded-xl py-4 px-4 text-center text-xl tracking-widest"/>
          <button onClick={handlePin} className="w-full mt-4 bg-white text-black py-4 rounded-full font-black">Open Dashboard →</button>
          <a href={`/${slug}`} className="block text-center mt-4 text-zinc-500 text-sm">← Back to shop</a>
        </div>
      </div>
    )
  }

  const pending = bookings.filter(b=>b.status==='pending')
  const confirmed = bookings.filter(b=>b.status==='confirmed')

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">{business.name}</h1>
            <p className="text-zinc-500 text-sm">Manager Dashboard • {pending.length} pending</p>
          </div>
          <a href={`/${slug}`} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm">View Shop</a>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-zinc-500 text-xs">Pending</p><p className="font-black text-2xl mt-1">{pending.length}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-zinc-500 text-xs">Confirmed</p><p className="font-black text-2xl mt-1">{confirmed.length}</p></div>
          <div className="bg-yellow-400 text-black rounded-2xl p-4"><p className="text-black/60 text-xs font-bold">Today</p><p className="font-black text-2xl mt-1">{bookings.length}</p></div>
        </div>

        <h2 className="font-black text-xl mt-8 mb-3">⏰ Pending - Confirm in morning</h2>
        <div className="grid gap-3">
          {pending.map(b=>(
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-lg">{b.client_name || b.customer_name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{b.client_phone || b.customer_phone} • {b.booking_date}</p>
                  <p className="text-white text-sm mt-2 bg-zinc-800 rounded-full px-3 py-1 inline-block">{b.notes?.split('|')[0] || 'Service'}</p>
                </div>
                <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full h-fit">PENDING</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={()=>confirmBooking(b)} className="flex-1 bg-white text-black py-3 rounded-full font-black">✅ Confirm & WhatsApp Client</button>
                <button onClick={()=>cancelBooking(b)} className="bg-zinc-800 px-4 rounded-full">✕</button>
              </div>
            </div>
          ))}
          {pending.length===0 && <p className="text-zinc-600 text-sm bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-6 text-center">No pending bookings. Clients can book at midnight and will appear here in morning 🌙</p>}
        </div>

        <h2 className="font-bold text-zinc-500 mt-10 mb-3">Confirmed</h2>
        <div className="grid gap-2 opacity-60">
          {confirmed.slice(0,10).map(b=>(
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex justify-between text-sm">
              <span>{b.client_name} • {b.booking_date}</span><span className="text-green-400 font-bold">✓ confirmed</span>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-600 text-xs mt-12">HustleHub Secunda • Midnight booking enabled<br/>Client books 24/7 → appears here → 1 tap confirm → auto WhatsApp</p>
      </div>
    </div>
  )
}
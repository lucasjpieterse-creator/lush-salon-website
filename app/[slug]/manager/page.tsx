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
  const [sending, setSending] = useState(false)

  useEffect(()=>{
    async function load(){
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      if(biz){
        const { data } = await supabase.from('bookings').select('*').eq('business_id', biz.id).order('created_at', { ascending: false }).limit(100)
        setBookings(data||[])
      }
    }
    if(slug) load()
  },[slug])

  const handlePin = () => {
    if(pin === (business?.manager_pin || '1234')) setPinOk(true)
    else alert('Wrong PIN')
  }

  const getServiceName = (b:any) => b.notes?.split('|')[0].trim() || 'Service'
  const getPrice = (b:any) => b.total_price || b.price || ''
  const getTimeFromNotes = (b:any) => {
    const match = b.notes?.match(/(\d{2}:\d{2})/)
    return match? match[0] : ''
  }

  const confirmBooking = async (b: any) => {
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', b.id)
    setBookings(prev=> prev.map(x=> x.id===b.id? {...x, status: 'confirmed'} : x))
    const clientRaw = (b.client_phone || b.customer_phone || '').replace(/[^0-9]/g,'')
    let wa = clientRaw.startsWith('0')? '27'+clientRaw.slice(1) : clientRaw
    const serviceName = getServiceName(b)
    const price = getPrice(b)
    const time = getTimeFromNotes(b)
    const date = b.booking_date || ''
    const icon = business.name.toLowerCase().includes('paw')? '🐾' : business.name.toLowerCase().includes('nail')? '💅' : '✂️'
    const msg = `${icon} *${business.name} - BOOKING CONFIRMED* ✅\n\nHi ${b.client_name || b.customer_name}!\n\nYour booking is CONFIRMED:\n📅 ${date} ${time}\n💈 ${serviceName}${price? ` - R${price}`:''}\n\n📍 ${business.location_text || 'Secunda'}\nWe can't wait to see you!\n\nCall or WhatsApp us should you wish to cancel or change your appointment.`
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const cancelBooking = async (b:any) => {
    if(!confirm(`Cancel booking for ${b.client_name}?`)) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
    setBookings(prev=> prev.map(x=> x.id===b.id? {...x, status: 'cancelled'} : x))
  }

  // FREE REMINDERS LOGIC
  const todayStr = new Date().toISOString().split('T')[0]
  const todaysConfirmed = bookings.filter(b=> b.booking_date===todayStr && b.status==='confirmed')

  const sendAllReminders = async () => {
    if(todaysConfirmed.length===0){ alert("No confirmed bookings for today"); return; }
    if(!confirm(`Send reminders to ${todaysConfirmed.length} clients for today?`)) return
    setSending(true)
    for(const b of todaysConfirmed){
      const clientRaw = (b.client_phone || b.customer_phone || '').replace(/[^0-9]/g,'')
      let wa = clientRaw.startsWith('0')? '27'+clientRaw.slice(1) : clientRaw
      const serviceName = getServiceName(b)
      const time = getTimeFromNotes(b)
      const icon = business.name.toLowerCase().includes('paw')? '🐾' : business.name.toLowerCase().includes('nail')? '💅' : '✂️'
      const msg = `${icon} *Reminder - ${business.name}* ⏰\n\nHi ${b.client_name}!\n\nThis is a friendly reminder:\n📅 Today at ${time}\n💈 ${serviceName}\n\n📍 ${business.location_text || 'Secunda'}\nSee you soon!`
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
      await new Promise(r=> setTimeout(r, 800)) // small delay so tabs don't block
    }
    setSending(false)
  }

  if(!business) return <div className="min-h-screen bg-black text-white p-10">Loading manager...</div>

  if(!pinOk){
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-7 w-full max-w-sm">
          <h1 className="font-black text-2xl">{business.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">Manager Access</p>
          <input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="PIN 1234" className="w-full mt-6 bg-black border border-zinc-800 rounded-xl py-4 px-4 text-center text-xl tracking-widest"/>
          <button onClick={handlePin} className="w-full mt-4 bg-white text-black py-4 rounded-full font-black">Open Dashboard →</button>
        </div>
      </div>
    )
  }

  const pending = bookings.filter(b=>b.status==='pending')

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">{business.name}</h1>
            <p className="text-zinc-500 text-sm">Manager • {pending.length} pending • {todaysConfirmed.length} today</p>
          </div>
          <a href={`/${slug}`} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm">View Shop</a>
        </div>

        {/* FREE REMINDERS CARD */}
        <div className="mt-6 bg-yellow-400 text-black rounded-[20px] p-5 flex justify-between items-center">
          <div>
            <p className="font-black text-lg">⏰ Today's Reminders</p>
            <p className="text-sm font-medium opacity-70">{todaysConfirmed.length} confirmed for {todayStr}</p>
          </div>
          <button onClick={sendAllReminders} disabled={sending || todaysConfirmed.length===0} className="bg-black text-white px-5 py-3 rounded-full font-black text-sm disabled:opacity-40">
            {sending? 'Sending...' : `Send ${todaysConfirmed.length} →`}
          </button>
        </div>
        <p className="text-[11px] text-zinc-500 mt-2 text-center">Free version: Opens WhatsApp for each client. Tap Send in WhatsApp.</p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-zinc-500 text-xs">Pending</p><p className="font-black text-2xl mt-1">{pending.length}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-zinc-500 text-xs">Today</p><p className="font-black text-2xl mt-1">{todaysConfirmed.length}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-zinc-500 text-xs">Total</p><p className="font-black text-2xl mt-1">{bookings.length}</p></div>
        </div>

        <h2 className="font-black text-xl mt-8 mb-3">⏰ Pending - Confirm in morning</h2>
        <div className="grid gap-3">
          {pending.map(b=>(
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-lg">{b.client_name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{b.client_phone} • {b.booking_date} {getTimeFromNotes(b)}</p>
                  <p className="text-white text-sm mt-2 bg-zinc-800 rounded-full px-3 py-1 inline-block">{getServiceName(b)} {getPrice(b)? `• R${getPrice(b)}`:''}</p>
                </div>
                <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full h-fit">PENDING</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={()=>confirmBooking(b)} className="flex-1 bg-white text-black py-3 rounded-full font-black">✅ Confirm & WhatsApp</button>
                <button onClick={()=>cancelBooking(b)} className="bg-zinc-800 px-4 rounded-full">✕</button>
              </div>
            </div>
          ))}
          {pending.length===0 && <p className="text-zinc-600 text-sm bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-6 text-center">No pending 🌙</p>}
        </div>
      </div>
    </div>
  )
}
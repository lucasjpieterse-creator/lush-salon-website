"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ManagerPage(){
  const { slug } = useParams()
  const [business, setBusiness] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState<'today'|'all'>('all')
  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(()=>{
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      if(!biz) return
      const { data: books } = await supabase.from('bookings')
       .select('*, services(name, price)')
       .eq('business_id', biz.id)
       .order('booking_date', { ascending: false })
       .order('booking_time', { ascending: true })
      setBookings(books||[])
    }
    load()
  },[slug])

  const filtered = filter==='today'? bookings.filter(b=> b.booking_date === todayStr) : bookings
  const revenueToday = bookings.filter(b=> b.booking_date === todayStr && b.status!== 'cancelled').reduce((a,b)=>a+Number(b.total_price||b.price||0),0)
  const bookingsToday = bookings.filter(b=> b.booking_date === todayStr).length

  const handleConfirm = async (b:any) => {
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', b.id)
    const raw = (b.client_phone || b.customer_phone || '').replace(/[^0-9]/g,'')
    if(!raw) return alert('Confirmed, but no client phone found!')
    let wa = raw.startsWith('0')? '27'+raw.slice(1) : raw
    const msg = `✅ Hi ${b.client_name || b.customer_name || ''}! Your booking at *${business.name}* - Secunda, Mpumalanga is CONFIRMED!\n\n*Service:* ${b.services?.name || b.notes?.split('|')[0] || 'Your service'}\n*Date:* ${b.booking_date}\n*Time:* ${b.booking_time || b.start_time}\n*Total:* R${b.total_price || b.price || ''}\n\n📍 Secunda, Mpumalanga\nSee you then! 🐾`
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
    setBookings(prev=>prev.map(x=>x.id===b.id? {...x, status:'confirmed'}:x))
  }

  const handleCancel = async (b:any) => {
    if(!confirm('Cancel this booking?')) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
    const raw = (b.client_phone || b.customer_phone || '').replace(/[^0-9]/g,'')
    if(raw){
      let wa = raw.startsWith('0')? '27'+raw.slice(1) : raw
      const msg = `❌ Hi ${b.client_name}, your booking at ${business.name} Secunda on ${b.booking_date} at ${b.booking_time||b.start_time} was cancelled. Reply to reschedule.`
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    setBookings(prev=>prev.map(x=>x.id===b.id? {...x, status:'cancelled'}:x))
  }

  if(!business) return <div className="min-h-screen bg-black text-white p-10">Loading manager...</div>

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black">{business.name} — Manager</h1>
      <p className="text-zinc-500 text-sm">{business.slug} • Secunda, Mpumalanga</p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Bookings Today</p>
          <p className="text-3xl font-black mt-1">{bookingsToday}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Revenue Today</p>
          <p className="text-3xl font-black mt-1">R{revenueToday}</p>
        </div>
        <div className="bg-white text-black rounded-2xl p-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Stylists</p>
          <p className="text-3xl font-black mt-1">1</p>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button onClick={()=>setFilter('today')} className={`px-4 py-2 rounded-full text-sm font-bold ${filter==='today'?'bg-white text-black':'bg-zinc-800'}`}>Today</button>
        <button onClick={()=>setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold ${filter==='all'?'bg-white text-black':'bg-zinc-800'}`}>All Bookings</button>
      </div>

      <h2 className="mt-8 font-bold flex items-center gap-2">📅 Bookings</h2>
      <div className="mt-4 space-y-3">
        {filtered.length===0 && <p className="text-zinc-600 text-sm">No bookings yet</p>}
        {filtered.map((b:any)=>{
          const isCancelled = b.status==='cancelled'
          const isConfirmed = b.status==='confirmed'
          return (
            <div key={b.id} className={`rounded-2xl p-4 flex justify-between items-center border ${isCancelled?'bg-red-900/20 border-red-900 opacity-60': isConfirmed?'bg-green-900/40 border-green-800':'bg-zinc-900 border-zinc-800'}`}>
              <div className="pr-4">
                <p className="font-bold">
                  {b.booking_time || b.start_time || '00:00'} — {b.services?.name || b.notes?.split('|')[0] || 'Service'} • {b.client_name || b.customer_name || 'Guest'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {b.services?.name || ''} {b.services?.name?'•':''} R{b.total_price||b.price} • {b.booking_date} • {b.status} • Secunda
                </p>
                <p className="text-xs text-zinc-500 mt-1">📞 {b.client_phone || b.customer_phone}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!isConfirmed &&!isCancelled && (
                  <button onClick={()=>handleConfirm(b)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-black hover:scale-105 transition">
                    Confirm & WhatsApp →
                  </button>
                )}
                {isConfirmed && <span className="bg-green-500 text-black px-3 py-2 rounded-full text-xs font-black">✓ Confirmed</span>}
                <button onClick={()=>handleCancel(b)} className="bg-zinc-800 text-white px-3 py-2 rounded-full text-sm">Cancel</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-xs text-zinc-500">
        Flow: Client books (date+time) → Manager clicks Confirm → WhatsApp goes BACK to client with ✅ confirmed message for Secunda location.
      </div>
    </div>
  )
}
"use client"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function DashboardPage() {
  const { slug } = useParams() as { slug: string }
  const [business, setBusiness] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [servicesMap, setServicesMap] = useState<any>({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [pin, setPin] = useState("")
  const [authed, setAuthed] = useState(false)

  const OWNER_PIN = "1234" // change this later

  useEffect(() => { loadBusiness() }, [slug])
  useEffect(() => { if(business) loadBookings() }, [business, date])

  async function loadBusiness() {
    const { data } = await supabase.from('businesses').select('*').eq('slug', slug).single()
    setBusiness(data)
    const { data: srvs } = await supabase.from('services').select('*').eq('business_id', data.id)
    const map: any = {}
    srvs?.forEach((s:any) => map[s.name] = s.price)
    setServicesMap(map)
  }

  async function loadBookings() {
    const { data } = await supabase.from('bookings')
     .select('*, stylists(name)')
     .eq('business_id', business.id)
     .eq('booking_date', date)
     .order('booking_time')
    setBookings(data||[])
  }

  async function updateStatus(id: string, status: 'confirmed' | 'cancelled' | 'pending') {
    await supabase.from('bookings').update({ status }).eq('id', id)
    loadBookings()
  }

  if(!business) return <div className="p-6 bg-black text-white min-h-screen">Loading...</div>

  if(!authed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 p-8 rounded-[2rem] w-full max-w-sm border border-zinc-800">
          <h1 className="font-black text-2xl">{business.name} Manager</h1>
          <p className="text-zinc-500 text-sm mt-1">Enter PIN to view bookings</p>
          <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN = 1234" className="w-full mt-6 bg-black border border-zinc-800 rounded-xl p-4" />
          <button onClick={()=> pin===OWNER_PIN && setAuthed(true)} className="w-full mt-4 bg-white text-black py-3 rounded-xl font-bold">Unlock Dashboard</button>
          <p className="text-xs text-zinc-600 mt-3">Demo PIN: 1234</p>
        </div>
      </div>
    )
  }

  const totalProfit = bookings.filter(b=>b.status!=='cancelled').reduce((sum,b)=> sum + (servicesMap[b.service_name]||0), 0)
  const confirmed = bookings.filter(b=>b.status==='confirmed').length
  const pending = bookings.filter(b=>b.status==='pending').length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="bg-yellow-400 text-black text-center py-2 font-black text-xs">DEMO MANAGER • {business.name}</div>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">{business.name}</h1>
          <button onClick={()=>setAuthed(false)} className="text-xs bg-zinc-800 px-3 py-2 rounded-full">Lock</button>
        </div>

        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-6 w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4" />

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-xs">TOTAL TODAY</p><p className="text-2xl font-black">{bookings.filter(b=>b.status!=='cancelled').length}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-xs">EST. PROFIT</p><p className="text-2xl font-black text-green-400">R{totalProfit}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"><p className="text-zinc-500 text-xs">PENDING</p><p className="text-2xl font-black text-yellow-400">{pending}</p><p className="text-xs">{confirmed} confirmed</p></div>
        </div>

        <h2 className="font-bold mt-8 mb-3">Bookings for {date}</h2>
        <div className="grid gap-3">
          {bookings.length===0 && <p className="text-zinc-600 text-sm">No bookings for this day.</p>}
          {bookings.map(b=>(
            <div key={b.id} className={`p-4 rounded-2xl border flex justify-between items-center ${b.status==='cancelled'?'bg-zinc-900 border-zinc-800 opacity-50': b.status==='confirmed'?'bg-white text-black border-white':'bg-zinc-900 border-yellow-500/30'}`}>
              <div>
                <p className="font-bold">{b.booking_time} • {b.service_name} — R{servicesMap[b.service_name]||'?'} </p>
                <p className="text-sm opacity-70">{b.stylists?.name} • Status: {b.status}</p>
              </div>
              <div className="flex gap-2">
                {b.status!=='confirmed' && <button onClick={()=>updateStatus(b.id,'confirmed')} className="bg-green-500 text-black px-3 py-2 rounded-full text-xs font-bold">Confirm</button>}
                {b.status!=='cancelled' && <button onClick={()=>updateStatus(b.id,'cancelled')} className="bg-zinc-800 text-white px-3 py-2 rounded-full text-xs">Cancel</button>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-xs text-zinc-500">How overlap prevention works:</p>
          <p className="text-xs text-zinc-400 mt-1">When a time is confirmed, the booking page will automatically hide that time for that stylist. Pending bookings still show as booked to avoid double-booking.</p>
        </div>
      </div>
    </div>
  )
}
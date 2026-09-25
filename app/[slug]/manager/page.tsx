"use client"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ManagerPage() {
  const { slug } = useParams() as { slug: string }
  const [business, setBusiness] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [stylists, setStylists] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [filter, setFilter] = useState('today')
  const [newStylist, setNewStylist] = useState({ name: '', specialty: '' })
  const [newService, setNewService] = useState({ name: '', price: '' })

  useEffect(()=>{
    load()
  },[slug, filter])

  async function load(){
    const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
    setBusiness(biz)
    if(!biz) return

    const { data: sts } = await supabase.from('stylists').select('*').eq('business_id', biz.id).order('name')
    const { data: srvs } = await supabase.from('services').select('*').eq('business_id', biz.id).order('price')
    setStylists(sts||[]); setServices(srvs||[])

    let query = supabase.from('bookings').select('*, stylists(name), services(name)').eq('business_id', biz.id).order('start_time', {ascending: true})

    if(filter === 'today'){
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('start_time', `${today}T00:00:00`).lte('start_time', `${today}T23:59:59`)
    }
    const { data: bks } = await query
    setBookings(bks||[])
  }

  async function updateStatus(id:string, status:string){
    await supabase.from('bookings').update({ status }).eq('id', id)
    load()
  }

  async function deleteBooking(id:string){
    if(!confirm('Delete this booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    load()
  }

  async function addStylist(){
    if(!newStylist.name) return
    await supabase.from('stylists').insert({ business_id: business.id, name: newStylist.name, specialty: newStylist.specialty })
    setNewStylist({ name: '', specialty: '' })
    load()
  }

  async function addService(){
    if(!newService.name ||!newService.price) return
    await supabase.from('services').insert({ business_id: business.id, name: newService.name, price: parseFloat(newService.price), duration_minutes: 60 })
    setNewService({ name: '', price: '' })
    load()
  }

  async function deleteStylist(id:string){
    if(!confirm('Delete stylist? This will delete their bookings too')) return
    await supabase.from('stylists').delete().eq('id', id)
    load()
  }

  const totalToday = bookings.filter(b=>b.status!=='cancelled').reduce((sum,b)=> sum + parseFloat(b.total_price||0), 0)

  if(!business) return <div className="p-6 bg-black text-white min-h-screen">Loading manager...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 max-w-5xl mx-auto pb-20">
      <h1 className="text-3xl font-black mt-4">{business.name} — Manager</h1>
      <p className="text-zinc-500 text-sm">{business.slug} • {business.location_text}</p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-xs text-zinc-500">BOOKINGS TODAY</p><p className="text-2xl font-black">{bookings.length}</p></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-xs text-zinc-500">REVENUE TODAY</p><p className="text-2xl font-black">R{totalToday}</p></div>
        <div className="bg-white text-black rounded-2xl p-4"><p className="text-xs opacity-60">STYLISTS</p><p className="text-2xl font-black">{stylists.length}</p></div>
      </div>

      <div className="flex gap-2 mt-6">
        <button onClick={()=>setFilter('today')} className={`px-4 py-2 rounded-full text-sm font-bold ${filter==='today'?'bg-white text-black':'bg-zinc-800'}`}>Today</button>
        <button onClick={()=>setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold ${filter==='all'?'bg-white text-black':'bg-zinc-800'}`}>All Bookings</button>
      </div>

      <h2 className="font-bold mt-8 mb-3 text-xl">📅 Bookings {filter==='today'?'- Today':''}</h2>
      <div className="grid gap-2">
        {bookings.length===0 && <p className="text-zinc-600 text-sm">No bookings yet. Share your booking link: /{slug}/book</p>}
        {bookings.map(b=>{
          const dt = new Date(b.start_time)
          const time = dt.toTimeString().slice(0,5)
          const date = dt.toISOString().split('T')[0]
          return (
            <div key={b.id} className={`p-4 rounded-2xl border flex justify-between items-center ${b.status==='cancelled'?'bg-zinc-900 border-zinc-800 opacity-50': b.status==='confirmed'?'bg-green-950 border-green-800':'bg-zinc-900 border-zinc-800'}`}>
              <div>
                <p className="font-bold">{time} — {b.stylists?.name || 'No stylist'} • {b.client_name} {b.client_name==='Guest'&& b.id.slice(0,4)}</p>
                <p className="text-xs text-zinc-400">{b.services?.name || ''} • R{b.total_price} • {date} • {b.status}</p>
              </div>
              <div className="flex gap-1">
                {b.status==='pending' && <button onClick={()=>updateStatus(b.id,'confirmed')} className="bg-[#25D366] text-black px-3 py-1 rounded-full text-xs font-bold">Confirm</button>}
                {b.status!=='cancelled' && <button onClick={()=>updateStatus(b.id,'cancelled')} className="bg-zinc-800 px-3 py-1 rounded-full text-xs">Cancel</button>}
                <button onClick={()=>deleteBooking(b.id)} className="bg-red-900 px-2 py-1 rounded-full text-xs">✕</button>
              </div>
            </div>
          )
        })}
      </div>

      <h2 className="font-bold mt-10 mb-3 text-xl">💇‍♀️ Stylists</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex gap-2 mb-4">
          <input value={newStylist.name} onChange={e=>setNewStylist({...newStylist, name: e.target.value})} placeholder="Name e.g. Nomsa" className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm"/>
          <input value={newStylist.specialty} onChange={e=>setNewStylist({...newStylist, specialty: e.target.value})} placeholder="Specialty" className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm"/>
          <button onClick={addStylist} className="bg-white text-black px-4 rounded-xl font-bold text-sm">Add</button>
        </div>
        {stylists.map(s=>(
          <div key={s.id} className="flex justify-between py-2 border-b border-zinc-800 last:border-0 text-sm">
            <span>{s.name} — {s.specialty}</span>
            <button onClick={()=>deleteStylist(s.id)} className="text-red-400">Delete</button>
          </div>
        ))}
      </div>

      <h2 className="font-bold mt-8 mb-3 text-xl">✂️ Services</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex gap-2 mb-4">
          <input value={newService.name} onChange={e=>setNewService({...newService, name: e.target.value})} placeholder="Service e.g. Wash & Blow" className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm"/>
          <input value={newService.price} onChange={e=>setNewService({...newService, price: e.target.value})} type="number" placeholder="R Price" className="w-24 bg-black border border-zinc-700 rounded-xl p-3 text-sm"/>
          <button onClick={addService} className="bg-white text-black px-4 rounded-xl font-bold text-sm">Add</button>
        </div>
        {services.map(s=>(
          <div key={s.id} className="flex justify-between py-2 border-b border-zinc-800 last:border-0 text-sm">
            <span>{s.name}</span><span className="font-bold">R{s.price}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 p-4 bg-yellow-400 text-black rounded-2xl">
        <p className="font-black">🔗 Links for clients:</p>
        <p className="text-sm mt-1">Booking: <b>/{slug}/book</b></p>
        <p className="text-sm">Homepage: <b>/{slug}</b></p>
        <p className="text-sm">This manager: <b>/{slug}/manager</b></p>
      </div>
    </div>
  )
}
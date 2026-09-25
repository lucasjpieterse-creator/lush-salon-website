"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function BookPage(){
  const { slug } = useParams()
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(()=>{
    async function load(){
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      const { data: servs } = await supabase.from('services').select('*').eq('business_id', biz.id).eq('active', true)
      setServices(servs||[])
    }
    load()
  },[slug])

  const toggleService = (id:string) => {
    setSelected(prev => prev.includes(id)? prev.filter(x=>x!==id) : [...prev, id])
  }

  const totalPrice = services.filter(s=>selected.includes(s.id)).reduce((sum,s)=>sum + Number(s.price), 0)
  const totalMin = services.filter(s=>selected.includes(s.id)).reduce((sum,s)=>sum + Number(s.duration_min||s.duration_minutes||0), 0)
  const selectedNames = services.filter(s=>selected.includes(s.id)).map(s=>s.name).join(' + ')

  const handleBook = async () => {
    if(selected.length===0) return alert('Select at least 1 service')
    const stylistRes = await supabase.from('stylists').select('id').eq('business_id', business.id).limit(1).single()

    const { data, error } = await supabase.from('bookings').insert({
      business_id: business.id,
      service_id: selected[0], // main service
      stylist_id: stylistRes.data?.id,
      customer_name: name,
      customer_phone: phone,
      total_price: totalPrice,
      notes: `COMBO: ${selectedNames} (${totalMin} min)`,
      status: 'pending'
    }).select().single()

    if(error) alert(error.message)
    else {
      const waNumber = (business.whatsapp_number || business.phone || '').replace(/[^0-9]/g,'')
      const msg = `Hi ${business.name}! New booking: ${selectedNames} - R${totalPrice} - ${name} - ${phone}`
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank')
      alert(`Booked! ${selectedNames} - R${totalPrice}`)
    }
  }

  if(!business) return <div className="p-10 text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-lg mx-auto">
      <a href={`/${slug}`} className="text-zinc-500">← Back</a>
      <h1 className="text-3xl font-black mt-4">{business.name}</h1>
      <p className="text-zinc-500 text-sm">Select multiple services for combos</p>

      <div className="mt-6 grid gap-3">
        {services.map(s=>(
          <button key={s.id} onClick={()=>toggleService(s.id)} className={`text-left p-4 rounded-2xl border flex justify-between items-center ${selected.includes(s.id)? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800'}`}>
            <div><p className="font-bold">{s.name}</p><p className="text-xs opacity-60">{s.duration_min} min</p></div>
            <div className="font-black">R{s.price} {selected.includes(s.id)? '✓' : '+'}</div>
          </button>
        ))}
      </div>

      {selected.length>0 && (
        <div className="mt-4 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <p className="font-bold">Combo: {selectedNames}</p>
          <p className="text-zinc-400 text-sm">{totalMin} min total • R{totalPrice} total</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4"/>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Your WhatsApp number" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4"/>
        <button onClick={handleBook} disabled={selected.length===0} className="w-full bg-yellow-400 text-black py-4 rounded-full font-black disabled:opacity-30">Book R{totalPrice} via WhatsApp →</button>
      </div>
    </div>
  )
}
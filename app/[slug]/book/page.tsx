"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function BookPage(){
  const { slug } = useParams()
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(()=>{
    supabase.from('businesses').select('*').eq('slug', slug).single().then(({data})=>{
      setBusiness(data)
      if(data) supabase.from('services').select('*').eq('business_id', data.id).eq('active', true).then(r=>setServices(r.data||[]))
    })
  },[slug])

  const toggle = (id:string) => setSelected(p=>p.includes(id)? p.filter(x=>x!==id): [...p, id])
  const totalPrice = services.filter(s=>selected.includes(s.id)).reduce((a,s)=>a+Number(s.price||0),0)
  const totalMin = services.filter(s=>selected.includes(s.id)).reduce((a,s)=>a+Number(s.duration_min||s.duration_minutes||0),0)
  const names = services.filter(s=>selected.includes(s.id)).map(s=>s.name).join(' + ')

  const handleBook = async () => {
    if(!selected.length) return alert('Select a service')
    if(!name ||!phone) return alert('Enter name + WhatsApp')

    // MINIMAL INSERT - only 2 columns that always exist
    const { error } = await supabase.from('bookings').insert({
      business_id: business.id,
      service_id: selected[0]
    })

    // Even if booking insert fails, still do WhatsApp
    const waRaw = (business.whatsapp_number || business.phone || '').replace(/[^0-9]/g,'')
    let wa = waRaw.startsWith('0')? '27'+waRaw.slice(1) : waRaw
    const msg = `🐾 NEW BOOKING - ${business.name} - Secunda\n\nServices: ${names}\nTotal: R${totalPrice} (${totalMin}min)\nClient: ${name}\nPhone: ${phone}\n\nConfirm time?`
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')

    if(error){
      alert(`WhatsApp opened! (Booking table needs fix: ${error.message})`)
    } else {
      alert(`✅ Booked ${names} - R${totalPrice}`)
      router.push(`/${slug}`)
    }
  }

  if(!business) return <div className="p-10 bg-black text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-lg mx-auto">
      <a href={`/${slug}`} className="text-zinc-500 text-sm">← Back</a>
      <h1 className="text-3xl font-black mt-4">{business.name}</h1>
      <p className="text-zinc-500 text-sm">📍 Secunda, Mpumalanga • Multi-select combos</p>
      <div className="mt-6 grid gap-3">
        {services.map(s=>(
          <button key={s.id} onClick={()=>toggle(s.id)} className={`text-left p-4 rounded-2xl border flex justify-between ${selected.includes(s.id)? 'bg-white text-black':'bg-zinc-900 border-zinc-800'}`}>
            <div><p className="font-bold">{s.name}</p><p className="text-xs opacity-60">{s.duration_min||s.duration_minutes} min</p></div>
            <div className="font-black">R{s.price} {selected.includes(s.id)? '✓':'+'}</div>
          </button>
        ))}
      </div>
      {selected.length>0 && <div className="mt-4 p-4 bg-zinc-900 rounded-2xl"><p className="font-bold">{names}</p><p className="text-sm text-zinc-400">R{totalPrice} • {totalMin} min • Secunda</p></div>}
      <div className="mt-6 space-y-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4"/>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="071 123 4567" className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4"/>
        <button onClick={handleBook} className="w-full bg-yellow-400 text-black py-4 rounded-full font-black">Book R{totalPrice} via WhatsApp →</button>
      </div>
    </div>
  )
}
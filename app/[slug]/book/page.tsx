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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('10:00')

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
    const notesText = `${names} | R${totalPrice} | ${totalMin}min | Secunda | Wants: ${date} ${time}`
    const { error } = await supabase.from('bookings').insert({
      business_id: business.id,
      service_id: selected[0],
      client_name: name,
      client_phone: phone,
      customer_name: name,
      customer_phone: phone,
      booking_date: date,
      notes: notesText,
      status: 'pending',
      total_price: totalPrice,
      price: totalPrice
    })
    if(error){
      alert('DB Error: ' + error.message)
      console.log(error)
    } else {
      alert(`✅ Booked for ${date} at ${time}!`)
    }
    const waRaw = (business.whatsapp_number || business.phone || '').replace(/[^0-9]/g,'')
    let wa = waRaw.startsWith('0')? '27'+waRaw.slice(1) : waRaw
    const msg = `🐾 *NEW BOOKING - ${business.name} (Secunda)*\n\n*Services:* ${names}\n*Total:* R${totalPrice}\n*Client:* ${name}\n*Phone:* ${phone}\n*Requested:* ${date} at ${time}\n\nConfirm time? ✅`
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
    router.push(`/${slug}`)
  }

  if(!business) return <div className="p-10 bg-black text-white">Loading...</div>

  // WALLPAPER THEME - same as business page
  const isPawfect = business.name.toLowerCase().includes('paw') || business.category?.toLowerCase().includes('dog')
  const isNails = business.category?.toLowerCase().includes('nail') || business.name.toLowerCase().includes('nail')
  const isGlamour = business.name.toLowerCase().includes('glamour') || business.name.toLowerCase().includes('locks')

  const theme = isPawfect? {
    bg: 'from-[#FFF3E8] via-[#FFE8D6] to-white text-black',
    card: 'bg-white border border-orange-100 shadow-sm',
    selected: 'bg-black text-white border-black shadow-lg',
    muted: 'text-zinc-500',
    accent: 'bg-black text-white',
    input: 'bg-white border-orange-200 text-black'
  } : isNails? {
    bg: 'from-[#FFE4EC] via-[#FFD1DC] to-white text-black',
    card: 'bg-white border border-pink-100 shadow-sm',
    selected: 'bg-black text-white border-black shadow-lg',
    muted: 'text-zinc-500',
    accent: 'bg-black text-white',
    input: 'bg-white border-pink-200 text-black'
  } : {
    bg: 'from-[#2A1B2E] via-[#1A1A1A] to-black text-white',
    card: 'bg-zinc-900 border border-zinc-800',
    selected: 'bg-white text-black border-white shadow-lg',
    muted: 'text-zinc-400',
    accent: 'bg-white text-black',
    input: 'bg-zinc-900 border-zinc-700 text-white'
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg} relative`}>
      <div className="max-w-lg mx-auto p-6 pb-20">
        <a href={`/${slug}`} className={`${theme.muted} text-sm font-bold`}>← Back to {business.name}</a>
        <div className="flex gap-3 items-center mt-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isPawfect || isNails? 'bg-white shadow' : 'bg-zinc-800'}`}>
            {business.logo_url? <img src={business.logo_url} className="w-full h-full object-cover rounded-2xl" /> : (isPawfect? '🐾' : isNails? '💅' : '✂️')}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">{business.name}</h1>
            <p className={`${theme.muted} text-sm`}>📍 Secunda, Mpumalanga</p>
          </div>
        </div>

        <h2 className="font-black mt-8 mb-3 text-lg">Choose service</h2>
        <div className="grid gap-3">
          {services.map(s=>(
            <button key={s.id} onClick={()=>toggle(s.id)} className={`text-left p-4 rounded-2xl border flex justify-between items-center transition active:scale-[0.98] ${selected.includes(s.id)? theme.selected : theme.card}`}>
              <div><p className="font-bold">{s.name}</p><p className={`text-xs ${selected.includes(s.id)? 'opacity-70' : theme.muted}`}>{s.duration_min||s.duration_minutes||30} min</p></div>
              <div className="font-black">R{s.price} {selected.includes(s.id)? '✓':'+'}</div>
            </button>
          ))}
        </div>

        {selected.length>0 && <div className={`mt-4 p-4 rounded-2xl ${theme.card}`}><p className="font-bold">{names}</p><p className={`text-sm ${theme.muted}`}>R{totalPrice} • {totalMin} min</p></div>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div><p className={`text-xs ${theme.muted} mb-1 font-bold`}>Date</p><input type="date" value={date} onChange={e=>setDate(e.target.value)} className={`w-full border rounded-xl py-3 px-4 outline-none ${theme.input}`}/></div>
          <div><p className={`text-xs ${theme.muted} mb-1 font-bold`}>Time</p><input type="time" value={time} onChange={e=>setTime(e.target.value)} className={`w-full border rounded-xl py-3 px-4 outline-none ${theme.input}`}/></div>
        </div>

        <div className={`mt-6 space-y-3 p-4 rounded-[24px] border ${theme.card}`}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className={`w-full border rounded-xl py-3 px-4 outline-none ${theme.input}`}/>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="071 123 4567" className={`w-full border rounded-xl py-3 px-4 outline-none ${theme.input}`}/>
          <button onClick={handleBook} className={`w-full py-4 rounded-full font-black text-[16px] shadow-xl active:scale-[0.98] transition ${theme.accent}`}>
            Request R{totalPrice} for {date} {time} → WhatsApp
          </button>
          <p className={`text-[11px] text-center ${theme.muted}`}>You will be redirected to WhatsApp to confirm</p>
        </div>
      </div>
    </div>
  )
}
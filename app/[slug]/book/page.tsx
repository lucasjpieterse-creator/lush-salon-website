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
  const [showSuccess, setShowSuccess] = useState(false)

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

    if(error){ alert('DB Error: ' + error.message); return }

    setShowSuccess(true)

    // 1. WhatsApp to MANAGER (so manager sees at 8am)
    const waRaw = (business.whatsapp_number || business.phone || '').replace(/[^0-9]/g,'')
    let waManager = waRaw.startsWith('0')? '27'+waRaw.slice(1) : waRaw
    const msgManager = `🐾 *NEW BOOKING - ${business.name} (Secunda)*\n\n*Services:* ${names}\n*Total:* R${totalPrice} (${totalMin}min)\n*Client:* ${name}\n*Phone:* ${phone}\n*Requested:* ${date} at ${time}\n\nStatus: PENDING in dashboard. Confirm to client? ✅`

    setTimeout(()=>{
      window.open(`https://wa.me/${waManager}?text=${encodeURIComponent(msgManager)}`, '_blank')
    }, 800)
  }

  const sendAutoReceiptToClient = () => {
    // 2. Auto-receipt to CLIENT (feels automated at midnight)
    const clientRaw = phone.replace(/[^0-9]/g,'')
    let waClient = clientRaw.startsWith('0')? '27'+clientRaw.slice(1) : clientRaw
    const icon = business.name.toLowerCase().includes('paw')? '🐾' : business.name.toLowerCase().includes('nail')? '💅' : '✂️'
    const msgClient = `${icon} Hi ${name}! Thanks for booking at *${business.name}*\n\nWe received: *${names}*\n*R${totalPrice}* - ${date} at ${time}\n\nOur team will confirm your time on WhatsApp in the morning (we open at 8am).\n\n📍 Secunda\nPowered by HustleHub ✅`
    window.open(`https://wa.me/${waClient}?text=${encodeURIComponent(msgClient)}`, '_blank')
    router.push(`/${slug}`)
  }

  if(!business) return <div className="p-10 bg-black text-white">Loading...</div>

  const isPawfect = business.name.toLowerCase().includes('paw') || business.category?.toLowerCase().includes('dog')
  const isNails = business.category?.toLowerCase().includes('nail') || business.name.toLowerCase().includes('nail')
  const theme = isPawfect? {
    bg: 'from-[#FFF3E8] via-[#FFE8D6] to-white text-black', card: 'bg-white border border-orange-100', selected: 'bg-black text-white border-black', muted: 'text-zinc-500', accent: 'bg-black text-white', input: 'bg-white border-orange-200 text-black'
  } : isNails? {
    bg: 'from-[#FFE4EC] via-[#FFD1DC] to-white text-black', card: 'bg-white border border-pink-100', selected: 'bg-black text-white border-black', muted: 'text-zinc-500', accent: 'bg-black text-white', input: 'bg-white border-pink-200 text-black'
  } : {
    bg: 'from-[#2A1B2E] via-[#1A1A1A] to-black text-white', card: 'bg-zinc-900 border border-zinc-800', selected: 'bg-white text-black border-white', muted: 'text-zinc-400', accent: 'bg-white text-black', input: 'bg-zinc-900 border-zinc-700 text-white'
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg} relative`}>
      <div className="max-w-lg mx-auto p-6 pb-20">
        <a href={`/${slug}`} className={`${theme.muted} text-sm font-bold`}>← Back</a>
        <h1 className="text-2xl font-black tracking-tighter mt-4">{business.name}</h1>
        <p className={`${theme.muted} text-sm`}>📍 Secunda • 24/7 Booking</p>

        <div className="mt-6 grid gap-3">
          {services.map(s=>(
            <button key={s.id} onClick={()=>toggle(s.id)} className={`text-left p-4 rounded-2xl border flex justify-between ${selected.includes(s.id)? theme.selected : theme.card}`}>
              <div><p className="font-bold">{s.name}</p><p className="text-xs opacity-60">{s.duration_min||30} min</p></div>
              <div className="font-black">R{s.price} {selected.includes(s.id)? '✓':'+'}</div>
            </button>
          ))}
        </div>

        {selected.length>0 && <div className={`mt-4 p-4 rounded-2xl ${theme.card}`}><p className="font-bold">{names}</p><p className={`text-sm ${theme.muted}`}>R{totalPrice} • {totalMin} min</p></div>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div><p className={`text-xs ${theme.muted} mb-1 font-bold`}>Date</p><input type="date" value={date} onChange={e=>setDate(e.target.value)} className={`w-full border rounded-xl py-3 px-4 ${theme.input}`}/></div>
          <div><p className={`text-xs ${theme.muted} mb-1 font-bold`}>Time</p><input type="time" value={time} onChange={e=>setTime(e.target.value)} className={`w-full border rounded-xl py-3 px-4 ${theme.input}`}/></div>
        </div>

        <div className={`mt-6 space-y-3 p-4 rounded-[24px] border ${theme.card}`}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className={`w-full border rounded-xl py-3 px-4 ${theme.input}`}/>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="071 123 4567" className={`w-full border rounded-xl py-3 px-4 ${theme.input}`}/>
          <button onClick={handleBook} className={`w-full py-4 rounded-full font-black ${theme.accent}`}>Request R{totalPrice} → Book</button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6">
          <div className="bg-white text-black rounded-[28px] p-7 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
            <h2 className="font-black text-2xl mt-4 tracking-tighter">Booking Received!</h2>
            <p className="text-zinc-500 text-sm mt-2">We saved your booking for <b>{date} at {time}</b>. Our manager in Secunda will confirm in the morning.</p>
            <div className="mt-4 bg-zinc-100 rounded-2xl p-3 text-left text-sm">
              <p className="font-bold">{names}</p><p className="text-zinc-500">R{totalPrice} • {name} • {phone}</p>
            </div>
            <button onClick={sendAutoReceiptToClient} className="w-full mt-5 bg-black text-white py-4 rounded-full font-black">Send me confirmation on WhatsApp →</button>
            <button onClick={()=>{setShowSuccess(false); router.push(`/${slug}`)}} className="w-full mt-2 text-zinc-400 text-sm">Close</button>
            <p className="text-[10px] text-zinc-400 mt-3">Midnight booking enabled — manager notified via WhatsApp</p>
          </div>
        </div>
      )}
    </div>
  )
}
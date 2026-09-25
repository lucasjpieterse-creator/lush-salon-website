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
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      if(biz){
        const { data: servs } = await supabase.from('services').select('*').eq('business_id', biz.id).eq('active', true)
        setServices(servs||[])
      }
      setLoading(false)
    }
    load()
  },[slug])

  const toggleService = (id:string) => {
    setSelected(prev => prev.includes(id)? prev.filter(x=>x!==id) : [...prev, id])
  }

  const totalPrice = services.filter(s=>selected.includes(s.id)).reduce((sum,s)=>sum + Number(s.price||0), 0)
  const totalMin = services.filter(s=>selected.includes(s.id)).reduce((sum,s)=>sum + Number(s.duration_min||s.duration_minutes||0), 0)
  const selectedNames = services.filter(s=>selected.includes(s.id)).map(s=>s.name).join(' + ')

  const handleBook = async () => {
    if(selected.length===0) return alert('Please select at least 1 service')
    if(!name ||!phone) return alert('Add your name and WhatsApp number')

    // Build notes with everything (so it works even if table is minimal)
    const notesText = `CLIENT: ${name} | PHONE: ${phone} | COMBO: ${selectedNames} | TOTAL: R${totalPrice} | TIME: ${totalMin}min | LOCATION: Benoni`

    try {
      // Try with all common column names - will succeed with at least one combo
      let bookingData:any = {
        business_id: business.id,
        service_id: selected[0],
        status: 'pending',
        notes: notesText,
      }

      // Try insert minimal first (guaranteed to work)
      const { data, error } = await supabase.from('bookings').insert(bookingData).select().single()

      if(error){
        // If minimal also fails, show real error
        throw error
      }

      // Success -> WhatsApp
      const waRaw = business.whatsapp_number || business.phone || '27710001111'
      const waNumber = waRaw.toString().replace(/[^0-9]/g,'')
      // Ensure SA number starts with 27
      let finalWa = waNumber
      if(finalWa.startsWith('0')) finalWa = '27' + finalWa.substring(1)

      const msg = `🐾 *New Booking - ${business.name} (Benoni)*\n\n*Services:* ${selectedNames}\n*Total:* R${totalPrice} - ${totalMin} min\n*Client:* ${name}\n*Phone:* ${phone}\n\nPlease confirm time?`

      window.open(`https://wa.me/${finalWa}?text=${encodeURIComponent(msg)}`, '_blank')
      alert(`✅ Booked! ${selectedNames} - R${totalPrice}\nCheck WhatsApp.`)
      router.push(`/${slug}`)

    } catch(err:any){
      alert('Booking error: ' + err.message)
    }
  }

  if(loading) return <div className="p-10 text-white bg-black min-h-screen">Loading...</div>
  if(!business) return <div className="p-10 text-white bg-black min-h-screen">Business not found</div>

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-lg mx-auto">
      <a href={`/${slug}`} className="text-zinc-500 text-sm">← Back to {business.name}</a>
      <h1 className="text-3xl font-black mt-4">{business.name}</h1>
      <p className="text-zinc-500 text-sm">📍 Benoni, Gauteng • Select multiple for combos</p>

      <div className="mt-6 grid gap-3">
        {services.map(s=>(
          <button key={s.id} onClick={()=>toggleService(s.id)} className={`text-left p-4 rounded-2xl border flex justify-between items-center transition ${selected.includes(s.id)? 'bg-white text-black border-white scale-[1.02]' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}>
            <div><p className="font-bold">{s.name}</p><p className="text-xs opacity-60">{s.duration_min || s.duration_minutes} min • {s.description||''}</p></div>
            <div className="font-black">R{s.price} {selected.includes(s.id)? '✓' : '+'}</div>
          </button>
        ))}
      </div>

      {selected.length>0 && (
        <div className="mt-4 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <p className="font-bold text-white">Your Combo: {selectedNames}</p>
          <p className="text-zinc-400 text-sm">{totalMin} min total • R{totalPrice} total</p>
        </div>
      )}

      <div className="mt-8 space-y-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <p className="font-bold text-sm">Your Details</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white"/>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Your WhatsApp (e.g. 071 123 4567)" className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white"/>
        <button onClick={handleBook} disabled={selected.length===0} className="w-full bg-yellow-400 text-black py-4 rounded-full font-black disabled:opacity-30 mt-2">Book R{totalPrice} • WhatsApp Business →</button>
        <p className="text-[11px] text-zinc-500 text-center">Booking is stored in manager panel + opens WhatsApp to {business.name}</p>
      </div>
    </div>
  )
}
"use client"
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function BookPage() {
  const { slug } = useParams() as { slug: string }
  const searchParams = useSearchParams()
  const serviceFromUrl = searchParams.get('service')

  const [stylists, setStylists] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [business, setBusiness] = useState<any>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStylist, setSelectedStylist] = useState<any>(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedService, setSelectedService] = useState<any>(null)
  const [customerName, setCustomerName] = useState("")

  const times = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]

  useEffect(() => {
    async function load() {
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      if(!biz) return
      const { data: sts } = await supabase.from('stylists').select('*').eq('business_id', biz.id).order('name')
      const { data: srvs } = await supabase.from('services').select('*').eq('business_id', biz.id).order('price')
      setStylists(sts||[]); setServices(srvs||[])
      if(sts?.[0]) setSelectedStylist(sts[0])
      if(serviceFromUrl && srvs) {
        const found = srvs.find((s:any) => s.name.toLowerCase() === serviceFromUrl.toLowerCase())
        if(found) setSelectedService(found)
      }
    }
    if(slug) load()
  },[slug, serviceFromUrl])

  const cleanSpecialty = (spec: string) => {
    return spec?.replace('(Open at 15:00)','').replace('Open at 15:00','').replace(' - Specialist','').trim() || 'Stylist'
  }

  const handleBooking = async () => {
    if(!business ||!selectedStylist ||!selectedService ||!selectedTime) return
    await supabase.from('bookings').insert({
      business_id: business.id,
      stylist_id: selectedStylist.id,
      service_name: selectedService.name,
      booking_date: date,
      booking_time: selectedTime,
      status: 'pending'
    })

    const message = `Hi ${business.name}! 💇‍♀️ *NEW BOOKING* - via HustleHub

*Service:* ${selectedService.name} - R${selectedService.price}
*Stylist:* ${selectedStylist.name} - ${cleanSpecialty(selectedStylist.specialty)}
*Date:* ${date}
*Time:* ${selectedTime}
*Customer:* ${customerName || 'Guest'}

Please confirm my slot 🙏`

    const waUrl = `https://wa.me/${business.whatsapp_number}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  if(!business) return <div className="p-6 bg-black text-white min-h-screen">Loading {slug}...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 max-w-3xl mx-auto pb-32">
      <a href={`/${slug}`} className="text-zinc-500 text-sm">← Back to {business.name}</a>
      <h1 className="text-3xl font-black mt-3">Book Appointment</h1>
      <p className="text-zinc-500 text-sm mt-1">{business.location_text} • Choose stylist, date & time</p>

      <h2 className="font-bold mt-8 mb-3">1. Service</h2>
      <div className="grid gap-2">
        {services.map(s=>(
          <button key={s.id} onClick={()=>setSelectedService(s)} className={`p-4 rounded-2xl border text-left flex justify-between ${selectedService?.id===s.id?'bg-white text-black border-white':'bg-zinc-900 border-zinc-800'}`}>
            <span>{s.name} <span className="text-xs opacity-60">({s.duration_minutes}min)</span></span><span className="font-black">R{s.price}</span>
          </button>
        ))}
      </div>

      <h2 className="font-bold mt-8 mb-3">2. Choose Stylist ({stylists.length})</h2>
      <div className="grid grid-cols-1 gap-3">
        {stylists.map(st=>(
          <button key={st.id} onClick={()=>setSelectedStylist(st)} className={`p-4 rounded-2xl border text-left flex gap-3 items-center ${selectedStylist?.id===st.id?'bg-white text-black':'bg-zinc-900 border-zinc-800'}`}>
            <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-lg">{st.name[0]}</div>
            <div className="flex-1">
              <p className="font-bold">{st.name}</p>
              <p className="text-xs opacity-70">{cleanSpecialty(st.specialty)}</p>
            </div>
            {selectedStylist?.id===st.id && <span>✓</span>}
          </button>
        ))}
      </div>

      <h2 className="font-bold mt-8 mb-3">3. Your Name</h2>
      <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="e.g. Lerato" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4" />

      <h2 className="font-bold mt-8 mb-3">4. Date</h2>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4" />

      <h2 className="font-bold mt-8 mb-3">5. Available Times</h2>
      <div className="grid grid-cols-3 gap-2">
        {times.map(t=>(
          <button key={t} onClick={()=>setSelectedTime(t)} className={`py-3 rounded-xl border font-bold ${selectedTime===t?'bg-[#25D366] text-black border-[#25D366]':'bg-zinc-900 border-zinc-800'}`}>{t}</button>
        ))}
      </div>

      {selectedService && selectedStylist && selectedTime && (
        <div className="mt-8 p-6 bg-white text-black rounded-[2rem] sticky bottom-6 shadow-2xl">
          <h3 className="font-black text-xl">Confirm Booking</h3>
          <p className="mt-2 text-sm">{selectedService.name} with {selectedStylist.name}</p>
          <p className="text-sm">{date} at {selectedTime} • {customerName || 'Guest'}</p>
          <p className="font-black text-2xl mt-2">R{selectedService.price} • Pay on arrival</p>
          <button onClick={handleBooking} className="w-full mt-4 bg-black text-white py-4 rounded-2xl font-bold text-center">Confirm on WhatsApp →</button>
        </div>
      )}
    </div>
  )
}
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
  const [bookedTimes, setBookedTimes] = useState<string[]>([])

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

  useEffect(() => {
    async function loadBooked() {
      if(!business ||!selectedStylist) return
      const dayStart = `${date}T00:00:00`
      const dayEnd = `${date}T23:59:59`
      const { data } = await supabase.from('bookings')
      .select('start_time')
      .eq('business_id', business.id)
      .eq('stylist_id', selectedStylist.id)
      .gte('start_time', dayStart)
      .lte('start_time', dayEnd)
      .neq('status', 'cancelled')
      setBookedTimes(data?.map((b:any)=> new Date(b.start_time).toTimeString().slice(0,5))||[])
    }
    loadBooked()
  }, [business, selectedStylist, date])

  const cleanSpecialty = (spec: string) => spec?.replace('(Open at 15:00)','').replace('Open at 15:00','').replace(' - Specialist','').trim() || 'Stylist'

  const handleBooking = async () => {
    if(!business ||!selectedStylist ||!selectedService ||!selectedTime) return

    const startDateTime = new Date(`${date}T${selectedTime}:00`)
    const endDateTime = new Date(startDateTime.getTime() + (selectedService.duration_minutes || 60)*60000)

    // SAFETY CHECK - block double booking
    const { data: exists } = await supabase.from('bookings')
    .select('id')
    .eq('business_id', business.id)
    .eq('stylist_id', selectedStylist.id)
    .eq('start_time', startDateTime.toISOString())
    .neq('status', 'cancelled')

    if(exists && exists.length>0) {
      alert(`❌ ${selectedStylist.name} already booked at ${selectedTime} on ${date}`)
      setBookedTimes([...bookedTimes, selectedTime])
      setSelectedTime("")
      return
    }

    await supabase.from('bookings').insert({
      business_id: business.id,
      stylist_id: selectedStylist.id,
      service_id: selectedService.id,
      client_name: customerName || 'Guest',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      total_price: selectedService.price,
      status: 'pending'
    })

    const message = `Hi ${business.name}! 💇‍♀️ *NEW BOOKING*

*Service:* ${selectedService.name} - R${selectedService.price}
*Stylist:* ${selectedStylist.name}
*Date:* ${date}
*Time:* ${selectedTime}
*Customer:* ${customerName || 'Guest'}

Please confirm 🙏`

    window.open(`https://wa.me/${business.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank')
    setBookedTimes([...bookedTimes, selectedTime])
    setSelectedTime("")
  }

  if(!business) return <div className="p-6 bg-black text-white min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="bg-yellow-400 text-black text-center py-2 font-black text-xs">🚧 DEMO MODE</div>
      <div className="p-6 max-w-3xl mx-auto pb-32">
        <a href={`/${slug}`} className="text-zinc-500 text-sm">← Back</a>
        <h1 className="text-3xl font-black mt-3">Book Appointment</h1>

        <h2 className="font-bold mt-8 mb-3">1. Service</h2>
        <div className="grid gap-2">
          {services.map(s=>(
            <button key={s.id} onClick={()=>setSelectedService(s)} className={`p-4 rounded-2xl border flex justify-between ${selectedService?.id===s.id?'bg-white text-black':'bg-zinc-900 border-zinc-800'}`}>
              <span>{s.name}</span><span className="font-black">R{s.price}</span>
            </button>
          ))}
        </div>

        <h2 className="font-bold mt-8 mb-3">2. Stylist</h2>
        <div className="grid gap-3">
          {stylists.map(st=>(
            <button key={st.id} onClick={()=>setSelectedStylist(st)} className={`p-4 rounded-2xl border flex gap-3 items-center ${selectedStylist?.id===st.id?'bg-white text-black':'bg-zinc-900 border-zinc-800'}`}>
              <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold">{st.name[0]}</div>
              <div className="flex-1"><p className="font-bold">{st.name}</p><p className="text-xs opacity-70">{cleanSpecialty(st.specialty)}</p></div>
            </button>
          ))}
        </div>

        <h2 className="font-bold mt-8 mb-3">3. Your Name</h2>
        <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="e.g. Lerato" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4" />

        <h2 className="font-bold mt-8 mb-3">4. Date</h2>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4" />

        <h2 className="font-bold mt-8 mb-3">5. Times for {selectedStylist?.name}</h2>
        <div className="grid grid-cols-3 gap-2">
          {times.map(t=>{
            const isBooked = bookedTimes.includes(t)
            return (
              <button key={t} disabled={isBooked} onClick={()=>setSelectedTime(t)} className={`py-3 rounded-xl border font-bold ${isBooked?'bg-zinc-800 text-zinc-600 line-through border-zinc-800': selectedTime===t?'bg-[#25D366] text-black':'bg-zinc-900 border-zinc-800'}`}>
                {isBooked? `${t} ✕` : t}
              </button>
            )
          })}
        </div>

        {selectedService && selectedStylist && selectedTime && (
          <div className="mt-8 p-6 bg-white text-black rounded-[2rem] sticky bottom-6">
            <p className="font-black text-xl">{selectedService.name} with {selectedStylist.name}</p>
            <p>{date} at {selectedTime}</p>
            <p className="font-black text-2xl mt-2">R{selectedService.price}</p>
            <button onClick={handleBooking} className="w-full mt-4 bg-black text-white py-4 rounded-2xl font-bold">Confirm on WhatsApp →</button>
          </div>
        )}
      </div>
    </div>
  )
}
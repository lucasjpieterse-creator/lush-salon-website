"use client"
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const TIME_SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"]

export default function BookPage(){
  const { slug } = useParams() as { slug: string }
  const search = useSearchParams()
  const preService = search.get('service')

  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedTime, setSelectedTime] = useState("")
  const [takenTimes, setTakenTimes] = useState<string[]>([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    async function load(){
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      if(!biz) return
      const { data: srvs } = await supabase.from('services').select('*').eq('business_id', biz.id).order('price')
      setServices(srvs||[])
      if(preService && srvs){
        setSelectedService(srvs.find((s:any)=> s.name===preService) || srvs[0])
      } else if(srvs?.[0]){
        setSelectedService(srvs[0])
      }
    }
    if(slug) load()
  },[slug, preService])

  // FETCH BLOCKED TIMES WHEN DATE CHANGES
  useEffect(()=>{
    async function fetchTaken(){
      if(!business ||!selectedDate) return
      const { data } = await supabase.from('bookings')
       .select('notes')
       .eq('business_id', business.id)
       .eq('booking_date', selectedDate)
       .neq('status','cancelled')

      const times = (data||[]).map((b:any)=>{
        const m = b.notes?.match(/(\d{2}:\d{2})/)
        return m? m[1] : null
      }).filter(Boolean) as string[]
      setTakenTimes(times)
      if(times.includes(selectedTime)) setSelectedTime("")
    }
    fetchTaken()
  },[selectedDate, business])

  const handleBooking = async () => {
    if(!selectedService ||!selectedDate ||!selectedTime ||!name ||!phone) { alert("Fill all fields"); return; }
    if(takenTimes.includes(selectedTime)) { alert("Sorry, "+selectedTime+" just got booked. Pick another time"); return; }

    setLoading(true)
    const totalPrice = selectedService.price

    const { error } = await supabase.from('bookings').insert({
      business_id: business.id,
      client_name: name,
      client_phone: phone,
      customer_name: name,
      customer_phone: phone,
      booking_date: selectedDate,
      status: 'pending',
      notes: `${selectedService.name} | R${totalPrice} | Wants: ${selectedDate} ${selectedTime}`,
      total_price: totalPrice
    })

    if(error){ alert(error.message); setLoading(false); return; }

    // WhatsApp to manager
    const bizPhoneRaw = (business.whatsapp_number || '').replace(/[^0-9]/g,'')
    let bizWa = bizPhoneRaw.startsWith('0')? '27'+bizPhoneRaw.slice(1) : bizPhoneRaw
    const msg = `🔥 *NEW BOOKING - ${business.name}*\n\n💈 ${selectedService.name} - R${totalPrice}\n📅 ${selectedDate} at ${selectedTime}\n👤 ${name}\n📱 ${phone}\n\nManager: Confirm in /${slug}/manager`

    window.open(`https://wa.me/${bizWa}?text=${encodeURIComponent(msg)}`, '_blank')
    alert(`Booked! ${selectedDate} at ${selectedTime}. Owner will confirm in morning via WhatsApp.`)
    window.location.href = `/${slug}`
  }

  if(!business) return <div className="min-h-screen bg-black text-white p-6">Loading booking...</div>

  const isPawfect = business.name.toLowerCase().includes('paw')
  const isNails = business.name.toLowerCase().includes('nail')
  const themeBg = isPawfect? 'from-[#FFF3E8] to-white text-black' : isNails? 'from-[#FFE4EC] to-white text-black' : 'from-zinc-900 to-black text-white'

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeBg} p-6`}>
      <div className="max-w-md mx-auto">
        <a href={`/${slug}`} className="text-sm opacity-60">← Back to {business.name}</a>
        <h1 className="text-3xl font-black tracking-tighter mt-4">Book Appointment</h1>
        <p className="opacity-60 text-sm mt-1">{business.location_text}</p>

        {/* SERVICE */}
        <p className="font-bold mt-8 mb-2">1. Choose Service</p>
        <div className="grid gap-2">
          {services.map(s=>(
            <button key={s.id} onClick={()=>setSelectedService(s)} className={`text-left p-4 rounded-2xl border flex justify-between ${selectedService?.id===s.id? 'bg-black text-white border-black' : 'bg-white/80 border-zinc-200 text-black'}`}>
              <span>{s.name}</span><span className="font-black">R{s.price}</span>
            </button>
          ))}
        </div>

        {/* DATE */}
        <p className="font-bold mt-6 mb-2">2. Choose Date</p>
        <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-black" />

        {/* TIME SLOTS WITH BLOCKING */}
        <p className="font-bold mt-6 mb-2">3. Choose Time {takenTimes.length>0 && <span className="text-xs font-normal opacity-60">• {takenTimes.length} taken</span>}</p>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map(t=>{
            const isTaken = takenTimes.includes(t)
            const isSelected = selectedTime===t
            return (
              <button key={t} disabled={isTaken} onClick={()=>setSelectedTime(t)} className={`py-3 rounded-full text-sm font-bold border transition ${isTaken? 'bg-zinc-200 text-zinc-400 border-zinc-200 line-through cursor-not-allowed' : isSelected? 'bg-black text-white border-black scale-105' : 'bg-white text-black border-zinc-200'}`}>
                {t} {isTaken? '✕':''}
              </button>
            )
          })}
        </div>

        {/* DETAILS */}
        <p className="font-bold mt-6 mb-2">4. Your Details</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" className="w-full bg-white border border-zinc-200 rounded-2xl p-4 mb-2 text-black" />
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="WhatsApp: 082..." className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-black" />

        <button onClick={handleBooking} disabled={loading} className="w-full mt-8 bg-yellow-400 text-black py-4 rounded-full font-black text-lg disabled:opacity-50">
          {loading? 'Booking...' : `Confirm ${selectedDate} at ${selectedTime || '--:--'} →`}
        </button>

        <p className="text-center text-xs opacity-50 mt-4">24/7 booking • Owner confirms in morning • Secunda</p>
      </div>
    </div>
  )
}
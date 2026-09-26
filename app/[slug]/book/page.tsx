"use client"
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const TIME_SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"]

declare global { interface Window { PaystackPop: any } }

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
  const [payDeposit, setPayDeposit] = useState(true)

  useEffect(()=>{
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    document.body.appendChild(s)
    async function load(){
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      if(!biz) return
      const { data: srvs } = await supabase.from('services').select('*').eq('business_id', biz.id).order('price')
      setServices(srvs||[])
      if(preService && srvs){ setSelectedService(srvs.find((s:any)=> s.name===preService) || srvs[0]) }
      else if(srvs?.[0]) setSelectedService(srvs[0])
    }
    if(slug) load()
  },[slug, preService])

  useEffect(()=>{
    async function fetchTaken(){
      if(!business ||!selectedDate) return
      const { data } = await supabase.from('bookings').select('notes').eq('business_id', business.id).eq('booking_date', selectedDate).neq('status','cancelled')
      const times = (data||[]).map((b:any)=> b.notes?.match(/(\d{2}:\d{2})/)?.[1]).filter(Boolean) as string[]
      setTakenTimes(times)
    }
    fetchTaken()
  },[selectedDate, business])

  const handleBooking = async () => {
    if(!selectedService ||!selectedDate ||!selectedTime ||!name ||!phone){ alert("Fill all"); return; }
    if(takenTimes.includes(selectedTime)){ alert("Slot taken"); return; }
    setLoading(true)
    const deposit = business.deposit_amount || 100
    const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_KEY || "pk_test_0f46006ac6b2d593ed5b5a16ceb72add963fef00"

    if(payDeposit){
      // @ts-ignore
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: "client_" + phone + "@gmail.com",
        amount: deposit * 100,
        currency: "ZAR",
        ref: "HH" + Date.now(),
        callback: function(response: any){
          (async ()=>{
            const { error } = await supabase.from('bookings').insert({
              business_id: business.id,
              client_name: name, client_phone: phone,
              customer_name: name, customer_phone: phone,
              booking_date: selectedDate,
              status: 'confirmed',
              notes: `${selectedService.name} | R${selectedService.price} | ${selectedDate} ${selectedTime} | PAID ${response.reference}`,
              total_price: selectedService.price,
              deposit_paid: true,
              deposit_ref: response.reference
            })
            setLoading(false)
            if(error){ alert(error.message); return; }
            const raw = (business.whatsapp_number||'').replace(/[^0-9]/g,'')
            const wa = raw.startsWith('0')? '27'+raw.slice(1) : raw
            const msg = `🔥 *PAID BOOKING - ${business.name}* ✅\n💈 ${selectedService.name} R${selectedService.price}\n📅 ${selectedDate} ${selectedTime}\n👤 ${name} ${phone}\n💰 R${deposit} PAID Ref:${response.reference}`
            window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,'_blank')
            alert(`Paid R${deposit}! Secured.`)
            window.location.href = `/${slug}`
          })()
        },
        onClose: function(){ setLoading(false); alert("Payment cancelled") }
      })
      handler.openIframe()
    } else {
      const { error } = await supabase.from('bookings').insert({
        business_id: business.id,
        client_name: name, client_phone: phone,
        customer_name: name, customer_phone: phone,
        booking_date: selectedDate,
        status: 'pending',
        notes: `${selectedService.name} | R${selectedService.price} | ${selectedDate} ${selectedTime} | NOT PAID`,
        total_price: selectedService.price
      })
      setLoading(false)
      if(error){ alert(error.message); return; }
      alert("Booked - owner will confirm")
      window.location.href = `/${slug}`
    }
  }

  if(!business) return <div className="p-6">Loading...</div>
  const dep = business.deposit_amount || 100

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-md mx-auto">
        <a href={`/${slug}`} className="text-sm opacity-60">← Back</a>
        <h1 className="text-3xl font-black mt-4">Secure Your Slot</h1>
        <p className="font-bold mt-6 mb-2">Service</p>
        <div className="grid gap-2">{services.map(s=><button key={s.id} onClick={()=>setSelectedService(s)} className={`text-left p-4 rounded-2xl border flex justify-between ${selectedService?.id===s.id?'bg-black text-white':'bg-white'}`}><span>{s.name}</span><span className="font-black">R{s.price}</span></button>)}</div>
        <p className="font-bold mt-6 mb-2">Date</p>
        <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full border rounded-2xl p-4" />
        <p className="font-bold mt-6 mb-2">Time</p>
        <div className="grid grid-cols-3 gap-2">{TIME_SLOTS.map(t=><button key={t} disabled={takenTimes.includes(t)} onClick={()=>setSelectedTime(t)} className={`py-3 rounded-full text-sm font-bold border ${takenTimes.includes(t)?'bg-zinc-100 text-zinc-400 line-through':selectedTime===t?'bg-black text-white':'bg-white'}`}>{t}</button>)}</div>
        <p className="font-bold mt-6 mb-2">Details</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full border rounded-2xl p-4 mb-2" />
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="072..." className="w-full border rounded-2xl p-4" />
        <div className="mt-6 bg-yellow-50 border rounded-2xl p-4 flex gap-3 items-center"><input type="checkbox" checked={payDeposit} onChange={e=>setPayDeposit(e.target.checked)} className="w-5 h-5" /><div><p className="font-black text-sm">Pay R{dep} deposit</p><p className="text-xs opacity-70">Instant confirm</p></div></div>
        <button onClick={handleBooking} disabled={loading} className="w-full mt-6 bg-black text-white py-4 rounded-full font-black">{loading?'Processing...': payDeposit?`Pay R${dep} & Secure →`:`Book ${selectedTime} →`}</button>
      </div>
    </div>
  )
}
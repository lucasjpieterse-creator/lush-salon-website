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
  const [paystackReady, setPaystackReady] = useState(false)

  useEffect(()=>{
    // Load Paystack script properly
    if(window.PaystackPop){ setPaystackReady(true); return; }
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.async = true
    s.onload = () => setPaystackReady(true)
    s.onerror = () => alert("Paystack failed to load - check internet")
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
      if(times.includes(selectedTime)) setSelectedTime("")
    }
    fetchTaken()
  },[selectedDate, business])

  const createBooking = async (paid=false, ref='') => {
    const { data, error } = await supabase.from('bookings').insert({
      business_id: business.id,
      client_name: name, client_phone: phone,
      customer_name: name, customer_phone: phone,
      booking_date: selectedDate,
      status: paid? 'confirmed' : 'pending',
      notes: `${selectedService.name} | R${selectedService.price} | Wants: ${selectedDate} ${selectedTime} | Deposit: ${paid? 'PAID '+ref : 'NOT PAID'}`,
      total_price: selectedService.price,
      deposit_paid: paid,
      deposit_ref: ref
    }).select().single()
    return { data, error }
  }

  const handleBooking = async () => {
    if(!selectedService ||!selectedDate ||!selectedTime ||!name ||!phone){ alert("Fill all fields"); return; }
    if(takenTimes.includes(selectedTime)){ alert("Slot taken"); return; }

    const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_KEY || "pk_test_0f46006ac6b2d593ed5b5a16ceb72add963fef00"

    if(!PAYSTACK_KEY){ alert("Paystack key missing - add to Vercel env"); return; }
    if(payDeposit &&!paystackReady){ alert("Paystack still loading, wait 2 sec and try again"); return; }

    setLoading(true)
    const depositAmount = business.deposit_amount || 100

    if(payDeposit){
      try{
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_KEY,
          email: `${phone}@hustlehub.local`,
          amount: depositAmount * 100,
          currency: 'ZAR',
          ref: `HH-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          callback: async function(response: any){
            const { error } = await createBooking(true, response.reference)
            setLoading(false)
            if(error){ alert(error.message); return; }
            const bizPhoneRaw = (business.whatsapp_number||'').replace(/[^0-9]/g,'')
            let bizWa = bizPhoneRaw.startsWith('0')? '27'+bizPhoneRaw.slice(1) : bizPhoneRaw
            const msg = `🔥 *PAID BOOKING - ${business.name}* ✅💰\n\n💈 ${selectedService.name} - R${selectedService.price}\n📅 ${selectedDate} at ${selectedTime}\n👤 ${name} - ${phone}\n💰 DEPOSIT PAID: R${depositAmount} Ref: ${response.reference}\n\nCONFIRMED - Slot secured!`
            window.open(`https://wa.me/${bizWa}?text=${encodeURIComponent(msg)}`, '_blank')
            alert(`Paid R${depositAmount}! Booking secured.`)
            window.location.href = `/${slug}`
          },
          onClose: function(){
            alert("Payment cancelled");
            setLoading(false);
          }
        })
        handler.openIframe()
      }catch(e:any){
        console.error(e)
        alert("Paystack error: "+ e.message)
        setLoading(false)
      }
    } else {
      const { error } = await createBooking(false, '')
      setLoading(false)
      if(error){ alert(error.message); return; }
      const bizPhoneRaw = (business.whatsapp_number||'').replace(/[^0-9]/g,'')
      let bizWa = bizPhoneRaw.startsWith('0')? '27'+bizPhoneRaw.slice(1) : bizPhoneRaw
      const msg = `🔥 *NEW BOOKING - ${business.name}*\n\n💈 ${selectedService.name} - R${selectedService.price}\n📅 ${selectedDate} at ${selectedTime}\n👤 ${name} - ${phone}\n⚠️ Deposit NOT paid`
      window.open(`https://wa.me/${bizWa}?text=${encodeURIComponent(msg)}`, '_blank')
      alert(`Booked ${selectedTime}. Owner will confirm.`)
      window.location.href = `/${slug}`
    }
  }

  if(!business) return <div className="min-h-screen bg-black text-white p-6">Loading...</div>
  const deposit = business.deposit_amount || 100

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-md mx-auto">
        <a href={`/${slug}`} className="text-sm opacity-60">← Back</a>
        <h1 className="text-3xl font-black tracking-tighter mt-4">Secure Your Slot</h1>
        <p className="opacity-60 text-sm mt-1">Pay R{deposit} deposit to confirm instantly {paystackReady? '✅' : '⏳ Loading pay...'}</p>

        <p className="font-bold mt-6 mb-2">1. Service</p>
        <div className="grid gap-2">
          {services.map(s=>(
            <button key={s.id} onClick={()=>setSelectedService(s)} className={`text-left p-4 rounded-2xl border flex justify-between ${selectedService?.id===s.id? 'bg-black text-white' : 'bg-white border-zinc-200'}`}>
              <span>{s.name}</span><span className="font-black">R{s.price}</span>
            </button>
          ))}
        </div>

        <p className="font-bold mt-6 mb-2">2. Date</p>
        <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-white border border-zinc-200 rounded-2xl p-4" />

        <p className="font-bold mt-6 mb-2">3. Time {takenTimes.length>0 && <span className="text-xs font-normal opacity-60">• {takenTimes.length} taken</span>}</p>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map(t=>{
            const isTaken = takenTimes.includes(t)
            return <button key={t} disabled={isTaken} onClick={()=>setSelectedTime(t)} className={`py-3 rounded-full text-sm font-bold border ${isTaken? 'bg-zinc-100 text-zinc-400 line-through' : selectedTime===t? 'bg-black text-white' : 'bg-white border-zinc-200'}`}>{t}</button>
          })}
        </div>

        <p className="font-bold mt-6 mb-2">4. Details</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full border rounded-2xl p-4 mb-2" />
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="072..." className="w-full border rounded-2xl p-4" />

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3 items-center">
          <input type="checkbox" checked={payDeposit} onChange={e=>setPayDeposit(e.target.checked)} className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-black text-sm">Pay R{deposit} deposit to secure instantly</p>
            <p className="text-xs opacity-70">With deposit = auto-confirmed. Without = owner confirms manually.</p>
          </div>
        </div>

        <button onClick={handleBooking} disabled={loading} className="w-full mt-6 bg-black text-white py-4 rounded-full font-black text-lg">
          {loading? 'Processing...' : payDeposit? `Pay R${deposit} & Secure ${selectedTime||''} →` : `Book ${selectedTime||''} (No Deposit) →`}
        </button>

        <p className="text-center text-[11px] opacity-50 mt-3">Secured by Paystack • Balance R{selectedService? selectedService.price - deposit : 0} at shop • {paystackReady? 'Ready' : 'Loading payment...'}</p>
      </div>
    </div>
  )
}
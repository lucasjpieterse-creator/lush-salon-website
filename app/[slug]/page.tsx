"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function SalonPage() {
  const { slug } = useParams() as { slug: string }
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [stylists, setStylists] = useState<any[]>([])
  const [pressTimer, setPressTimer] = useState<any>(null)

  useEffect(()=>{
    async function load(){
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      setBusiness(biz)
      if(!biz) return
      const { data: srvs } = await supabase.from('services').select('*').eq('business_id', biz.id).order('price')
      const { data: sts } = await supabase.from('stylists').select('*').eq('business_id', biz.id).order('name')
      setServices(srvs||[]); setStylists(sts||[])
    }
    if(slug) load()
  },[slug])

  // SECRET: long press on name
  const handleTouchStart = () => {
    const timer = setTimeout(()=>{
      const pin = prompt("Owner PIN? (hint: 1234)")
      if(pin === "1234"){
        window.location.href = `/${slug}/manager`
      } else if(pin!== null){
        alert("Wrong PIN")
      }
    }, 1500) // hold 1.5 sec
    setPressTimer(timer)
  }
  const handleTouchEnd = () => {
    if(pressTimer) clearTimeout(pressTimer)
  }

  if(!business) return <div className="min-h-screen bg-black text-white p-6">Loading {slug}...</div>

  const cleanSpecialty = (s:string)=> s?.replace('(Open at 15:00)','').replace(' - Specialist','').trim() || 'Stylist'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="bg-yellow-400 text-black text-center py-1.5 text-[10px] font-black tracking-widest">🚧 DEMO MODE — by HustleHub</div>

      <div className="p-6 max-w-3xl mx-auto">
        {/* LONG PRESS HERE */}
        <h1
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="text-4xl font-black select-none cursor-pointer"
        >
          {business.name}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">{business.location_text || 'Benoni • Walk-ins welcome'}</p>
        <p className="text-zinc-600 text-xs mt-1">Hold name 1.5s for manager</p>

        <a href={`/${slug}/book`} className="block mt-6 bg-white text-black text-center py-4 rounded-full font-black text-lg">Book Now →</a>

        <h2 className="font-bold mt-10 mb-3 text-xl">Services</h2>
        <div className="grid gap-2">
          {services.map(s=>(
            <a key={s.id} href={`/${slug}/book?service=${encodeURIComponent(s.name)}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between">
              <span>{s.name}</span><span className="font-black">R{s.price}</span>
            </a>
          ))}
        </div>

        <h2 className="font-bold mt-8 mb-3 text-xl">Our Stylists</h2>
        <div className="grid gap-3">
          {stylists.map(st=>(
            <div key={st.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold">{st.name[0]}</div>
              <div><p className="font-bold">{st.name}</p><p className="text-xs text-zinc-500">{cleanSpecialty(st.specialty)}</p></div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-zinc-600 text-xs">
          <p>📍 {business.location_text}</p>
          <p className="mt-2">Powered by HustleHub</p>
        </div>
      </div>
    </div>
  )
}
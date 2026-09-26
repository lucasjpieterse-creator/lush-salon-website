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

  const handleTouchStart = () => {
    const timer = setTimeout(()=>{
      const pin = prompt("Owner PIN?")
      if(pin === (business?.manager_pin || "1234")){
        window.location.href = `/${slug}/manager`
      } else if(pin!== null){
        alert("Wrong PIN")
      }
    }, 1500)
    setPressTimer(timer)
  }
  const handleTouchEnd = () => { if(pressTimer) clearTimeout(pressTimer) }

  if(!business) return <div className="min-h-screen bg-black text-white p-6">Loading {slug}...</div>

  const cleanSpecialty = (s:string)=> s?.replace('(Open at 15:00)','').replace(' - Specialist','').trim() || 'Stylist'

  // WALLPAPER LOGIC
  const isPawfect = business.name.toLowerCase().includes('paw') || business.category?.toLowerCase().includes('dog')
  const isNails = business.category?.toLowerCase().includes('nail') || business.name.toLowerCase().includes('nail')
  const isGlamour = business.name.toLowerCase().includes('glamour') || business.name.toLowerCase().includes('locks')

  const getTheme = () => {
    if(isPawfect) return {
      bg: 'from-[#FFF3E8] via-[#FFE8D6] to-white text-black',
      card: 'bg-white/80 backdrop-blur border border-orange-100',
      textMuted: 'text-zinc-500',
      icon: '🐾',
      accent: 'bg-black text-white'
    }
    if(isNails) return {
      bg: 'from-[#FFE4EC] via-[#FFD1DC] to-white text-black',
      card: 'bg-white/80 backdrop-blur border border-pink-100',
      textMuted: 'text-zinc-500',
      icon: '💅',
      accent: 'bg-black text-white'
    }
    if(isGlamour) return {
      bg: 'from-[#2A1B2E] via-[#1A1A1A] to-black text-white',
      card: 'bg-zinc-900/80 backdrop-blur border border-zinc-800',
      textMuted: 'text-zinc-400',
      icon: '✂️',
      accent: 'bg-white text-black'
    }
    return {
      bg: 'from-zinc-900 via-black to-black text-white',
      card: 'bg-zinc-900 border border-zinc-800',
      textMuted: 'text-zinc-500',
      icon: '⭐',
      accent: 'bg-white text-black'
    }
  }

  const theme = getTheme()

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg} relative overflow-hidden`}>
      {/* Decorative blurs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {isPawfect && <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-orange-300/20 rounded-full blur-[80px]"></div>}
        {isNails && <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-pink-300/30 rounded-full blur-[80px]"></div>}
        {isGlamour && <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]"></div>}
      </div>

      <div className="bg-yellow-400 text-black text-center py-1.5 text-[10px] font-black tracking-widest">🚧 DEMO MODE — by HustleHub</div>

      <div className="p-6 max-w-3xl mx-auto">
        {/* HEADER WITH WALLPAPER ICON */}
        <div className="flex gap-4 items-center">
          <div className={`w-20 h-20 rounded-[22px] flex items-center justify-center text-3xl overflow-hidden shadow-lg ${isPawfect? 'bg-white' : isNails? 'bg-white' : 'bg-zinc-800'}`}>
            {business.logo_url? (
              <img src={business.logo_url} className="w-full h-full object-cover" alt={business.name} />
            ) : (
              <span>{theme.icon}</span>
            )}
          </div>
          <div className="flex-1">
            <h1
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="text-[28px] font-black leading-tight select-none cursor-pointer tracking-tighter"
            >
              {business.name}
            </h1>
            <p className={`${theme.textMuted} text-sm mt-0.5`}>{business.location_text || 'Secunda • Walk-ins welcome'}</p>
            <p className={`${theme.textMuted} text-[10px] mt-1 opacity-60`}>Hold name 1.5s for manager</p>
          </div>
        </div>

        <a href={`/${slug}/book`} className={`block mt-6 ${theme.accent} text-center py-4 rounded-full font-black text-lg shadow-xl active:scale-[0.98] transition`}>Book Now →</a>

        <h2 className="font-bold mt-10 mb-3 text-xl tracking-tight">Services</h2>
        <div className="grid gap-2.5">
          {services.map(s=>(
            <a key={s.id} href={`/${slug}/book?service=${encodeURIComponent(s.name)}`} className={`${theme.card} rounded-2xl p-4 flex justify-between items-center hover:scale-[1.01] transition`}>
              <span className="font-medium">{s.name}</span><span className="font-black">R{s.price}</span>
            </a>
          ))}
          {services.length===0 && <p className={`${theme.textMuted} text-sm`}>No services yet. Add in Supabase → services table.</p>}
        </div>

        <h2 className="font-bold mt-8 mb-3 text-xl tracking-tight">Our Team</h2>
        <div className="grid gap-3">
          {stylists.map(st=>(
            <div key={st.id} className={`${theme.card} rounded-2xl p-4 flex gap-3 items-center`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isPawfect? 'bg-orange-100' : isNails? 'bg-pink-100' : 'bg-zinc-800 text-white'}`}>
                {st.avatar_url? <img src={st.avatar_url} className="w-full h-full object-cover rounded-full" /> : <span>{isPawfect? '🐶' : isNails? '💅' : '✂️'}</span>}
              </div>
              <div><p className="font-bold">{st.name}</p><p className={`text-xs ${theme.textMuted}`}>{cleanSpecialty(st.specialty)}</p></div>
            </div>
          ))}
        </div>

        <div className={`mt-12 text-center ${theme.textMuted} text-xs pb-10`}>
          <p>📍 {business.location_text || 'Secunda'}</p>
          <p className="mt-2">Powered by HustleHub • hustlehub-secunda.vercel.app</p>
        </div>
      </div>
    </div>
  )
}
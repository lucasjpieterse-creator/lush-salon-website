"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function HustleHub() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState('')
  const [pin, setPin] = useState('')
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(()=>{
    async function load(){
      const { data } = await supabase.from('businesses').select('*').order('name')
      if(data){
        setBusinesses(data)
        if(data.length>0) setSelectedSlug(data[0].slug)
      }
    }
    load()
  },[])

  const startPress = () => {
    const timer = setTimeout(()=> setShowOwnerModal(true), 1200)
    setPressTimer(timer)
  }
  const endPress = () => { if(pressTimer) clearTimeout(pressTimer) }

  const handleOwnerLogin = () => {
    const biz = businesses.find(b=>b.slug===selectedSlug)
    if(pin === (biz?.manager_pin || '1234')){
      window.location.href = `/${selectedSlug}/manager`
    } else {
      alert(`Wrong PIN for ${biz?.name}`)
    }
  }

  const categories = ['All', 'Dog Parlor', 'Salon', 'Barber', 'Nails', 'Spa']
  const filtered = businesses.filter(b=>{
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase())
    const cat = (b.category||'').toLowerCase()
    const matchesCat = category === 'All' || cat === category.toLowerCase() || (category === 'Dog Parlor' && cat.includes('dog'))
    return matchesSearch && matchesCat
  })

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="max-w-lg mx-auto p-6">
        <h1 onMouseDown={startPress} onMouseUp={endPress} onTouchStart={startPress} onTouchEnd={endPress} className="text-5xl font-black text-center mt-4 select-none cursor-pointer tracking-tighter">HustleHub</h1>
        <p className="text-zinc-500 text-center text-sm mt-2">Secunda • Find & book any hustle near you ✅</p>
        <p className="text-zinc-600 text-center text-[11px] mt-1">Long-press title for Owner Login</p>

        <div className="mt-6 relative">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Pawfect, Lush, nails..." className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 px-6 pl-12 outline-none focus:border-zinc-600" />
          <span className="absolute left-5 top-[18px]">🔍</span>
        </div>

        <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scrollbar-hide">
          {categories.map(c=>(
            <button key={c} onClick={()=>setCategory(c)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition ${category===c? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>{c}</button>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          {filtered.length === 0 && <p className="text-center text-zinc-600 py-10">No businesses found. Add them in Supabase → businesses table.</p>}
          {filtered.map(b=>(
            <a key={b.id} href={`/${b.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-4 flex gap-4 items-center hover:border-zinc-700 transition">
              <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl overflow-hidden">
                {b.logo_url? <img src={b.logo_url} className="w-full h-full object-cover" /> : b.name[0]}
              </div>
              <div className="flex-1"><p className="font-bold text-lg">{b.name}</p><p className="text-xs text-zinc-500">{b.category||'Business'} • {b.location_text||'Secunda'}</p></div>
              <div className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center">→</div>
            </a>
          ))}
        </div>
      </div>

      {showOwnerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-6 w-full max-w-sm">
            <h3 className="font-black text-xl">Owner Access</h3>
            <p className="text-zinc-500 text-xs mt-1">Select your business and enter PIN</p>
            <select value={selectedSlug} onChange={e=>setSelectedSlug(e.target.value)} className="w-full mt-4 bg-black border border-zinc-800 rounded-xl py-3 px-4">
              {businesses.map(b=>(
                <option key={b.id} value={b.slug}>{b.name}</option>
              ))}
            </select>
            <input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="Enter owner PIN" className="w-full mt-3 bg-black border border-zinc-800 rounded-xl py-3 px-4 outline-none" />
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setShowOwnerModal(false)} className="flex-1 bg-zinc-800 py-3 rounded-full font-bold">Cancel</button>
              <button onClick={handleOwnerLogin} className="flex-1 bg-yellow-400 text-black py-3 rounded-full font-black">Open →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
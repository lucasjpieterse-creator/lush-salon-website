"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function HustleHub() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [pressTimer, setPressTimer] = useState<any>(null)

  useEffect(()=>{
    async function load(){
      const { data } = await supabase.from('businesses').select('*').order('name')
      setBusinesses(data||[])
    }
    load()
  },[])

  // SECRET OWNER ACCESS - Hold HustleHub
  const startPress = () => {
    const timer = setTimeout(()=>{
      const slug = prompt("Enter your business slug (e.g. glamourlocks):")
      if(!slug) return
      const pin = prompt("Owner PIN?")
      if(pin === "1234"){ // change this later
        window.location.href = `/${slug.toLowerCase().trim()}/manager`
      } else if(pin) alert("Wrong PIN")
    }, 1200)
    setPressTimer(timer)
  }
  const endPress = () => clearTimeout(pressTimer)

  const categories = ['All', 'Salon', 'Barber', 'Nails', 'Dog Parlor', 'Spa']

  const filtered = businesses.filter(b=>{
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || (b.location_text||'').toLowerCase().includes(search.toLowerCase())
    const matchesCat = category === 'All' || (b.category||'Salon').toLowerCase().includes(category.toLowerCase()) || b.name.toLowerCase().includes(category.toLowerCase())
    return matchesSearch && matchesCat
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto p-6">
        {/* HEADER WITH SECRET */}
        <h1
          onMouseDown={startPress} onMouseUp={endPress}
          onTouchStart={startPress} onTouchEnd={endPress}
          className="text-5xl font-black tracking-tight select-none text-center mt-4"
        >HustleHub</h1>
        <p className="text-zinc-500 text-center text-sm mt-2">Find & book any hustle near you ✅</p>
        <p className="text-zinc-700 text-[10px] text-center mt-1">Hold logo for owner access</p>

        {/* SEARCH */}
        <div className="mt-6 relative">
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search salons, dog parlor, nails..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 px-6 pl-12 text-white placeholder:text-zinc-600 outline-none focus:border-white"
          />
          <span className="absolute left-4 top-4.5">🔍</span>
        </div>

        {/* CATEGORIES */}
        <div className="flex gap-2 overflow-x-auto mt-4 pb-2 no-scrollbar">
          {categories.map(c=>(
            <button key={c} onClick={()=>setCategory(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border ${category===c? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* BUSINESSES */}
        <div className="mt-6 grid gap-3">
          {filtered.map(b=>(
            <a key={b.id} href={`/${b.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl">{b.name[0]}</div>
              <div className="flex-1">
                <p className="font-bold text-lg">{b.name}</p>
                <p className="text-xs text-zinc-500">{b.category||'Salon'} • {b.location_text||'Benoni'}</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full">⭐ 4.8</span>
                  <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full">Open now</span>
                </div>
              </div>
              <div className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center">→</div>
            </a>
          ))}
          {filtered.length===0 && <p className="text-center text-zinc-600 mt-10">No results. Add a new business in Supabase.</p>}
        </div>

        {/* ADD BUSINESS CARD FOR FUTURE */}
        <div className="mt-8 border border-dashed border-zinc-700 rounded-[24px] p-6 text-center">
          <p className="font-bold">Want to add your hustle?</p>
          <p className="text-xs text-zinc-500 mt-1">Salons, barbers, dog parlors, nail techs</p>
          <a href="https://wa.me/your-number" className="inline-block mt-3 bg-yellow-400 text-black px-6 py-2 rounded-full font-black text-sm">List your business</a>
        </div>

        <p className="text-center text-zinc-700 text-[10px] mt-10">Benoni • HustleHub v1</p>
      </div>
    </div>
  )
}
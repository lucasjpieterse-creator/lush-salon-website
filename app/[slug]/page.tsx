import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: business } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle()
  if (!business) notFound()
  const { data: services } = await supabase.from('services').select('*').eq('business_id', business.id).order('price')

  const wa = (service?: string) => {
    const msg = service ? `Hi ${business.name}! I want to book ${service} in Secunda` : `Hi ${business.name}! I found you on HustleHub`
    return `https://wa.me/${business.whatsapp_number}?text=${encodeURIComponent(msg)}`
  }

  return (
  <div className="min-h-screen bg-[#0a0a0a] text-white">
    <div className="bg-yellow-400 text-black text-center py-2 font-black text-xs tracking-widest sticky top-0 z-50">
      🚧 DEMO SITE — by HustleHub for portfolio • Not the real Glamour Locks • Bookings are tests
    </div>
      {/* HERO */}
      <div className="relative h-[55vh] w-full">
        <img 
          src={business.cover_image_url || "https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=1000"} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 p-6 w-full max-w-3xl mx-auto left-0 right-0">
          <h1 className="text-4xl font-black">{business.name}</h1>
          <p className="text-zinc-300 mt-2">{business.description}</p>
          <p className="text-zinc-400 text-sm mt-1">📍 {business.location_text} • ⭐ 4.9 (127 reviews)</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 -mt-10 relative z-10">
          <a href={wa()} target="_blank" className="bg-[#25D366] text-black font-bold py-4 rounded-2xl text-center">WhatsApp Us</a>
          <a href={`tel:${business.phone || business.whatsapp_number}`} className="bg-zinc-800 border border-zinc-700 py-4 rounded-2xl text-center font-bold">Call</a>
        </div>

        {/* SERVICES - NOW GOES TO BOOKING PAGE WITH STYLIST */}
        <h2 className="text-xl font-bold mt-10 mb-4">Services & Pricing</h2>
        <div className="grid gap-3">
          {services?.map((s: any) => (
            <Link key={s.id} href={`/${slug}/book?service=${encodeURIComponent(s.name)}`} className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center hover:border-[#25D366] hover:bg-zinc-800 transition">
              <div className="flex gap-3 items-center">
                <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=100" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <p className="font-semibold group-hover:text-white">{s.name}</p>
                  <p className="text-xs text-zinc-500">{s.duration_minutes} min • Choose stylist & time</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-lg">R{s.price}</p>
                <p className="text-xs text-[#25D366] font-bold">BOOK →</p>
              </div>
            </Link>
          ))}
        </div>

        {/* GALLERY */}
        <h2 className="text-xl font-bold mt-10 mb-4">Gallery</h2>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => (
            <img key={i} src={`https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=300`} className="h-28 w-full object-cover rounded-xl" />
          ))}
        </div>

        <div className="mt-10 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">DEMO PAGE • Live on HustleHub • Secunda</p>
          <p className="text-sm font-bold mt-1">{business.name} • {business.location_text}</p>
        </div>
      </div>

      {/* FLOATING WA */}
      <a href={wa()} target="_blank" className="fixed bottom-6 right-6 bg-[#25D366] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-xl">💬</a>
    </div>
  )
}
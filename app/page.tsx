"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Business = {
  id: string
  name: string
  category: string
  description: string
  phone?: string
  whatsapp?: string
  image_url?: string
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBusinesses() {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
      } else {
        setBusinesses(data || [])
      }
      setLoading(false)
    }
    fetchBusinesses()
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Loading businesses...</div>
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2">HustleHub Secunda</h1>
      <p className="text-gray-600 mb-6">Local businesses in Secunda</p>

      {businesses.length === 0 ? (
        <p>No businesses found. Check Supabase.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz) => (
            <div key={biz.id} className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-bold text-lg">{biz.name}</h2>
              <p className="text-sm text-purple-600">{biz.category}</p>
              <p className="text-sm text-gray-600 mt-2">{biz.description}</p>
              {biz.phone && <p className="text-sm mt-2">📞 {biz.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
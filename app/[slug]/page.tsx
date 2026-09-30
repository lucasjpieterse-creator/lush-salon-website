"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function BookingPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).single();
      if (biz) {
        setBusiness(biz);
        const { data: servs } = await supabase.from('services').select('*').eq('business_id', biz.id);
        setServices(servs || []);
      }
    }
    load();
  }, [slug]);

  async function handleBook() {
    if (!selected || !name || !phone) return alert('Fill name, phone and select service');
    setLoading(true);
    try {
      // 1. Save booking to Supabase
      await supabase.from('bookings').insert({
        business_id: business.id,
        service_name: selected.name,
        service_price: selected.price,
        customer_name: name,
        customer_phone: phone,
        status: 'confirmed'
      });

      // 2. Send WhatsApp confirmation
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone, // sends to CUSTOMER
          service: selected.name,
          price: selected.price,
          business: business.name
        })
      });

      // 3. Also notify owner
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: business.whatsapp,
          service: `${selected.name} - booked by ${name} (${phone})`,
          price: selected.price,
          business: `NEW BOOKING for ${business.name}`
        })
      });

      alert(`✅ Booked ${selected.name} at ${business.name}! WhatsApp sent to ${phone}`);
    } catch (e: any) {
      alert('Booking failed: ' + e.message);
    }
    setLoading(false);
  }

  if (!business) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">{business.name}</h1>
      <p className="text-gray-600">{business.category}</p>

      <div className="mt-6 space-y-3">
        {services.map(s => (
          <button key={s.id} onClick={() => setSelected(s)}
            className={`w-full p-4 border rounded-xl text-left ${selected?.id === s.id ? 'bg-black text-white' : 'bg-white'}`}>
            <div className="flex justify-between"><span>{s.name}</span><span>R{s.price}</span></div>
          </button>
        ))}
      </div>

      <input placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} className="w-full mt-6 p-3 border rounded-xl" />
      <input placeholder="Your WhatsApp e.g. 0821234567" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full mt-3 p-3 border rounded-xl" />

      <button onClick={handleBook} disabled={loading} className="w-full mt-4 p-4 bg-black text-white rounded-xl font-bold">
        {loading ? 'Booking...' : selected ? `Book ${selected.name} - R${selected.price}` : 'Select a service'}
      </button>
    </div>
  );
}
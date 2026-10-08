"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function JoinPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.target);

    const { error } = await supabase.from("businesses").insert({
      slug: String(form.get("name")).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: form.get("name"),
      owner_name: form.get("owner"),
      category: form.get("category"),
      base_price: Number(form.get("price")),
      whatsapp: form.get("whatsapp"),
    });

    setLoading(false);
    if (!error) {
      setDone(true);
    } else {
      alert("Error: " + error.message + "\n\nGo Supabase > Table > businesses > Turn OFF RLS or add policy: Allow INSERT for anon");
      console.log(error);
    }
  }

  if (done) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-4xl font-black">🔥 Sent!</h1>
        <p className="mt-4 text-zinc-400">We got your application. Check WhatsApp in 24h.</p>
        <a href="/" className="mt-6 inline-block bg-white text-black px-6 py-3 rounded-full font-bold">Back Home</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
      <a href="/" className="text-zinc-500">← Back</a>
      <h1 className="text-3xl font-bold mt-6">List Your Hustle</h1>
      <p className="text-zinc-400 mt-2">Secunda — get bookings via WhatsApp.</p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input name="name" required placeholder="Business Name" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 outline-none" />
        <input name="owner" required placeholder="Your Name" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 outline-none" />
        <select name="category" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <option>Barber</option><option>Braids</option><option>Nails</option><option>Pet Grooming</option><option>Car Wash</option><option>Other</option>
        </select>
        <input name="whatsapp" required placeholder="WhatsApp 2782..." className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 outline-none" />
        <input name="price" type="number" required placeholder="Starting Price (120)" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 outline-none" />
        <button disabled={loading} className="bg-white text-black p-4 rounded-full font-bold mt-2">
          {loading? "Sending..." : "Submit →"}
        </button>
      </form>
    </div>
  );
}
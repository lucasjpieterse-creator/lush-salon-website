"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.target);

    const name = form.get("name") as string;
    const category = form.get("category") as string;
    const whatsapp = form.get("whatsapp") as string;
    const business_password = form.get("business_password") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.floor(Math.random() * 1000);
    
    const payload = {
      name,
      slug,
      category,
      location: form.get("location") || "Secunda",
      whatsapp,
      phone: whatsapp,
      whatsapp_number: whatsapp,
      price: Number(form.get("price")) || 0,
      base_price: Number(form.get("price")) || 0,
      pricing_type: form.get("pricing_type") || "fixed",
      owner_name: form.get("owner_name"),
      business_password: business_password,
      manager_pin: business_password, // Set manager PIN to password
      verified: false,
      is_approved: false, // REQUIRES CEO LUCAS APPROVAL IN /ceo TO GO LIVE
    };

    const { error } = await supabase.from("businesses").insert(payload);
    
    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      // Dispatch Automated WhatsApp Alert to CEO Lucas
      const ceoPhone = "27721234567"; // Replace with your phone number (e.g., 2772...)
      const ceoAlertMsg = `🚨 NEW HUSTLE REGISTRATION - HustleHub Secunda\n\n🏢 Business: ${name}\n📂 Category: ${category}\n📱 WhatsApp: ${whatsapp}\n🔑 Slug: ${slug}\n\nReview & Approve Listing:\nhttps://hustlehubsecunda.co.za/ceo`;

      try {
        await fetch("/api/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: ceoPhone, message: ceoAlertMsg }),
        });
      } catch (err) {
        console.error("WhatsApp alert to CEO failed:", err);
      }

      alert(
        `✅ Registration Submitted!\n\nSAVE THIS:\nSlug: ${slug}\nPassword: ${business_password}\n\nYour application has been sent to CEO Lucas for approval. You will receive a WhatsApp notification as soon as your listing goes live on the directory!`
      );
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-zinc-500 text-xs underline">← Back</Link>
        <h1 className="font-black text-[28px] mt-4 leading-none">Add Your Hustle 🚀</h1>
        <p className="text-zinc-500 text-sm mt-2">Get booked in Secunda. Set a password so other owners can't see you.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input name="name" required placeholder="Business Name (e.g. Fade Masters)" className="w-full bg-[#111] border border-[#222] rounded-full px-5 py-3.5 text-sm" />
          
          <div className="grid grid-cols-2 gap-3">
            <select name="category" required className="w-full bg-[#111] border border-[#222] rounded-full px-5 py-3.5 text-sm">
              <option value="">Category</option>
              <option value="Barber">💈 Barber</option>
              <option value="Hair & Beauty">💇‍♀️ Hair & Beauty</option>
              <option value="Nails">💅 Nails</option>
              <option value="Auto Care">🚗 Auto Care</option>
              <option value="Towing">🚛 Towing</option>
              <option value="Pet Care">🐶 Pet Care</option>
              <option value="Handyman">🔧 Handyman</option>
              <option value="Custom Cakes">🍰 Custom Cakes</option>
              <option value="Massage">💆 Massage</option>
            </select>
            <select name="pricing_type" required className="w-full bg-[#111] border border-[#222] rounded-full px-5 py-3.5 text-sm">
              <option value="fixed">Fixed Price</option>
              <option value="variable">From Price (Estimate)</option>
              <option value="custom">Custom Quote</option>
            </select>
          </div>

          <input name="owner_name" required placeholder="Your Name" className="w-full bg-[#111] border border-[#222] rounded-full px-5 py-3.5 text-sm" />
          <input name="whatsapp" required placeholder="WhatsApp Number (e.g. 27712345678)" className="w-full bg-[#111] border border-[#222] rounded-full px-5 py-3.5 text-sm" />
          <input name="price" type="number" placeholder="Starting Price (e.g. 150) - leave 0 for Custom Quote" className="w-full bg-[#111] border border-[#222] rounded-full px-5 py-3.5 text-sm" />
          <input name="location" placeholder="Location (default Secunda)" className="w-full bg-[#111] border border-[#222] rounded-full px-5 py-3.5 text-sm" />

          {/* PASSWORD */}
          <div className="pt-2">
            <label className="text-[11px] font-bold text-zinc-400 ml-2">🔒 SET BUSINESS PASSWORD</label>
            <input name="business_password" type="password" required placeholder="Password to access your Manager" className="w-full bg-[#1A1A1A] border border-amber-500/20 rounded-full px-5 py-3.5 text-sm mt-1 focus:border-amber-500/50 focus:outline-none" />
            <p className="text-[11px] text-zinc-500 ml-2 mt-1">You will use this + your slug to login at /manager</p>
          </div>

          <button disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-full text-sm mt-4 disabled:opacity-50">
            {loading ? "Submitting Application..." : "Submit Hustle for Approval →"}
          </button>
        </form>
      </div>
    </main>
  );
}
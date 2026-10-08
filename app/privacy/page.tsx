import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans p-6 md:p-12 max-w-4xl mx-auto">
      <Link href="/" className="text-xs text-zinc-500 hover:text-white transition">← Back to HustleHub Secunda</Link>
      
      <h1 className="text-3xl font-black text-white mt-4 mb-2">POPIA Privacy Policy</h1>
      <p className="text-xs text-zinc-500 mb-8">Compliant with the Protection of Personal Information Act (POPIA) of South Africa</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-2">1. Information We Collect</h2>
          <p>
            To facilitate local bookings and automated WhatsApp confirmations, we collect minimal personal information, including:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-zinc-400">
            <li>Full Name</li>
            <li>Cell Phone / WhatsApp Number</li>
            <li>Appointment Time & Service Selection</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">2. How We Use Your Personal Data</h2>
          <p>
            Your data is strictly processed to fulfill your booking request, transmit automated WhatsApp receipts, send reminder notifications, and allow service providers in Secunda to contact you regarding your appointment. We <strong className="text-white">never</strong> sell or share customer contact details with third-party advertisers.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">3. Data Storage & Security</h2>
          <p>
            All records are stored securely using encrypted cloud database infrastructure (Supabase) and processed via official Meta WhatsApp Business Cloud APIs.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">4. Your POPIA Rights</h2>
          <p>
            In terms of POPIA, you have the right to request access to your stored personal data, request corrections, or request complete deletion of your booking history from our servers by contacting support at support@hustlehubsecunda.co.za.
          </p>
        </div>
      </section>
    </div>
  );
}
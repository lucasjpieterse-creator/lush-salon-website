import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans p-6 md:p-12 max-w-4xl mx-auto">
      <Link href="/" className="text-xs text-zinc-500 hover:text-white transition">← Back to HustleHub Secunda</Link>
      
      <h1 className="text-3xl font-black text-white mt-4 mb-2">Terms & Conditions</h1>
      <p className="text-xs text-zinc-500 mb-8">Last Updated: October 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-white mb-2">1. Platform Intermediary Status</h2>
          <p>
            HustleHub Secunda operates solely as an online booking and connection marketplace matching customers with independent local service providers ("Hustlers") in Secunda, Evander, and Trichardt. HustleHub Secunda is not a direct provider of services, does not employ service providers, and is not an agent for any business listed.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">2. Limitation of Liability</h2>
          <p>
            HustleHub Secunda is not liable for any injury, loss, physical damage, poor workmanship, missed appointments, or disputes arising between clients and service providers. All service quality, guarantees, and safety remain the sole responsibility of the respective service provider.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">3. Bookings & Deposits</h2>
          <p>
            Bookings made through HustleHub Secunda are confirmed once transmitted via our platform or automated WhatsApp notifications. Any deposits paid online are processed securely through accredited South African payment processors. Cancellations and refunds are governed by the specific provider's cancellation policy and the South African Consumer Protection Act (CPA).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">4. User Conduct</h2>
          <p>
            Users agree to provide accurate names, contact numbers, and appointment details. HustleHub Secunda reserves the right to suspend users or businesses attempting fraudulent bookings or misrepresenting identity.
          </p>
        </div>
      </section>
    </div>
  );
}
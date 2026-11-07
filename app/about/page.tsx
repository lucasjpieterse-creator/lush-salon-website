import Link from "next/link";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <main className="flex-1 max-w-3xl mx-auto p-6 pt-12 space-y-6">
        <Link href="/" className="text-xs font-mono text-cyan-400 hover:underline">
          ← Back to Directory
        </Link>
        
        <h1 className="text-3xl font-black text-white font-mono">About TekSBook</h1>
        
        <p className="text-sm text-zinc-300 leading-relaxed">
          TekSBook is Secunda’s premier digital directory connecting local residents directly with trusted, high-quality service providers across Secunda, Evander, Trichardt, and Kinross.
        </p>

        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-cyan-400 font-mono">Why TekSBook?</h2>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
            <li>Instant online bookings directly with local businesses.</li>
            <li>Automated WhatsApp booking status notifications.</li>
            <li>Curated local specialists — tree felling, auto care, beauty, and more.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
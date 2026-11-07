import Link from "next/link";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <main className="flex-1 max-w-3xl mx-auto p-6 pt-12 space-y-6">
        <Link href="/" className="text-xs font-mono text-cyan-400 hover:underline">
          ← Back to Directory
        </Link>
        
        <h1 className="text-3xl font-black text-white font-mono">Contact Support</h1>
        
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-zinc-300">
            Have questions about listing your business or an existing booking? Reach out to our team:
          </p>

          <div className="text-xs font-mono space-y-2 text-zinc-400">
            <p><strong className="text-white">Email:</strong> support@teksbooksecunda.co.za</p>
            <p><strong className="text-white">Region:</strong> Secunda, Mpumalanga, South Africa</p>
            <p><strong className="text-white">WhatsApp Support:</strong> +27 65 075 3499</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
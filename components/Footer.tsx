import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a0a] border-t border-zinc-800/80 py-8 px-6 font-mono text-zinc-400 text-xs mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-sm">TekSBook Secunda</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            On-Demand Local Service Directory — Secunda, Evander & Trichardt
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <Link href="/about" className="hover:text-cyan-400 transition">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-cyan-400 transition">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-cyan-400 transition">
            Terms of Service
          </Link>
        </div>

        <div className="text-right text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} TekSBook. All rights reserved.</p>
          <p className="mt-0.5 text-zinc-400">support@teksbooksecunda.co.za</p>
        </div>
      </div>
    </footer>
  );
}
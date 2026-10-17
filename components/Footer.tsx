// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-black py-8 px-4 text-zinc-400 text-xs mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-white text-sm">TekSBook</p>
          <p className="text-zinc-500 mt-0.5">
            Local B2B Directory • Secunda, Evander, Trichardt & Kinross
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-zinc-400">
          <a
            href="https://wa.me/27650753499?text=Hi%20TekSBook,%20I'd%20like%20to%20inquire%20about%20a%20listing."
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
          >
            💬 WhatsApp: 065 075 3499
          </a>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            🔒 POPIA Compliant
          </span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-zinc-900 text-center text-[10px] text-zinc-600">
        © {new Date().getFullYear()} TekSBook. All rights reserved.
      </div>
    </footer>
  );
}
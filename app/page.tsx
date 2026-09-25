export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black">HustleHub</h1>
      <p className="text-zinc-500 mt-2">Your booking platform is live ✅</p>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
        <a href="/glamourlocks" className="bg-white text-black py-3 rounded-full font-bold text-center">Glamour Locks Page</a>
        <a href="/glamourlocks/book" className="bg-zinc-900 border border-zinc-800 py-3 rounded-full font-bold text-center">Book Now</a>
        <a href="/glamourlocks/manager" className="bg-yellow-400 text-black py-3 rounded-full font-black text-center">Manager Dashboard →</a>
      </div>
    </div>
  )
}
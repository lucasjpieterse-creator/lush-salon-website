import Link from 'next/link'

// ===== SALON CONFIG - CHANGE THIS FOR EACH CLIENT =====
const SALON = {
  name: "Lush Salon", // Change per client
  tagline: "Premium hair styling in the heart of Secunda",
  city: "Secunda, Mpumalanga",
  hours: "Mon-Sat, 9am-6pm",
  whatsapp: "27725023999", // Replace with client's number
  demoMode: true, // Set to false when client goes live
}

const services = [
  { name: "Women's Cut & Style", price: "R350", desc: "Consultation, wash, cut & blow dry" },
  { name: "Men's Cut", price: "R200", desc: "Classic or modern cut with style" },
  { name: "Color & Highlights", price: "From R650", desc: "Full color, balayage, or highlights" },
  { name: "Treatment & Blow Dry", price: "R280", desc: "Deep conditioning + professional styling" },
]

const galleryImages = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=500",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500",
]
// ===== END CONFIG =====

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Demo Banner */}
      {SALON.demoMode && (
        <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-semibold">
          ⚠️ DEMO SITE - This is a template preview. Not taking real bookings yet.
        </div>
      )}

      {/* Hero */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-rose-400 to-pink-600 bg-clip-text text-transparent">
            {SALON.name}
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            {SALON.tagline}. Book your transformation today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="#booking"
              className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition"
            >
              Book Now
            </Link>
            <Link href="#services" className="text-sm font-semibold leading-6 text-neutral-300 hover:text-white">
              View Services <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 sm:py-32 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
            <p className="mt-4 text-lg text-neutral-400">Expert styling tailored to you</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-2">
            {services.map((service) => (
              <div key={service.name} className="flex flex-col rounded-2xl bg-neutral-900 p-8 ring-1 ring-neutral-800">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <p className="text-lg font-semibold text-rose-400">{service.price}</p>
                </div>
                <p className="mt-4 text-neutral-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 sm:py-32 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Work</h2>
            <p className="mt-4 text-lg text-neutral-400">Real results from {SALON.name}</p>
          </div>
          <div className="mx-auto mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {galleryImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Salon work ${i + 1}`}
                className="aspect-square w-full rounded-xl object-cover hover:opacity-80 transition"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="booking" className="bg-neutral-900 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready for your new look?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-300">
            We're open {SALON.hours}. Located in {SALON.city}.
          </p>
          <div className="mt-10">
            <Link
              href={`https://wa.me/${SALON.whatsapp}`}
              target="_blank"
              className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition"
            >
              {SALON.demoMode ? "WhatsApp Demo - Not Live" : "WhatsApp Us to Book"}
            </Link>
          </div>
          {SALON.demoMode && (
            <p className="mt-4 text-sm text-yellow-500">
              Demo mode: Replace this number before launching
            </p>
          )}
        </div>
      </section>

            {/* Your Work / Lead Capture */}
      <section className="px-6 py-16 lg:px-8 bg-neutral-900/50">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-2xl font-bold">Salon Owner? Get a site like this</h3>
          <p className="mt-4 text-neutral-400">
            I build fast, mobile-friendly websites for salons in Secunda & Mpumalanga. 
            Live in 24 hours. From R500 setup.
          </p>
          <div className="mt-6">
            <Link
              href="https://wa.me/27725023999"
              target="_blank"
              className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 transition"
            >
              WhatsApp Me for a Quote
            </Link>
          </div>
          <p className="mt-4 text-xs text-neutral-600">Demo template by Lucas</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-neutral-500">
          <p>© 2026 {SALON.name}, {SALON.city}. {SALON.demoMode && "Demo Template by Lucas"}</p>
        </div>
      </footer>
    </main>
  )
}
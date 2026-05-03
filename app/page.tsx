import Link from 'next/link'

export default function Home() {
  const services = [
    { name: "Women's Cut & Style", price: "R350", desc: "Consultation, wash, cut & blow dry" },
    { name: "Men's Cut", price: "R200", desc: "Classic or modern cut with style" },
    { name: "Color & Highlights", price: "From R650", desc: "Full color, balayage, or highlights" },
    { name: "Treatment & Blow Dry", price: "R280", desc: "Deep conditioning + professional styling" },
  ]

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-rose-400 to-pink-600 bg-clip-text text-transparent">
            Lush Salon
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            Premium hair styling in the heart of Secunda. Book your transformation today.
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

      {/* CTA */}
      <section id="booking" className="bg-neutral-900 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready for your new look?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-300">
            We're open Mon-Sat, 9am-6pm. Located in Secunda, Mpumalanga.
          </p>
          <div className="mt-10">
            <Link
              href="https://wa.me/27725023999"
              target="_blank"
              className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition"
            >
              WhatsApp Us to Book
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-neutral-500">
          <p>© 2026 Lush Salon, Secunda. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if user already has a business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (business) {
      redirect('/dashboard')
    } else {
      redirect('/setup')
    }
  }

  // For SEO crawlers and first-time visitors — show landing content
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DocExpiry',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    description:
      'Track business license and document expiry dates. Get WhatsApp reminders before renewals are due.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight max-w-md md:text-4xl">
            Never pay a fine for a forgotten license again.
          </h1>
          <h2 className="mt-4 text-lg text-gray-600 max-w-sm">
            Track all your business documents in one place. Free WhatsApp reminders.
          </h2>
          <Link
            href="/setup"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-semibold text-white active:bg-blue-700 transition-colors"
          >
            Start tracking — it&apos;s free
          </Link>
          <p className="mt-3 text-sm text-gray-400">No login required. Takes 60 seconds.</p>
        </section>

        {/* Business types */}
        <section className="bg-gray-50 px-6 py-12">
          <div className="mx-auto max-w-lg">
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-6">
              Works for all kinds of businesses
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              {[
                '🍽️ Restaurants & Dhabas',
                '🏥 Medical Clinics',
                '🏪 Retail Shops',
                '🚛 Transport & Fleet',
                '👷 Contractors',
                '📋 Any business',
              ].map((item) => (
                <div key={item} className="rounded-lg bg-white p-3 text-center shadow-sm border border-gray-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-lg">
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-6">
              How it works
            </h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Add your business', desc: 'Select your business type and name.' },
                { step: '2', title: 'Add documents', desc: 'FSSAI, Fire NOC, GST — just pick and set expiry dates.' },
                { step: '3', title: 'Get WhatsApp reminders', desc: 'We remind you at 90, 30, 7, and 1 day before expiry.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ for SEO */}
        <section className="bg-gray-50 px-6 py-12">
          <div className="mx-auto max-w-lg">
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-6">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <details className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                <summary className="font-medium text-gray-900 cursor-pointer">What is FSSAI license renewal?</summary>
                <p className="mt-2 text-sm text-gray-600">FSSAI (Food Safety and Standards Authority of India) license must be renewed before expiry. Late renewal can result in fines up to ₹5 lakhs and closure of your food business.</p>
              </details>
              <details className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                <summary className="font-medium text-gray-900 cursor-pointer">How often does a Fire NOC need renewal?</summary>
                <p className="mt-2 text-sm text-gray-600">Fire NOC (No Objection Certificate) typically needs annual renewal. Requirements vary by state. Operating without a valid Fire NOC can lead to heavy fines and business closure.</p>
              </details>
              <details className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                <summary className="font-medium text-gray-900 cursor-pointer">Is DocExpiry free to use?</summary>
                <p className="mt-2 text-sm text-gray-600">Yes, DocExpiry is completely free. Track unlimited documents and get WhatsApp reminders at no cost.</p>
              </details>
              <details className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                <summary className="font-medium text-gray-900 cursor-pointer">Do I need to create an account?</summary>
                <p className="mt-2 text-sm text-gray-600">No! You can start adding documents immediately without any signup. Just add your WhatsApp number later when you want reminders.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} DocExpiry. Made for Indian small businesses.</p>
        </footer>
      </main>
    </>
  )
}

import type { Metadata } from 'next'
import SetupForm from './SetupForm'

export const metadata: Metadata = {
  title: 'Set up your business',
  robots: { index: false, follow: false },
}

export default function SetupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Let&apos;s get started
        </h1>
        <SetupForm />
      </div>
    </main>
  )
}

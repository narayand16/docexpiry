import type { Metadata } from 'next'
import AddDocumentForm from './AddDocumentForm'

export const metadata: Metadata = {
  title: 'Add Document',
  robots: { index: false, follow: false },
}

export default function AddDocumentPage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-8 pb-24">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add a document</h1>
        <AddDocumentForm />
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import EditDocumentForm from './EditDocumentForm'

export const metadata: Metadata = {
  title: 'Edit Document',
  robots: { index: false, follow: false },
}

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="flex flex-1 flex-col px-6 py-8 pb-24">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit document</h1>
        <EditDocumentForm documentId={id} />
      </div>
    </main>
  )
}

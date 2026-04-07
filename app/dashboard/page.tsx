import type { Metadata } from 'next'
import DashboardContent from './DashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return <DashboardContent />
}

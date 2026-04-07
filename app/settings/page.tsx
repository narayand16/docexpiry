import type { Metadata } from 'next'
import SettingsContent from './SettingsContent'

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
}

export default function SettingsPage() {
  return <SettingsContent />
}

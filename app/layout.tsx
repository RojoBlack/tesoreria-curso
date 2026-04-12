import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tesorería 1°B · 2026',
  description: 'Gestión de fondos del curso escolar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

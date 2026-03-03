import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Momentum — Ваш путь к продуктивности',
  description: 'Платформа для управления проектами и задачами. Повышайте эффективность с Momentum.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

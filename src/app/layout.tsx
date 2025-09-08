import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TelegramScript from '@/components/TelegramScript'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChibletsLite - Idle Chiblet Adventure',
  description: 'Collect cute chiblets, battle monsters, and level up in this adorable idle game!',
  other: {
    'telegram-web-app': 'true',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <TelegramScript />
      </head>
      <body className={`${inter.className} bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

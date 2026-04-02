import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/auth-context'
import { Header } from '@/components/header'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: 'CarRental - Find Your Perfect Rental Car',
  description: 'Discover the freedom of the open road with our premium selection of vehicles. Easy booking, competitive prices, and exceptional service.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen bg-background">
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

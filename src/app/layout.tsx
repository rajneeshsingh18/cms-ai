import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from "@/components/ui/sonner"; // Import the Toaster

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        <body className="min-h-screen bg-background antialiased">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
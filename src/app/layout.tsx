import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { APP_NAME, APP_URL } from '@/lib/utils/constants'
import { ThemeProvider } from '@/context/theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - AI Real Estate Ad Copy Generator`,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Turn property details into high-converting social media ads in seconds. Powered by AI. No prompt engineering skills required.',
  keywords: ['real estate', 'AI copywriting', 'social media ads', 'property marketing', 'Instagram ads', 'TikTok scripts'],
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: `${APP_NAME} - AI Real Estate Ad Copy Generator`,
    description: 'Turn property details into high-converting social media ads in seconds.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
       <ThemeProvider>
        <AuthProvider>
           <Navbar />
           <main className="min-h-screen">
            {children}
          </main>
         <Footer />
        </AuthProvider>
       </ThemeProvider>
      </body>
    </html>
  )
}
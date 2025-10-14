import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'MELLOWBRICKS - GitHub Portfolio',
    template: '%s | MELLOWBRICKS'
  },
  description: 'Explore my GitHub repositories, contributions, and projects. Full-stack developer passionate about creating innovative solutions.',
  keywords: ['GitHub', 'Portfolio', 'Developer', 'React', 'Next.js', 'TypeScript', 'Full Stack'],
  authors: [{ name: 'MELLOWBRICKS' }],
  creator: 'MELLOWBRICKS',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'MELLOWBRICKS - GitHub Portfolio',
    description: 'Explore my GitHub repositories, contributions, and projects.',
    siteName: 'MELLOWBRICKS Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MELLOWBRICKS GitHub Portfolio'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MELLOWBRICKS - GitHub Portfolio',
    description: 'Explore my GitHub repositories, contributions, and projects.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'your-google-verification-code'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "MELLOWBRICKS",
              "url": "https://your-domain.com",
              "sameAs": [
                "https://github.com/MELLOWBRICKS",
                "https://www.mellowbricks.co.in"
              ],
              "jobTitle": "Full Stack Developer",
              "worksFor": {
                "@type": "Organization",
                "name": "Your Company"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

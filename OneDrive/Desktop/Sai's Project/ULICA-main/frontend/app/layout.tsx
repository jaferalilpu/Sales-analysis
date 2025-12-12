import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
// import { ErrorBoundary } from '@/components/ErrorBoundary';

// Validate environment variables on startup (server-side only)
if (typeof window === 'undefined') {
  try {
    // Validate NEXT_PUBLIC_BACKEND_URL is set
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      
    }
  } catch (error) {
    // Silently fail in development, but log in production
    if (process.env.NODE_ENV === 'production') {
      
    }
  }
}

export const metadata: Metadata = {
  title: {
    default: 'ULICA - Streetwear Fashion Brand',
    template: '%s | ULICA'
  },
  description: 'Discover the latest streetwear drops from ULICA. Premium quality fashion with bold designs for the modern lifestyle.',
  keywords: ['streetwear', 'fashion', 'clothing', 'ULICA', 'urban', 'style', 'drops'],
  authors: [{ name: 'ULICA Team' }],
  creator: 'ULICA',
  publisher: 'ULICA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ULICA - Streetwear Fashion Brand',
    description: 'Discover the latest streetwear drops from ULICA. Premium quality fashion with bold designs for the modern lifestyle.',
    siteName: 'ULICA',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ULICA - Streetwear Fashion Brand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ULICA - Streetwear Fashion Brand',
    description: 'Discover the latest streetwear drops from ULICA. Premium quality fashion with bold designs for the modern lifestyle.',
    images: ['/og-image.jpg'],
    creator: '@ulica',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            }
          `
        }} />
      </head>
      <body className="antialiased pb-16 md:pb-0" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}

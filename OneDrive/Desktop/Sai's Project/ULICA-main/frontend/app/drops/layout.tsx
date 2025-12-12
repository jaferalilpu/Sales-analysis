import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Drops - Exclusive Releases | ULICA',
  description: 'Discover exclusive product drops and limited edition releases from ULICA. Get early access to new collections and special releases.',
  keywords: ['drops', 'exclusive', 'limited edition', 'releases', 'ULICA', 'streetwear', 'fashion'],
  openGraph: {
    type: 'website',
    title: 'Drops - Exclusive Releases | ULICA',
    description: 'Discover exclusive product drops and limited edition releases from ULICA.',
    siteName: 'ULICA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drops - Exclusive Releases | ULICA',
    description: 'Discover exclusive product drops and limited edition releases from ULICA.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DropsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

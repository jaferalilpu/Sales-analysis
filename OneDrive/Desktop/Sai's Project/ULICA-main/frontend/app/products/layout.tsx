import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products - Shop All Items | ULICA',
  description: 'Browse our complete collection of premium streetwear. Discover the latest drops, exclusive designs, and limited edition pieces at ULICA.',
  keywords: ['products', 'streetwear', 'fashion', 'clothing', 'ULICA', 'shop', 'collection'],
  openGraph: {
    type: 'website',
    title: 'Products - Shop All Items | ULICA',
    description: 'Browse our complete collection of premium streetwear at ULICA.',
    siteName: 'ULICA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products - Shop All Items | ULICA',
    description: 'Browse our complete collection of premium streetwear at ULICA.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

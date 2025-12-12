import { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${backendUrl}/api/products/${params.id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'Product Not Found | ULICA',
        description: 'The product you are looking for could not be found.',
      };
    }

    const data = await response.json();
    const product = data.data?.product;

    if (!product) {
      return {
        title: 'Product Not Found | ULICA',
        description: 'The product you are looking for could not be found.',
      };
    }

    const productTitle = product.title || product.name || 'Product';
    const productDescription = product.description 
      ? (product.description.length > 160 ? product.description.substring(0, 157) + '...' : product.description)
      : `Shop ${productTitle} at ULICA. Premium streetwear fashion.`;
    
    const primaryImage = Array.isArray(product.images) && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
      : '/og-image.jpg';

    const price = product.variants?.[0]?.price || product.price || 0;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app';
    const productUrl = `${siteUrl}/product/${product.slug || product.id}`;

    return {
      title: `${productTitle} | ULICA`,
      description: productDescription,
      keywords: [
        productTitle,
        product.category || 'streetwear',
        'ULICA',
        'fashion',
        'clothing',
        'streetwear',
      ],
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        type: 'website',
        title: `${productTitle} | ULICA`,
        description: productDescription,
        url: productUrl,
        images: [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: productTitle,
          },
        ],
        siteName: 'ULICA',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productTitle} | ULICA`,
        description: productDescription,
        images: [primaryImage],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: 'Product | ULICA',
      description: 'Discover premium streetwear at ULICA.',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// SEO optimization utilities
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  structuredData?: any;
  robots?: string;
  language?: string;
  alternateLanguages?: Array<{
    href: string;
    hreflang: string;
  }>;
}

export interface ProductSEO {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: string;
  brand: string;
  category: string;
  sku: string;
  gtin?: string;
  mpn?: string;
  condition: string;
  rating?: {
    value: number;
    count: number;
  };
}

export class SEOService {
  private baseUrl: string;
  private defaultConfig: Partial<SEOConfig>;

  constructor(baseUrl: string = 'https://ulica.com') {
    this.baseUrl = baseUrl;
    this.defaultConfig = {
      ogType: 'website',
      twitterCard: 'summary_large_image',
      robots: 'index, follow',
      language: 'en',
    };
  }

  /**
   * Generate meta tags for a page
   */
  generateMetaTags(config: SEOConfig): Array<{ name: string; content: string }> {
    const metaTags = [
      { name: 'title', content: config.title },
      { name: 'description', content: config.description },
      { name: 'keywords', content: config.keywords.join(', ') },
      { name: 'robots', content: config.robots || this.defaultConfig.robots! },
      { name: 'language', content: config.language || this.defaultConfig.language! },
      
      // Open Graph tags
      { name: 'og:title', content: config.title },
      { name: 'og:description', content: config.description },
      { name: 'og:type', content: config.ogType || this.defaultConfig.ogType! },
      { name: 'og:url', content: config.canonicalUrl || this.baseUrl },
      { name: 'og:image', content: config.ogImage || `${this.baseUrl}/og-image.jpg` },
      { name: 'og:site_name', content: 'ULICA' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: config.twitterCard || this.defaultConfig.twitterCard! },
      { name: 'twitter:title', content: config.title },
      { name: 'twitter:description', content: config.description },
      { name: 'twitter:image', content: config.ogImage || `${this.baseUrl}/og-image.jpg` },
    ];

    if (config.twitterSite) {
      metaTags.push({ name: 'twitter:site', content: config.twitterSite });
    }

    if (config.twitterCreator) {
      metaTags.push({ name: 'twitter:creator', content: config.twitterCreator });
    }

    return metaTags;
  }

  /**
   * Generate structured data for a product
   */
  generateProductStructuredData(product: ProductSEO): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      category: product.category,
      sku: product.sku,
      gtin: product.gtin,
      mpn: product.mpn,
      condition: product.condition,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: product.availability,
        url: `${this.baseUrl}/product/${product.sku}`,
        seller: {
          '@type': 'Organization',
          name: 'ULICA',
        },
      },
      ...(product.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating.value,
          reviewCount: product.rating.count,
        },
      }),
    };
  }

  /**
   * Generate structured data for an organization
   */
  generateOrganizationStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ULICA',
      url: this.baseUrl,
      logo: `${this.baseUrl}/logo.png`,
      description: 'Premium streetwear and fashion accessories',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Fashion Street',
        addressLocality: 'Mumbai',
        addressRegion: 'Maharashtra',
        postalCode: '400001',
        addressCountry: 'IN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-9876543210',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
      },
      sameAs: [
        'https://www.instagram.com/ulica',
        'https://www.facebook.com/ulica',
        'https://www.twitter.com/ulica',
      ],
    };
  }

  /**
   * Generate structured data for breadcrumbs
   */
  generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${this.baseUrl}${crumb.url}`,
      })),
    };
  }

  /**
   * Generate structured data for a website
   */
  generateWebsiteStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ULICA',
      url: this.baseUrl,
      description: 'Premium streetwear and fashion accessories',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
  }

  /**
   * Generate sitemap data
   */
  generateSitemapData(pages: Array<{ url: string; lastmod: string; changefreq: string; priority: number }>): string {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${this.baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

    return sitemap;
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /
Allow: /products/
Allow: /about/
Allow: /contact/`;
  }

  /**
   * Generate meta tags for a product page
   */
  generateProductMetaTags(product: ProductSEO, category: string): SEOConfig {
    const title = `${product.name} - ${product.brand} | ULICA`;
    const description = `${product.description.substring(0, 160)}...`;
    const keywords = [
      product.name,
      product.brand,
      product.category,
      category,
      'streetwear',
      'fashion',
      'clothing',
      'accessories',
    ];

    return {
      title,
      description,
      keywords,
      canonicalUrl: `${this.baseUrl}/product/${product.sku}`,
      ogImage: product.image,
      ogType: 'product',
      structuredData: this.generateProductStructuredData(product),
    };
  }

  /**
   * Generate meta tags for a category page
   */
  generateCategoryMetaTags(category: string, productCount: number): SEOConfig {
    const title = `${category} - Streetwear & Fashion | ULICA`;
    const description = `Shop the latest ${category.toLowerCase()} collection at ULICA. ${productCount}+ premium streetwear items. Free shipping on orders over ₹999.`;
    const keywords = [
      category,
      'streetwear',
      'fashion',
      'clothing',
      'accessories',
      'premium',
      'style',
    ];

    return {
      title,
      description,
      keywords,
      canonicalUrl: `${this.baseUrl}/category/${category.toLowerCase()}`,
      ogType: 'website',
    };
  }

  /**
   * Generate meta tags for the home page
   */
  generateHomeMetaTags(): SEOConfig {
    const title = 'ULICA - Premium Streetwear & Fashion Accessories';
    const description = 'Discover the latest streetwear and fashion accessories at ULICA. Premium quality, unique designs, and free shipping on orders over ₹999.';
    const keywords = [
      'streetwear',
      'fashion',
      'clothing',
      'accessories',
      'premium',
      'style',
      'trendy',
      'urban',
    ];

    return {
      title,
      description,
      keywords,
      canonicalUrl: this.baseUrl,
      ogType: 'website',
    };
  }

  /**
   * Generate meta tags for a blog post
   */
  generateBlogMetaTags(post: { title: string; excerpt: string; slug: string; publishedAt: string; author: string }): SEOConfig {
    const title = `${post.title} | ULICA Blog`;
    const description = post.excerpt.substring(0, 160);
    const keywords = [
      'fashion',
      'streetwear',
      'style',
      'trends',
      'blog',
      post.title.toLowerCase(),
    ];

    return {
      title,
      description,
      keywords,
      canonicalUrl: `${this.baseUrl}/blog/${post.slug}`,
      ogType: 'article',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        author: {
          '@type': 'Person',
          name: post.author,
        },
        datePublished: post.publishedAt,
        url: `${this.baseUrl}/blog/${post.slug}`,
      },
    };
  }

  /**
   * Generate JSON-LD structured data
   */
  generateJsonLd(data: any): string {
    return `<script type="application/ld+json">
${JSON.stringify(data, null, 2)}
</script>`;
  }

  /**
   * Generate canonical URL
   */
  generateCanonicalUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Generate alternate language links
   */
  generateAlternateLanguageLinks(path: string, languages: string[]): Array<{ href: string; hreflang: string }> {
    return languages.map(lang => ({
      href: `${this.baseUrl}/${lang}${path}`,
      hreflang: lang,
    }));
  }
}

export const seoService = new SEOService();

// Utility functions
export function generateProductSEO(product: any): ProductSEO {
  return {
    name: product.title,
    description: product.description,
    image: product.images[0]?.url || '/placeholder.jpg',
    price: product.variants[0]?.price || 0,
    currency: 'INR',
    availability: product.variants[0]?.stockQty > 0 ? 'InStock' : 'OutOfStock',
    brand: 'ULICA',
    category: product.category,
    sku: product.variants[0]?.sku || product.id,
    condition: 'NewCondition',
    rating: product.rating ? {
      value: product.rating.average,
      count: product.rating.count,
    } : undefined,
  };
}

export function generatePageTitle(title: string, siteName: string = 'ULICA'): string {
  return `${title} | ${siteName}`;
}

export function generateMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

'use client';

import Head from 'next/head';
import { SEOConfig } from '@/lib/seo';

interface SEOHeadProps {
  config: SEOConfig;
}

export function SEOHead({ config }: SEOHeadProps) {
  const {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType,
    twitterCard,
    twitterSite,
    twitterCreator,
    structuredData,
    robots,
    language,
    alternateLanguages,
  } = config;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robots || 'index, follow'} />
      <meta name="language" content={language || 'en'} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType || 'website'} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage || '/og-image.jpg'} />
      <meta property="og:site_name" content="ULICA" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || '/og-image.jpg'} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      
      {/* Alternate Language Links */}
      {alternateLanguages?.map((alt) => (
        <link
          key={alt.hreflang}
          rel="alternate"
          hrefLang={alt.hreflang}
          href={alt.href}
        />
      ))}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
}

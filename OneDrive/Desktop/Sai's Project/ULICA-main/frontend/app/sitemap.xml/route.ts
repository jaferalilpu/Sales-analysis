import { NextResponse } from 'next/server';
import { SEOService } from '@/lib/seo';
import { getBackendUrl, getFrontendUrl } from '@/lib/api-config';

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    const siteUrl = getFrontendUrl();
    const seoService = new SEOService(siteUrl);
    
    // Static pages
    const staticPages = [
      { url: '/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
      { url: '/products', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.9 },
      { url: '/drops', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.9 },
      { url: '/cart', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.7 },
      { url: '/wishlist', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.7 },
      { url: '/dashboard', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.6 },
    ];

    // Fetch active products from backend
    let productPages: Array<{ url: string; lastmod: string; changefreq: string; priority: number }> = [];
    try {
      const productsResponse = await fetch(`${backendUrl}/api/products?limit=1000&page=1`, {
        cache: 'no-store',
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products = productsData.success 
          ? (productsData.data?.products || [])
          : (productsData.products || []);
        
        // Only include active products (public-facing)
        const activeProducts = products.filter((p: any) => p.isActive !== false);
        
        productPages = activeProducts.map((product: any) => ({
          url: `/product/${product.slug || product.id}`,
          lastmod: product.updatedAt || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
        }));
      }
    } catch (error) {
      // If product fetch fails, continue with static pages only
      console.error('Failed to fetch products for sitemap:', error);
    }

    // Fetch active drops
    let dropPages: Array<{ url: string; lastmod: string; changefreq: string; priority: number }> = [];
    try {
      const dropsResponse = await fetch(`${backendUrl}/api/drops?status=live&limit=100`, {
        cache: 'no-store',
      });
      
      if (dropsResponse.ok) {
        const dropsData = await dropsResponse.json();
        const drops = dropsData.success 
          ? (dropsData.data?.drops || [])
          : (dropsData.drops || []);
        
        dropPages = drops.map((drop: any) => ({
          url: `/drops/${drop.slug || drop.id}`,
          lastmod: drop.updatedAt || new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.9,
        }));
      }
    } catch (error) {
      // If drops fetch fails, continue without drop pages
      console.error('Failed to fetch drops for sitemap:', error);
    }

    // Combine all pages
    const allPages = [...staticPages, ...productPages, ...dropPages];

    // Generate sitemap XML
    const sitemap = seoService.generateSitemapData(allPages);

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

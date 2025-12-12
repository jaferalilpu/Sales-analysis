import { NextResponse } from 'next/server';
import { SEOService } from '@/lib/seo';

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app';
    const seoService = new SEOService(siteUrl);
    const robotsTxt = seoService.generateRobotsTxt();

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    
    return new NextResponse('Error generating robots.txt', { status: 500 });
  }
}

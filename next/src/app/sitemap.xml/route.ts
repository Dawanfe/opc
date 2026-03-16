import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const baseUrl = 'https://weopc.com.cn';
  const currentDate = new Date().toISOString();

  // 静态页面
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' }, // 首页
    { url: '/policy', priority: '0.9', changefreq: 'weekly' },
    { url: '/marketplace', priority: '0.9', changefreq: 'daily' },
    { url: '/events', priority: '0.8', changefreq: 'daily' },
    { url: '/news', priority: '0.8', changefreq: 'daily' },
    { url: '/profile', priority: '0.7', changefreq: 'monthly' },
    { url: '/openclaw', priority: '0.8', changefreq: 'weekly' },
  ];

  // 从数据库获取动态内容
  const db = getDb();

  try {
    // 获取社区
    const communities = db.prepare('SELECT id FROM communities LIMIT 1000').all();

    // 获取活动
    const events = db.prepare('SELECT id FROM events LIMIT 1000').all();

    // 获取新闻
    const news = db.prepare('SELECT id FROM news LIMIT 1000').all();

    // 获取需求
    const demands = db.prepare('SELECT id FROM demands WHERE auditStatus = ? LIMIT 1000').all('approved');

    db.close();

    // 生成sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${communities.map((item: any) => `  <url>
    <loc>${baseUrl}/policy?community=${item.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${events.map((item: any) => `  <url>
    <loc>${baseUrl}/events?id=${item.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
${news.map((item: any) => `  <url>
    <loc>${baseUrl}/news?id=${item.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
${demands.map((item: any) => `  <url>
    <loc>${baseUrl}/marketplace?id=${item.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    db.close();

    // 至少返回静态页面的sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all artworks with slugs
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('slug, created_at, updated_at')
      .not('slug', 'is', null);

    if (artworksError) {
      console.error('Error fetching artworks:', artworksError);
      return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
    }

    // Fetch all blogs with slugs
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('Slug, created_at, updated_at')
      .not('Slug', 'is', null);

    if (blogsError) {
      console.error('Error fetching blogs:', blogsError);
      return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }

    // Base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fameuxarte.com';

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/artworks</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/blogs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/gallery</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/b2b</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/policies</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Dynamic artwork pages -->
${artworks?.map(artwork => {
  const lastmod = artwork.updated_at || artwork.created_at;
  return `  <url>
    <loc>${baseUrl}/artworks/${artwork.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n') || ''}

  <!-- Dynamic blog pages -->
${blogs?.map(blog => {
  const lastmod = blog.updated_at || blog.created_at;
  return `  <url>
    <loc>${baseUrl}/blogs/${blog.Slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('\n') || ''}
</urlset>`;

    // Return XML response with appropriate headers
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400', // Cache for 1 hour, CDN for 24 hours
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
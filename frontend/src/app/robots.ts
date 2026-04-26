import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/checkout/', '/account/', '/cart/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/checkout/', '/account/'],
      },
    ],
    sitemap: 'https://fameuxarte.com/sitemap.xml',
  };
}

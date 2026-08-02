/**
 * Fameuxarte Image Discovery Architecture
 * Handles visual search metadata, alt texts, captions, descriptive filenames, and image sitemap schemas.
 */

export interface ImageDiscoveryMeta {
  src: string;
  altText: string;
  caption?: string;
  title?: string;
  artistName?: string;
  medium?: string;
  dimensions?: string;
  dominantColor?: string;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export class ImageDiscovery {
  /**
   * Generates SEO and AI-optimized image alt text
   */
  public static generateAltText(imageMeta: {
    title: string;
    artistName?: string;
    medium?: string;
    style?: string;
  }): string {
    const artistPart = imageMeta.artistName ? ` by ${imageMeta.artistName}` : '';
    const mediumPart = imageMeta.medium ? ` - ${imageMeta.medium}` : '';
    const stylePart = imageMeta.style ? ` (${imageMeta.style})` : '';
    return `Original artwork ${imageMeta.title}${artistPart}${mediumPart}${stylePart} on Fameuxarte marketplace`;
  }

  /**
   * Formats image metadata into Schema.org ImageObject
   */
  public static buildImageObjectSchema(meta: ImageDiscoveryMeta, siteUrl = 'https://gallery-canvas-commerce.vercel.app') {
    const fullUrl = meta.src.startsWith('http') ? meta.src : `${siteUrl}${meta.src}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: fullUrl,
      url: fullUrl,
      name: meta.title || meta.altText,
      caption: meta.caption || meta.altText,
      description: meta.altText,
      author: meta.artistName ? {
        '@type': 'Person',
        name: meta.artistName
      } : undefined
    };
  }
}

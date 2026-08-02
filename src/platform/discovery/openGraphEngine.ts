/**
 * Fameuxarte OpenGraph & Social Sharing Engine
 * Generates structured social metadata for Facebook, OpenGraph, Twitter Cards, Pinterest, and LinkedIn.
 */

import { OpenGraphMetadata, TwitterCardMetadata } from './types';

export interface OpenGraphOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  siteName?: string;
  locale?: string;
  imageAlt?: string;
}

export class OpenGraphEngine {
  private static DEFAULT_SITE_NAME = 'Fameuxarte';
  private static DEFAULT_IMAGE = 'https://gallery-canvas-commerce.vercel.app/og-image.jpg';

  /**
   * Generates OpenGraph metadata object
   */
  public static generateOpenGraph(options: OpenGraphOptions): OpenGraphMetadata {
    const rawImage = options.image || this.DEFAULT_IMAGE;
    const image = rawImage.startsWith('http') ? rawImage : `https://gallery-canvas-commerce.vercel.app${rawImage}`;

    return {
      title: options.title,
      description: options.description,
      url: options.url,
      image,
      type: options.type || 'website',
      siteName: options.siteName || this.DEFAULT_SITE_NAME,
      locale: options.locale || 'en_US',
      imageAlt: options.imageAlt || options.title
    };
  }

  /**
   * Generates Twitter Card metadata object
   */
  public static generateTwitterCard(options: {
    title: string;
    description: string;
    image?: string;
    creator?: string;
    site?: string;
  }): TwitterCardMetadata {
    const rawImage = options.image || this.DEFAULT_IMAGE;
    const image = rawImage.startsWith('http') ? rawImage : `https://gallery-canvas-commerce.vercel.app${rawImage}`;

    return {
      card: 'summary_large_image',
      site: options.site || '@fameuxarte',
      creator: options.creator || '@fameuxarte',
      title: options.title,
      description: options.description,
      image,
      imageAlt: options.title
    };
  }
}

/**
 * Fameuxarte Marketplace Registry
 * Central registry defining indexable marketplace entities, routes, defaults, & priorities.
 */

import { EntityType } from './types';

export interface EntityRegistryConfig {
  entityType: EntityType;
  pathPattern: string;
  sitemapPriority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  indexable: boolean;
  parentPath?: string;
  defaultTitleTemplate: string;
  defaultDescription: string;
}

export const MARKETPLACE_ENTITY_REGISTRY: Record<EntityType, EntityRegistryConfig> = {
  artwork: {
    entityType: 'artwork',
    pathPattern: '/artworks/:slug',
    sitemapPriority: 0.9,
    changefreq: 'daily',
    indexable: true,
    parentPath: '/artworks',
    defaultTitleTemplate: '%title% by %artist% | Fameuxarte',
    defaultDescription: 'Discover and acquire authentic artwork %title% created by %artist% on Fameuxarte.'
  },
  artist: {
    entityType: 'artist',
    pathPattern: '/artists/:slug',
    sitemapPriority: 0.8,
    changefreq: 'weekly',
    indexable: true,
    parentPath: '/artists',
    defaultTitleTemplate: '%name% - Verified Artist Profile | Fameuxarte',
    defaultDescription: 'Explore original artwork, biography, and portfolio of artist %name% on Fameuxarte.'
  },
  collection: {
    entityType: 'collection',
    pathPattern: '/collections/:slug',
    sitemapPriority: 0.8,
    changefreq: 'weekly',
    indexable: true,
    parentPath: '/collections',
    defaultTitleTemplate: '%title% Art Collection | Fameuxarte',
    defaultDescription: 'Browse the curated %title% artwork collection on Fameuxarte.'
  },
  blog: {
    entityType: 'blog',
    pathPattern: '/blog/:slug',
    sitemapPriority: 0.7,
    changefreq: 'monthly',
    indexable: true,
    parentPath: '/blog',
    defaultTitleTemplate: '%title% | Fameuxarte Journal',
    defaultDescription: 'Read %title% on the Fameuxarte Journal - insights on contemporary art and collecting.'
  },
  category: {
    entityType: 'category',
    pathPattern: '/artworks/category/:slug',
    sitemapPriority: 0.8,
    changefreq: 'weekly',
    indexable: true,
    parentPath: '/artworks',
    defaultTitleTemplate: '%title% Artworks for Sale | Fameuxarte',
    defaultDescription: 'Discover original %title% artworks from top emerging and established global artists.'
  },
  style: {
    entityType: 'style',
    pathPattern: '/artworks/style/:slug',
    sitemapPriority: 0.7,
    changefreq: 'weekly',
    indexable: true,
    parentPath: '/artworks',
    defaultTitleTemplate: '%title% Style Paintings & Art | Fameuxarte',
    defaultDescription: 'Explore authentic artworks created in %title% style.'
  },
  medium: {
    entityType: 'medium',
    pathPattern: '/artworks/medium/:slug',
    sitemapPriority: 0.7,
    changefreq: 'weekly',
    indexable: true,
    parentPath: '/artworks',
    defaultTitleTemplate: '%title% Art & Original Works | Fameuxarte',
    defaultDescription: 'Browse curated original %title% art pieces created by world-class artists.'
  },
  technique: {
    entityType: 'technique',
    pathPattern: '/artworks/technique/:slug',
    sitemapPriority: 0.6,
    changefreq: 'monthly',
    indexable: true,
    parentPath: '/artworks',
    defaultTitleTemplate: '%title% Artworks | Fameuxarte',
    defaultDescription: 'Explore fine art crafted using %title% techniques.'
  },
  subject: {
    entityType: 'subject',
    pathPattern: '/artworks/subject/:slug',
    sitemapPriority: 0.6,
    changefreq: 'weekly',
    indexable: true,
    parentPath: '/artworks',
    defaultTitleTemplate: '%title% Art & Paintings | Fameuxarte',
    defaultDescription: 'Discover fine art capturing %title% subjects.'
  },
  material: {
    entityType: 'material',
    pathPattern: '/artworks/material/:slug',
    sitemapPriority: 0.5,
    changefreq: 'monthly',
    indexable: true,
    parentPath: '/artworks',
    defaultTitleTemplate: 'Artworks made with %title% | Fameuxarte',
    defaultDescription: 'Curated original artworks utilizing fine %title% materials.'
  },
  color: {
    entityType: 'color',
    pathPattern: '/artworks/color/:slug',
    sitemapPriority: 0.5,
    changefreq: 'weekly',
    indexable: true,
    parentPath: '/artworks',
    defaultTitleTemplate: '%title% Tone Fine Art | Fameuxarte',
    defaultDescription: 'Explore original artworks featuring dominant %title% color palettes.'
  },
  country: {
    entityType: 'country',
    pathPattern: '/artists/country/:slug',
    sitemapPriority: 0.6,
    changefreq: 'monthly',
    indexable: true,
    parentPath: '/artists',
    defaultTitleTemplate: 'Artists from %title% | Fameuxarte',
    defaultDescription: 'Discover verified contemporary artists based in %title%.'
  },
  city: {
    entityType: 'city',
    pathPattern: '/artists/city/:slug',
    sitemapPriority: 0.5,
    changefreq: 'monthly',
    indexable: true,
    parentPath: '/artists',
    defaultTitleTemplate: 'Artists in %title% | Fameuxarte',
    defaultDescription: 'Discover talent and art studios located in %title%.'
  },
  static_page: {
    entityType: 'static_page',
    pathPattern: '/:slug',
    sitemapPriority: 0.6,
    changefreq: 'monthly',
    indexable: true,
    parentPath: '/',
    defaultTitleTemplate: '%title% | Fameuxarte',
    defaultDescription: 'Fameuxarte - The premier marketplace for authentic artworks and verified artists.'
  },
  auth: {
    entityType: 'auth',
    pathPattern: '/auth',
    sitemapPriority: 0.2,
    changefreq: 'monthly',
    indexable: false,
    parentPath: '/',
    defaultTitleTemplate: 'Sign In & Register | Fameuxarte',
    defaultDescription: 'Access your Fameuxarte account or register as an artist or collector.'
  },
  verification: {
    entityType: 'verification',
    pathPattern: '/verify/:certificateNumber',
    sitemapPriority: 0.4,
    changefreq: 'never',
    indexable: true,
    parentPath: '/',
    defaultTitleTemplate: 'Artwork Authenticity Certificate Verification | Fameuxarte',
    defaultDescription: 'Verify the authenticity certificate and provenance record for Fameuxarte certified artworks.'
  }
};

export const getEntityConfig = (entityType: EntityType): EntityRegistryConfig => {
  return MARKETPLACE_ENTITY_REGISTRY[entityType] || MARKETPLACE_ENTITY_REGISTRY.static_page;
};

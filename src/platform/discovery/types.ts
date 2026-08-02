/**
 * Fameuxarte Discovery Platform - Core Type Definitions
 * Phase 5 - Sprint 5.1
 */

export type EntityType = 
  | 'artwork'
  | 'artist'
  | 'collection'
  | 'blog'
  | 'category'
  | 'style'
  | 'medium'
  | 'technique'
  | 'subject'
  | 'material'
  | 'color'
  | 'country'
  | 'city'
  | 'static_page'
  | 'auth'
  | 'verification';

export type RelationshipType = 
  | 'CREATED_BY'
  | 'BELONGS_TO_COLLECTION'
  | 'HAS_STYLE'
  | 'USES_MEDIUM'
  | 'HAS_SUBJECT'
  | 'MADE_OF_MATERIAL'
  | 'LOCATED_IN'
  | 'RELATED_TO_ARTWORK'
  | 'RELATED_TO_ARTIST'
  | 'FEATURED_IN_ARTICLE';

export interface BaseEntity {
  id: string;
  type: EntityType;
  slug: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArtworkEntity extends BaseEntity {
  type: 'artwork';
  artistName: string;
  artistId: string;
  artistSlug?: string;
  price: number;
  currency: string;
  image: string;
  medium?: string;
  style?: string;
  yearCreated?: string;
  dimensions?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Sold';
  sku: string;
}

export interface ArtistEntity extends BaseEntity {
  type: 'artist';
  avatar?: string;
  bio?: string;
  artistStatement?: string;
  artisticPhilosophy?: string;
  inspiration?: string;
  country?: string;
  city?: string;
  languages?: string[];
  mediums?: string[];
  styles?: string[];
  subjects?: string[];
  yearsOfExperience?: number;
  verificationStatus?: string;
  trustScore?: number;
  verified?: boolean;
  featuredArtist?: boolean;
  premiumArtist?: boolean;
  totalArtworks?: number;
  soldArtworks?: number;
  collections?: string[];
  joinedDate?: string;
  socialLinks?: string[];
  portfolio?: string[];
}

export interface CollectionEntity extends BaseEntity {
  type: 'collection';
  coverImage?: string;
  artworkCount?: number;
  curatorName?: string;
}

export interface BlogEntity extends BaseEntity {
  type: 'blog';
  author: string;
  publishDate: string;
  modifiedDate?: string;
  coverImage: string;
  tags?: string[];
}

export interface GenericDiscoveryInput {
  entityType: EntityType;
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string[];
  canonicalUrl?: string;
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  customMeta?: Record<string, string>;
  rawEntity?: Record<string, any>;
}

export interface OpenGraphMetadata {
  title: string;
  description: string;
  url: string;
  image: string;
  type: 'website' | 'article' | 'product' | 'profile';
  siteName: string;
  locale: string;
  imageWidth?: string;
  imageHeight?: string;
  imageAlt?: string;
}

export interface TwitterCardMetadata {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site: string;
  creator: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

export interface AISummaryMetadata {
  summary: string;
  entityType: EntityType;
  keyEntities: string[];
  semanticTopics: string[];
  confidenceScore: number;
  medium?: string;
  subject?: string;
  style?: string;
  artistSummary?: string;
  colorPalette?: string;
  trustStatus?: string;
  verificationStatus?: string;
  country?: string;
  experience?: string;
  techniques?: string[];
  artisticPhilosophy?: string;
  collectorRecommendations?: string;
  similarArtists?: string[];
  readingTime?: number;
  targetAudience?: string;
  skillLevel?: string;
  relatedArtists?: string[];
  relatedArtworks?: string[];
  relatedCollections?: string[];
}

export interface DiscoveryPipelineOutput {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  robots: string;
  language: string;
  openGraph: OpenGraphMetadata;
  twitterCard: TwitterCardMetadata;
  structuredData: Record<string, any>[];
  breadcrumbs: BreadcrumbItem[];
  aiMetadata: AISummaryMetadata;
}

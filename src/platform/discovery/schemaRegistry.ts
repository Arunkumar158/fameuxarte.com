/**
 * Fameuxarte Schema Registry
 * Centralized Schema.org JSON-LD structured data generators.
 */

export class SchemaRegistry {
  private static SITE_URL = 'https://gallery-canvas-commerce.vercel.app';

  /**
   * Generates Organization Schema
   */
  public static buildOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Fameuxarte',
      url: this.SITE_URL,
      logo: `${this.SITE_URL}/logo.png`,
      description: 'A search-first, AI-ready marketplace connecting art enthusiasts with authentic physical and digital artworks.',
      sameAs: [
        'https://facebook.com/fameuxarte',
        'https://twitter.com/fameuxarte',
        'https://instagram.com/fameuxarte',
        'https://pinterest.com/fameuxarte'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@fameuxarte.com',
        availableLanguage: ['English', 'French', 'Spanish']
      }
    };
  }

  /**
   * Generates Product / Fine Art Schema
   */
  public static buildProductSchema(item: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    sku: string;
    availability?: string;
    artist?: string;
    medium?: string;
    dimensions?: string;
    category?: string;
    trustSignals?: {
      verifiedArtist?: boolean;
      certificateOfAuthenticity?: boolean;
      originalArtwork?: boolean;
      secureCheckout?: boolean;
    };
  }) {
    const additionalProperties = [];
    if (item.trustSignals?.verifiedArtist) additionalProperties.push({ '@type': 'PropertyValue', name: 'Verified Artist', value: 'True' });
    if (item.trustSignals?.certificateOfAuthenticity) additionalProperties.push({ '@type': 'PropertyValue', name: 'Certificate of Authenticity', value: 'Included' });
    if (item.trustSignals?.originalArtwork) additionalProperties.push({ '@type': 'PropertyValue', name: 'Original Artwork', value: 'True' });
    if (item.trustSignals?.secureCheckout) additionalProperties.push({ '@type': 'PropertyValue', name: 'Secure Checkout', value: 'True' });

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: item.name,
      description: item.description,
      image: item.image.startsWith('http') ? item.image : `${this.SITE_URL}${item.image}`,
      sku: item.sku,
      brand: {
        '@type': 'Brand',
        name: 'Fameuxarte'
      },
      category: item.category || 'Fine Art',
      material: item.medium,
      offers: {
        '@type': 'Offer',
        price: item.price,
        priceCurrency: item.currency,
        availability: `https://schema.org/${item.availability || 'InStock'}`,
        url: `${this.SITE_URL}/artworks/${item.sku}`,
        seller: {
          '@type': 'Organization',
          name: 'Fameuxarte'
        }
      },
      creator: item.artist ? {
        '@type': 'Person',
        name: item.artist
      } : undefined,
      additionalProperty: additionalProperties.length > 0 ? additionalProperties : undefined
    };
  }

  /**
   * Generates CreativeWork Schema
   */
  public static buildCreativeWorkSchema(work: {
    name: string;
    description: string;
    image: string;
    creator: string;
    dateCreated?: string;
    medium?: string;
    trustSignals?: {
      originalArtwork?: boolean;
    }
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      name: work.name,
      description: work.description,
      image: work.image.startsWith('http') ? work.image : `${this.SITE_URL}${work.image}`,
      creator: {
        '@type': 'Person',
        name: work.creator
      },
      artMedium: work.medium,
      dateCreated: work.dateCreated,
      artform: work.trustSignals?.originalArtwork ? 'Original Artwork' : undefined
    };
  }

  /**
   * Generates Person (Artist Profile) Schema
   */
  public static buildPersonSchema(person: {
    name: string;
    description?: string;
    image?: string;
    jobTitle?: string;
    knowsAbout?: string[];
    url?: string;
    sameAs?: string[];
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      description: person.description,
      image: person.image ? (person.image.startsWith('http') ? person.image : `${this.SITE_URL}${person.image}`) : undefined,
      jobTitle: person.jobTitle || 'Artist',
      knowsAbout: person.knowsAbout || ['Visual Art', 'Contemporary Painting'],
      url: person.url ? (person.url.startsWith('http') ? person.url : `${this.SITE_URL}${person.url}`) : undefined,
      sameAs: person.sameAs
    };
  }

  /**
   * Generates ProfilePage Schema
   */
  public static buildProfilePageSchema(profile: {
    name: string;
    description: string;
    url: string;
    dateCreated?: string;
    dateModified?: string;
    image?: string;
    mainEntity?: any;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: profile.name,
      description: profile.description,
      url: profile.url.startsWith('http') ? profile.url : `${this.SITE_URL}${profile.url}`,
      dateCreated: profile.dateCreated,
      dateModified: profile.dateModified,
      image: profile.image ? (profile.image.startsWith('http') ? profile.image : `${this.SITE_URL}${profile.image}`) : undefined,
      mainEntity: profile.mainEntity
    };
  }

  /**
   * Generates Article / Blog Schema
   */
  public static buildArticleSchema(article: {
    headline: string;
    description: string;
    image: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    url?: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.headline,
      description: article.description,
      image: article.image.startsWith('http') ? article.image : `${this.SITE_URL}${article.image}`,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fameuxarte',
        logo: {
          '@type': 'ImageObject',
          url: `${this.SITE_URL}/logo.png`
        }
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.url || this.SITE_URL
      }
    };
  }

  /**
   * Generates CollectionPage Schema
   */
  public static buildCollectionPageSchema(collection: {
    name: string;
    description: string;
    url: string;
    itemCount?: number;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.name,
      description: collection.description,
      url: collection.url.startsWith('http') ? collection.url : `${this.SITE_URL}${collection.url}`,
      numberOfItems: collection.itemCount
    };
  }

  /**
   * Generates BreadcrumbList Schema
   */
  public static buildBreadcrumbSchema(items: { name: string; url: string; position: number }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map(item => ({
        '@type': 'ListItem',
        position: item.position,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${this.SITE_URL}${item.url}`
      }))
    };
  }

  /**
   * Generates FAQ Schema
   */
  public static buildFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  /**
   * Generates ImageObject Schema
   */
  public static buildImageObjectSchema(image: {
    url: string;
    caption?: string;
    name?: string;
    description?: string;
    author?: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: image.url.startsWith('http') ? image.url : `${this.SITE_URL}${image.url}`,
      caption: image.caption,
      name: image.name,
      description: image.description,
      creator: image.author ? {
        '@type': 'Person',
        name: image.author
      } : undefined
    };
  }

  /**
   * Generates WebSite Schema
   */
  public static buildWebSiteSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Fameuxarte',
      url: this.SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.SITE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }
}

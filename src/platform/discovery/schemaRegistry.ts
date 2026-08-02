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
  }) {
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
      } : undefined
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
      dateCreated: work.dateCreated
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
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      description: person.description,
      image: person.image ? (person.image.startsWith('http') ? person.image : `${this.SITE_URL}${person.image}`) : undefined,
      jobTitle: person.jobTitle || 'Artist',
      knowsAbout: person.knowsAbout || ['Visual Art', 'Contemporary Painting']
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
}

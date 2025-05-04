export const generateProductStructuredData = (product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: string;
  sku: string;
  brand?: string;
  category?: string;
  reviewCount?: number;
  reviewRating?: number;
}) => {
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: `https://gallery-canvas-commerce.vercel.app/artworks/${product.sku}`,
      seller: {
        '@type': 'Organization',
        name: 'Gallery Canvas Commerce'
      }
    }
  };

  if (product.brand) {
    structuredData.brand = {
      '@type': 'Brand',
      name: product.brand
    };
  }

  if (product.category) {
    structuredData.category = product.category;
  }

  if (product.reviewCount && product.reviewRating) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.reviewRating,
      reviewCount: product.reviewCount
    };
  }

  return structuredData;
};

export const generateBlogPostStructuredData = (post: {
  title: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified: string;
  url?: string;
  publisherLogo?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gallery Canvas Commerce',
      logo: {
        '@type': 'ImageObject',
        url: post.publisherLogo || 'https://gallery-canvas-commerce.vercel.app/logo.png'
      }
    },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url || 'https://gallery-canvas-commerce.vercel.app/blog'
    }
  };
};

export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fameuxarte',
    url: 'https://gallery-canvas-commerce.vercel.app',
    logo: 'https://gallery-canvas-commerce.vercel.app/logo.png',
    sameAs: [
      'https://facebook.com/gallerycanvas',
      'https://twitter.com/gallerycanvas',
      'https://instagram.com/gallerycanvas',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-555-5555',
      contactType: 'customer service',
      availableLanguage: ['English']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Art Street',
      addressLocality: 'Art City',
      addressRegion: 'AC',
      postalCode: '12345',
      addressCountry: 'US'
    }
  };
};

export const generateFAQStructuredData = (faqs: { question: string, answer: string }[]) => {
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
};

export const generateBreadcrumbStructuredData = (breadcrumbs: { name: string, item: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: `https://gallery-canvas-commerce.vercel.app${breadcrumb.item}`
    }))
  };
};

export const generateLocalBusinessStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ArtGallery',
    name: 'Gallery Canvas Commerce',
    image: 'https://gallery-canvas-commerce.vercel.app/logo.png',
    '@id': 'https://gallery-canvas-commerce.vercel.app',
    url: 'https://gallery-canvas-commerce.vercel.app',
    telephone: '+1-555-555-5555',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Art Street',
      addressLocality: 'Art City',
      addressRegion: 'AC',
      postalCode: '12345',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7128,
      longitude: -74.0060
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday'
        ],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Saturday'
        ],
        opens: '10:00',
        closes: '17:00'
      }
    ]
  };
};

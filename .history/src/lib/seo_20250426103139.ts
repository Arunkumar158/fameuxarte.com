export const generateProductStructuredData = (product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: string;
  sku: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      sku: product.sku,
    },
  };
};

export const generateBlogPostStructuredData = (post: {
  title: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified: string;
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
    datePublished: post.datePublished,
    dateModified: post.dateModified,
  };
};

export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gallery Canvas Commerce',
    url: 'https://gallery-canvas-commerce.vercel.app',
    logo: 'https://gallery-canvas-commerce.vercel.app/logo.png',
    sameAs: [
      'https://facebook.com/gallerycanvas',
      'https://twitter.com/gallerycanvas',
      'https://instagram.com/gallerycanvas',
    ],
  };
}; 
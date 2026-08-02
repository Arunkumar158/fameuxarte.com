/**
 * Fameuxarte DiscoveryHead Component
 * Enterprise React Helmet head tag renderer powered by the Discovery Metadata Pipeline.
 */

import { Helmet } from 'react-helmet-async';
import { GenericDiscoveryInput } from './types';
import { MetadataPipeline } from './metadataPipeline';

export interface DiscoveryHeadProps extends GenericDiscoveryInput {
  structuredDataOverride?: Record<string, any> | Record<string, any>[];
}

export const DiscoveryHead = (props: DiscoveryHeadProps) => {
  const output = MetadataPipeline.process(props);

  const finalStructuredData = props.structuredDataOverride
    ? (Array.isArray(props.structuredDataOverride) ? props.structuredDataOverride : [props.structuredDataOverride])
    : output.structuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{output.title}</title>
      <meta name="description" content={output.description} />
      <meta name="keywords" content={output.keywords} />
      <link rel="canonical" href={output.canonicalUrl} />
      <meta name="robots" content={output.robots} />
      <meta httpEquiv="Content-Language" content={output.language} />

      {/* OpenGraph Social Tags */}
      <meta property="og:title" content={output.openGraph.title} />
      <meta property="og:description" content={output.openGraph.description} />
      <meta property="og:type" content={output.openGraph.type} />
      <meta property="og:url" content={output.openGraph.url} />
      <meta property="og:image" content={output.openGraph.image} />
      <meta property="og:site_name" content={output.openGraph.siteName} />
      <meta property="og:locale" content={output.openGraph.locale} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={output.twitterCard.card} />
      <meta name="twitter:site" content={output.twitterCard.site} />
      <meta name="twitter:creator" content={output.twitterCard.creator} />
      <meta name="twitter:title" content={output.twitterCard.title} />
      <meta name="twitter:description" content={output.twitterCard.description} />
      <meta name="twitter:image" content={output.twitterCard.image} />

      {/* AI Discovery & LLM Meta Tags */}
      <meta name="ai-summary" content={output.aiMetadata.summary} />
      <meta name="ai-entity-type" content={output.aiMetadata.entityType} />
      <meta name="ai-topics" content={output.aiMetadata.semanticTopics.join(', ')} />
      {output.aiMetadata.medium && <meta name="ai-medium" content={output.aiMetadata.medium} />}
      {output.aiMetadata.subject && <meta name="ai-subject" content={output.aiMetadata.subject} />}
      {output.aiMetadata.style && <meta name="ai-style" content={output.aiMetadata.style} />}
      {output.aiMetadata.artistSummary && <meta name="ai-artist-summary" content={output.aiMetadata.artistSummary} />}
      {output.aiMetadata.colorPalette && <meta name="ai-color-palette" content={output.aiMetadata.colorPalette} />}
      {output.aiMetadata.trustStatus && <meta name="ai-trust-status" content={output.aiMetadata.trustStatus} />}
      {output.aiMetadata.verificationStatus && <meta name="ai-verification" content={output.aiMetadata.verificationStatus} />}
      {output.aiMetadata.country && <meta name="ai-country" content={output.aiMetadata.country} />}
      {output.aiMetadata.experience && <meta name="ai-experience" content={output.aiMetadata.experience} />}
      {output.aiMetadata.techniques && <meta name="ai-techniques" content={output.aiMetadata.techniques.join(', ')} />}
      {output.aiMetadata.artisticPhilosophy && <meta name="ai-philosophy" content={output.aiMetadata.artisticPhilosophy} />}

      {/* Structured Data JSON-LD */}
      {finalStructuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

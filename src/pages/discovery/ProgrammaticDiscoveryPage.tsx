import React, { useMemo } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { PageResolver } from '@/platform/discovery/pageResolver';
import { DiscoveryPageLayout } from '@/components/discovery/DiscoveryPageLayout';

const ProgrammaticDiscoveryPage: React.FC = () => {
  const { '*' : slug } = useParams<{ '*': string }>();
  const location = useLocation();

  const entity = useMemo(() => {
    return PageResolver.resolve(slug || '');
  }, [slug]);

  if (!entity) {
    // Graceful fallback to artworks if the combination is invalid
    return <Navigate to="/artworks" replace />;
  }

  return <DiscoveryPageLayout entity={entity} />;
};

export default ProgrammaticDiscoveryPage;

import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getDiscoveryEntity } from '@/lib/discovery/registry';
import { DiscoveryPageLayout } from '@/components/discovery/DiscoveryPageLayout';

const StylePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const entity = getDiscoveryEntity(slug || '', 'style');

  if (!entity) {
    return <Navigate to="/artworks" replace />;
  }

  return <DiscoveryPageLayout entity={entity} />;
};

export default StylePage;

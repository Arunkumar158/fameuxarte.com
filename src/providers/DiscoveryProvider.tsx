/**
 * Fameuxarte DiscoveryProvider
 * Global React Provider wrapping HelmetProvider with Discovery state context.
 */

import React, { createContext, useContext } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Environment } from '@/platform/discovery/robotsEngine';

export interface DiscoveryContextValue {
  baseUrl: string;
  environment: Environment;
  locale: string;
}

const DiscoveryContext = createContext<DiscoveryContextValue>({
  baseUrl: 'https://gallery-canvas-commerce.vercel.app',
  environment: 'production',
  locale: 'en'
});

export interface DiscoveryProviderProps {
  children: React.ReactNode;
  baseUrl?: string;
  environment?: Environment;
  locale?: string;
}

export const DiscoveryProvider: React.FC<DiscoveryProviderProps> = ({
  children,
  baseUrl = 'https://gallery-canvas-commerce.vercel.app',
  environment = 'production',
  locale = 'en'
}) => {
  return (
    <DiscoveryContext.Provider value={{ baseUrl, environment, locale }}>
      <HelmetProvider>
        {children}
      </HelmetProvider>
    </DiscoveryContext.Provider>
  );
};

export const useDiscoveryContext = () => useContext(DiscoveryContext);

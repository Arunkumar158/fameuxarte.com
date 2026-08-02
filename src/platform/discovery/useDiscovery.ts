/**
 * Fameuxarte useDiscovery Hook
 * Easy-to-use React hook for dynamic page level discovery configuration.
 */

import { GenericDiscoveryInput, DiscoveryPipelineOutput } from './types';
import { MetadataPipeline } from './metadataPipeline';

export const useDiscovery = (input: GenericDiscoveryInput): DiscoveryPipelineOutput => {
  return MetadataPipeline.process(input);
};

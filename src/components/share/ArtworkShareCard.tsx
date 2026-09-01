/**
 * ArtworkShareCard.tsx
 * Fameuxarte — Live preview of the branded social share image.
 *
 * Renders a scaled-down preview of exactly the image that will be shared.
 * The preview uses a real <img> element from the generated blob URL so it
 * matches the actual generated PNG 1-to-1.
 */

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ShareCardConfig } from '@/lib/shareArtwork';
import { generateShareImage } from '@/lib/shareArtwork';

export interface ArtworkShareCardProps {
  config: ShareCardConfig;
  /** Called when the image is ready with the Blob for sharing/download */
  onImageReady?: (blob: Blob, corsBlocked: boolean) => void;
  /** Called on generation failure */
  onImageError?: () => void;
  /** CSS class for the outer wrapper */
  className?: string;
}

type GenerationState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * ArtworkShareCard
 *
 * Generates the 1080×1920 canvas image and shows a scaled preview.
 * The blob is passed up via onImageReady so the dialog can reuse it
 * for download and native share without regenerating.
 */
const ArtworkShareCard = ({
  config,
  onImageReady,
  onImageError,
  className = '',
}: ArtworkShareCardProps) => {
  const [state, setState] = useState<GenerationState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [corsBlocked, setCorsBlocked] = useState(false);
  const prevObjectUrl = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Revoke the previous object URL to prevent memory leaks
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = null;
    }

    if (!config.imageUrl && !config.title) return;

    let cancelled = false;
    setState('loading');

    const run = async () => {
      try {
        const result = await generateShareImage(config);

        if (cancelled || !isMounted.current) return;

        if (!result) {
          setState('error');
          onImageError?.();
          return;
        }

        const { blob, corsBlocked: blocked } = result;
        const objectUrl = URL.createObjectURL(blob);
        prevObjectUrl.current = objectUrl;

        setPreviewUrl(objectUrl);
        setCorsBlocked(blocked);
        setState('ready');
        onImageReady?.(blob, blocked);
      } catch (err) {
        console.error('[ArtworkShareCard] Generation failed:', err);
        if (cancelled || !isMounted.current) return;
        setState('error');
        onImageError?.();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // Intentionally only regenerate if the key config fields change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.imageUrl, config.title, config.subtitle, config.type]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (prevObjectUrl.current) {
        URL.revokeObjectURL(prevObjectUrl.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      aria-label="Share image preview"
      role="img"
    >
      {/* Aspect ratio container: 9:16 */}
      <div
        className="relative w-full overflow-hidden rounded-[8px] border border-[#1e1e1e] bg-[#0a0a0a]"
        style={{ aspectRatio: '9/16' }}
      >
        {/* Loading shimmer */}
        {state === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]">
            {/* Skeleton preview */}
            <div className="w-full h-full flex flex-col items-center justify-between px-4 py-6">
              <div className="space-y-2 text-center">
                <div className="h-3 w-28 mx-auto rounded bg-[#1a1a1a] animate-pulse" />
                <div className="h-2 w-20 mx-auto rounded bg-[#151515] animate-pulse" />
              </div>
              <div className="flex-1 w-full my-4 rounded bg-[#111118] animate-pulse" />
              <div className="space-y-2 text-center">
                <div className="h-3 w-32 mx-auto rounded bg-[#1a1a1a] animate-pulse" />
                <div className="h-2 w-24 mx-auto rounded bg-[#151515] animate-pulse" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#D4B87A]" />
                <span className="text-[11px] text-[#555] uppercase tracking-widest">
                  Generating
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Generated preview */}
        {state === 'ready' && previewUrl && (
          <img
            src={previewUrl}
            alt="Branded share image preview"
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] px-6 text-center">
            <div className="text-[#333] text-5xl mb-1">✕</div>
            <p className="text-[13px] text-[#666]">
              Could not generate preview
            </p>
            <p className="text-[11px] text-[#444] leading-relaxed">
              You can still copy the artwork link below
            </p>
          </div>
        )}

        {/* CORS warning badge — shown only when image loaded but CORS blocked artwork */}
        {state === 'ready' && corsBlocked && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="rounded-md bg-black/80 px-3 py-2 text-center text-[11px] text-[#888] backdrop-blur-sm">
              Artwork image not available in preview — branding card generated
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtworkShareCard;

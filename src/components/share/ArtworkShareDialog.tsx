/**
 * ArtworkShareDialog.tsx
 * Fameuxarte — Branded Artwork Share Dialog / Bottom Sheet
 *
 * Layout: single-column stacked on all sizes — card preview at top,
 * artwork info in middle, action buttons at bottom.
 *
 * Mobile (≤768px): Vaul bottom-sheet drawer (swipe to dismiss)
 * Desktop (>768px): centered Radix Dialog modal
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Copy,
  Download,
  Share2,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import ArtworkShareCard from '@/components/share/ArtworkShareCard';
import {
  type ShareCardConfig,
  buildArtworkShareText,
  buildArtworkShareUrl,
  copyToClipboard,
  detectShareCapabilities,
  downloadImage,
  triggerNativeShare,
} from '@/lib/shareArtwork';
import {
  trackArtworkShareImageGenerated,
  trackArtworkShareNativeOpened,
  trackArtworkShareDownloaded,
  trackArtworkShareLinkCopied,
} from '@/lib/analytics';
import { useIsMobile } from '@/hooks/use-mobile';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArtworkShareDialogProps {
  artwork: {
    id: string;
    title: string;
    artistName: string;
    imageUrl: string;
    slug: string | null | undefined;
    medium?: string | null;
    creation_year?: number | null;
    status?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Share actions — rendered below the card preview
// ---------------------------------------------------------------------------

interface ShareActionsProps {
  artwork: ArtworkShareDialogProps['artwork'];
  blob: Blob | null;
  corsBlocked: boolean;
  generationFailed: boolean;
}

const ShareActions = ({
  artwork,
  blob,
  corsBlocked,
  generationFailed,
}: ShareActionsProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl  = buildArtworkShareUrl(artwork.slug, artwork.id);
  const shareText = buildArtworkShareText(artwork.title, artwork.artistName);
  const caps      = detectShareCapabilities();

  const filename = `fameuxarte-${artwork.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)}.png`;

  const isReady = Boolean(blob);

  const handleNativeShare = useCallback(async () => {
    if (!blob) return;
    trackArtworkShareNativeOpened({
      artwork_id:   artwork.id,
      share_method: caps.canShareFiles ? 'native_file' : 'native_text',
      device:       caps.isMobile ? 'mobile' : 'desktop',
    });
    const outcome = await triggerNativeShare(blob, artwork.title, shareText, shareUrl);
    if (outcome === 'error') {
      toast.error('Share failed. Try downloading the image instead.');
    }
  }, [blob, artwork, shareText, shareUrl, caps]);

  const handleDownload = useCallback(() => {
    if (!blob) return;
    downloadImage(blob, filename);
    trackArtworkShareDownloaded({ artwork_id: artwork.id, device: caps.isMobile ? 'mobile' : 'desktop' });
    toast.success('Image saved', { description: 'Check your Downloads folder.' });
  }, [blob, filename, artwork.id, caps.isMobile]);

  const handleCopyLink = useCallback(async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      trackArtworkShareLinkCopied({ artwork_id: artwork.id, device: caps.isMobile ? 'mobile' : 'desktop' });
      toast.success('Link copied to clipboard');
    } else {
      toast.error('Could not copy link.', { description: shareUrl });
    }
  }, [shareUrl, artwork.id, caps.isMobile]);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Alerts */}
      {corsBlocked && isReady && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#2a2215] bg-[#1a1508]/60 px-3 py-2.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4B87A]/70" aria-hidden="true" />
          <p className="text-[11px] leading-[1.6] text-[#a89070]">
            Artwork image unavailable — branded card generated. Share link works.
          </p>
        </div>
      )}
      {generationFailed && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#2a2a2a] bg-[#111] px-3 py-2.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#888]" aria-hidden="true" />
          <p className="text-[11px] leading-[1.6] text-[#666]">
            Image generation failed. Copy the link to share this artwork.
          </p>
        </div>
      )}

      {/* Primary: native share (when supported) */}
      {caps.canShareText && (
        <Button
          id="share-native-button"
          size="lg"
          className="h-11 w-full rounded-xl bg-linen text-[13px] font-medium text-obsidian hover:bg-[#D4B87A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          onClick={handleNativeShare}
          disabled={!isReady}
          aria-label="Share artwork image via device share sheet"
        >
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Share
        </Button>
      )}

      {/* Download */}
      <Button
        id="share-download-button"
        size="lg"
        variant="outline"
        className="h-11 w-full rounded-xl border-[#252525] bg-[#111] text-[13px] text-[#ccc] hover:border-[#D4B87A]/40 hover:text-[#D4B87A] hover:bg-[#161616] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        onClick={handleDownload}
        disabled={!isReady}
        aria-label="Download the branded share image"
      >
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        Download Image
      </Button>

      {/* Copy Link */}
      <Button
        id="share-copy-link-button"
        size="lg"
        variant="outline"
        className="h-11 w-full rounded-xl border-[#252525] bg-[#111] text-[13px] text-[#888] hover:border-[#D4B87A]/40 hover:text-[#D4B87A] hover:bg-[#161616] transition-all"
        onClick={handleCopyLink}
        aria-label="Copy artwork page link to clipboard"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-[#4a9d6f]" aria-hidden="true" />
              Copied!
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              Copy Link
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* URL hint */}
      <p className="truncate text-center text-[10px] text-[#333] mt-0.5" title={shareUrl}>
        {shareUrl.replace('https://', '')}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Inner content — single-column stacked layout for all breakpoints
// ---------------------------------------------------------------------------

interface ShareContentProps {
  artwork: ArtworkShareDialogProps['artwork'];
  onClose: () => void;
}

const ShareContent = ({ artwork, onClose }: ShareContentProps) => {
  const [blob, setBlob]                   = useState<Blob | null>(null);
  const [corsBlocked, setCorsBlocked]     = useState(false);
  const [generationFailed, setFailed]     = useState(false);

  const metaParts: string[] = [];
  if (artwork.medium) metaParts.push(artwork.medium);
  if (artwork.creation_year) metaParts.push(String(artwork.creation_year));

  const config: ShareCardConfig = {
    type:     'artwork',
    title:    artwork.title,
    subtitle: artwork.artistName,
    imageUrl: artwork.imageUrl,
    metaLine: metaParts.length > 0 ? metaParts.join(' · ') : undefined,
    url:      buildArtworkShareUrl(artwork.slug, artwork.id),
  };

  const handleImageReady = useCallback((generatedBlob: Blob, blocked: boolean) => {
    setBlob(generatedBlob);
    setCorsBlocked(blocked);
    trackArtworkShareImageGenerated({ artwork_id: artwork.id, cors_blocked: blocked });
  }, [artwork.id]);

  const handleImageError = useCallback(() => setFailed(true), []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* ── Card preview — 9:16, capped width so it never overflows ── */}
      <div className="w-full max-w-[200px] sm:max-w-[220px]">
        <ArtworkShareCard
          config={config}
          onImageReady={handleImageReady}
          onImageError={handleImageError}
        />
      </div>

      {/* ── Artwork info ── */}
      <div className="text-center w-full">
        <p className="text-[13px] font-medium text-linen leading-snug line-clamp-2">
          "{artwork.title}"
        </p>
        <p className="text-[12px] text-[#666] mt-0.5">
          by {artwork.artistName}
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-[#1a1a1a]" />

      {/* ── Share action buttons ── */}
      <div className="w-full">
        <ShareActions
          artwork={artwork}
          blob={blob}
          corsBlocked={corsBlocked}
          generationFailed={generationFailed}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main dialog — adapts between Drawer (mobile) and Dialog (desktop)
// ---------------------------------------------------------------------------

const ArtworkShareDialog = ({
  artwork,
  open,
  onOpenChange,
}: ArtworkShareDialogProps) => {
  const isMobile      = useIsMobile();
  const closeBtnRef   = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => closeBtnRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  /* ── Mobile: Vaul bottom-sheet drawer ─────────────────────────────────── */
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="border-t border-[#1e1e1e] bg-[#0d0d0d] text-linen focus:outline-none"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Drag handle already rendered by DrawerContent */}
          <div className="px-4 pt-2 pb-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <DrawerTitle className="text-[15px] font-medium text-linen">
                Share Artwork
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                Share "{artwork.title}" by {artwork.artistName} as a branded image
              </DrawerDescription>
              <button
                ref={closeBtnRef}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#252525] bg-[#111] text-[#555] hover:text-[#aaa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B87A]/40"
                onClick={handleClose}
                aria-label="Close share dialog"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <ShareContent artwork={artwork} onClose={handleClose} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  /* ── Desktop: centered Radix dialog ──────────────────────────────────── */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        /* Hide the default Radix close button — we render our own */
        className="
          w-full max-w-xs sm:max-w-sm
          rounded-2xl border border-[#1e1e1e]
          bg-[#0d0d0d] p-5 text-linen
          shadow-[0_24px_80px_rgba(0,0,0,0.7)]
          focus:outline-none
          [&>button]:hidden
        "
        aria-describedby="share-dialog-desc"
      >
        {/* Hidden accessible description */}
        <DialogDescription id="share-dialog-desc" className="sr-only">
          Generate a Fameuxarte-branded image to share on Instagram, WhatsApp, and more.
        </DialogDescription>

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-[15px] font-medium text-linen">
            Share Artwork
          </DialogTitle>
          <button
            ref={closeBtnRef}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#252525] bg-[#111] text-[#555] hover:text-[#aaa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B87A]/40"
            onClick={handleClose}
            aria-label="Close share dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <ShareContent artwork={artwork} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkShareDialog;

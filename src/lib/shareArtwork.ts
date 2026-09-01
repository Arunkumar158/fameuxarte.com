/**
 * shareArtwork.ts
 * Fameuxarte — Branded Social Share Card Generator
 *
 * Generates a 1080×1920 (9:16) branded PNG image for social sharing
 * (Instagram Stories, WhatsApp Status, etc.) using the Canvas 2D API.
 *
 * Designed as a reusable engine — supports artwork, artist, collection,
 * and blog share cards via the generic ShareCardConfig interface.
 *
 * No external dependencies beyond what is already in the project.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Generic share card configuration — extend this for future card types */
export interface ShareCardConfig {
  /** Card variant — controls layout and label hierarchy */
  type: 'artwork' | 'artist' | 'collection' | 'blog';

  /** Primary headline (artwork title, artist name, etc.) */
  title: string;

  /** Secondary line (artist name for artwork, tagline for artist, etc.) */
  subtitle?: string;

  /** Short metadata line (medium · year, location, date, etc.) */
  metaLine?: string;

  /** Resolved public image URL for the main visual */
  imageUrl?: string;

  /** Canonical page URL included in share text */
  url: string;

  /** Call-to-action text override */
  ctaText?: string;
}

/** Capabilities detected from the current browser/device */
export interface ShareCapabilities {
  /** Device is likely mobile (viewport heuristic) */
  isMobile: boolean;
  /** navigator.share is available */
  canShareText: boolean;
  /** navigator.canShare({ files }) returns true */
  canShareFiles: boolean;
}

/** Result of a share attempt */
export type ShareOutcome = 'shared' | 'cancelled' | 'unsupported' | 'error';

// ---------------------------------------------------------------------------
// Constants — Fameuxarte brand tokens (mirrors tailwind.config.ts)
// ---------------------------------------------------------------------------

const CARD_W = 1080;
const CARD_H = 1920;

const COLOR = {
  background:    '#0a0a0a',
  backgroundDeep:'#0d1020',
  linen:         '#f0ece4',
  gold:          '#C9A96E',        // slightly warmer for canvas legibility
  stone:         '#888780',
  muted:         '#555555',
  faint:         '#2a2a2a',
  surface:       '#111118',
  imageBackground:'#111118',
} as const;

const FONT = {
  serif: '"Playfair Display", "Georgia", serif',
  sans:  '"Inter", "Helvetica Neue", "Arial", sans-serif',
} as const;

const SITE_DOMAIN = 'fameuxarte.com';
const SITE_ORIGIN = 'https://www.fameuxarte.com';

// ---------------------------------------------------------------------------
// Font readiness — ensures Playfair Display is loaded before canvas render
// ---------------------------------------------------------------------------

/** Wait for Playfair Display to be ready in the browser font cache. */
async function ensureFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    await Promise.all([
      document.fonts.load(`bold 72px "Playfair Display"`),
      document.fonts.load(`400 32px "Playfair Display"`),
      document.fonts.load(`400 28px "Inter"`),
    ]);
  } catch {
    // If the Font Loading API fails, proceed anyway — fallback fonts will render
  }
}

// ---------------------------------------------------------------------------
// Image loading — CORS-safe canvas drawing
// ---------------------------------------------------------------------------

/**
 * Load a remote image into an HTMLImageElement with crossOrigin="anonymous".
 * Resolves to null if:
 *   - No URL provided
 *   - Network error
 *   - CORS rejection
 * Returns the element only after it fully loads.
 */
function loadImageForCanvas(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url || url === '/placeholder.svg') {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      img.src = '';
      resolve(null);
    }, 12_000); // 12 s timeout

    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      // Retry without crossOrigin — will produce a tainted canvas but still
      // lets us check if the URL is reachable at all (diagnostics only).
      // We resolve null so the caller renders a clean branded fallback.
      resolve(null);
    };

    // Append cache-buster only for absolute URLs to avoid CORS preflight caching issues
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// Canvas helpers
// ---------------------------------------------------------------------------

/** Draw a multi-line text block and return the y position after the last line */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

/** Draw artwork image fitted with 'contain' inside a bounding box */
function drawArtworkContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
): void {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const boxAspect = boxW / boxH;

  let drawW: number;
  let drawH: number;

  if (imgAspect > boxAspect) {
    // Wider than box — constrain by width
    drawW = boxW;
    drawH = boxW / imgAspect;
  } else {
    // Taller than box — constrain by height
    drawH = boxH;
    drawW = boxH * imgAspect;
  }

  const drawX = boxX + (boxW - drawW) / 2;
  const drawY = boxY + (boxH - drawH) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

// ---------------------------------------------------------------------------
// Core image generator
// ---------------------------------------------------------------------------

/**
 * Generate a 1080×1920 Fameuxarte branded social share image.
 *
 * @param config  ShareCardConfig — works for any card type
 * @returns Blob (PNG) or null if generation failed entirely
 */
export async function generateShareImage(
  config: ShareCardConfig,
): Promise<{ blob: Blob; corsBlocked: boolean } | null> {
  await ensureFontsLoaded();

  const canvas = document.createElement('canvas');
  canvas.width  = CARD_W;
  canvas.height = CARD_H;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // ── 1. Background gradient ──────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  grad.addColorStop(0,   COLOR.background);
  grad.addColorStop(0.5, COLOR.backgroundDeep);
  grad.addColorStop(1,   COLOR.background);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // ── 2. Subtle texture — dot grid ─────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.018)';
  for (let row = 0; row < CARD_H; row += 48) {
    for (let col = 0; col < CARD_W; col += 48) {
      ctx.beginPath();
      ctx.arc(col, row, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── 3. Header — FAMEUXARTE wordmark ────────────────────────────────────
  const headerY = 148;

  // Thin decorative top rule
  ctx.strokeStyle = `${COLOR.gold}55`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 96);
  ctx.lineTo(CARD_W - 80, 96);
  ctx.stroke();

  ctx.fillStyle = COLOR.linen;
  ctx.font = `bold 68px ${FONT.serif}`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '12px';
  ctx.fillText('FAMEUXARTE', CARD_W / 2, headerY);

  // "Discover. Own. Cherish." tagline
  ctx.fillStyle = COLOR.stone;
  ctx.font = `400 22px ${FONT.sans}`;
  ctx.letterSpacing = '6px';
  ctx.fillText('DISCOVER · OWN · CHERISH', CARD_W / 2, headerY + 46);

  // Reset letter spacing
  ctx.letterSpacing = '0px';

  // ── 4. Artwork image ──────────────────────────────────────────────────────
  const IMG_BOX_X = 60;
  const IMG_BOX_Y = 280;
  const IMG_BOX_W = CARD_W - 120;
  const IMG_BOX_H = 960;

  let corsBlocked = false;
  let artworkImg: HTMLImageElement | null = null;

  if (config.imageUrl && config.imageUrl !== '/placeholder.svg') {
    artworkImg = await loadImageForCanvas(config.imageUrl);
  }

  // Image container background (always drawn)
  ctx.fillStyle = COLOR.imageBackground;
  ctx.beginPath();
  ctx.roundRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H, 12);
  ctx.fill();

  if (artworkImg) {
    // Draw artwork
    try {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H, 12);
      ctx.clip();
      drawArtworkContained(ctx, artworkImg, IMG_BOX_X + 20, IMG_BOX_Y + 20, IMG_BOX_W - 40, IMG_BOX_H - 40);
      ctx.restore();
    } catch {
      corsBlocked = true;
    }

    // Subtle inner shadow/vignette on the image box
    const vignette = ctx.createRadialGradient(
      CARD_W / 2, IMG_BOX_Y + IMG_BOX_H / 2, IMG_BOX_H * 0.2,
      CARD_W / 2, IMG_BOX_Y + IMG_BOX_H / 2, IMG_BOX_H * 0.65,
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H, 12);
    ctx.clip();
    ctx.fillStyle = vignette;
    ctx.fillRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H);
    ctx.restore();
  } else if (!artworkImg && config.imageUrl) {
    // Image failed to load — note it (corsBlocked is accurate indicator)
    corsBlocked = true;
    // Draw a subtle placeholder pattern
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H, 12);
    ctx.clip();
    ctx.fillStyle = '#161620';
    ctx.fillRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H);
    // Diagonal lines texture
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = -IMG_BOX_H; i < IMG_BOX_W + IMG_BOX_H; i += 32) {
      ctx.beginPath();
      ctx.moveTo(IMG_BOX_X + i, IMG_BOX_Y);
      ctx.lineTo(IMG_BOX_X + i + IMG_BOX_H, IMG_BOX_Y + IMG_BOX_H);
      ctx.stroke();
    }
    // Center text
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = `400 26px ${FONT.sans}`;
    ctx.textAlign = 'center';
    ctx.fillText('Original Artwork', CARD_W / 2, IMG_BOX_Y + IMG_BOX_H / 2);
    ctx.restore();
  }

  // Image box border
  ctx.strokeStyle = `${COLOR.faint}`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H, 12);
  ctx.stroke();

  // ── 5. Text block below image ─────────────────────────────────────────────
  const TEXT_TOP = IMG_BOX_Y + IMG_BOX_H + 56;
  const TEXT_MAX_W = CARD_W - 160;
  ctx.textAlign = 'center';

  // Artwork title
  const titleFontSize = config.title.length > 30 ? 52 : 62;
  ctx.fillStyle = COLOR.linen;
  ctx.font = `bold ${titleFontSize}px ${FONT.serif}`;
  const titleBottom = drawWrappedText(
    ctx,
    `"${config.title}"`,
    CARD_W / 2,
    TEXT_TOP,
    TEXT_MAX_W,
    titleFontSize * 1.25,
  );

  // Artist name
  if (config.subtitle) {
    ctx.fillStyle = COLOR.stone;
    ctx.font = `400 30px ${FONT.sans}`;
    ctx.fillText(`by ${config.subtitle}`, CARD_W / 2, titleBottom + 18);
  }

  // Meta line (medium · year)
  const metaY = titleBottom + (config.subtitle ? 76 : 24);
  if (config.metaLine) {
    ctx.fillStyle = COLOR.muted;
    ctx.font = `400 24px ${FONT.sans}`;
    ctx.fillText(config.metaLine, CARD_W / 2, metaY);
  }

  // ── 6. Footer ─────────────────────────────────────────────────────────────
  const FOOTER_Y = CARD_H - 160;

  // Separator line
  ctx.strokeStyle = `${COLOR.faint}`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, FOOTER_Y - 24);
  ctx.lineTo(CARD_W - 80, FOOTER_Y - 24);
  ctx.stroke();

  // CTA text
  const ctaText = config.ctaText ?? 'Discover original art from emerging artists';
  ctx.fillStyle = COLOR.muted;
  ctx.font = `400 24px ${FONT.sans}`;
  ctx.fillText(ctaText, CARD_W / 2, FOOTER_Y + 12);

  // Domain — gold, serif, prominent
  ctx.fillStyle = COLOR.gold;
  ctx.font = `400 34px ${FONT.serif}`;
  ctx.letterSpacing = '2px';
  ctx.fillText(SITE_DOMAIN, CARD_W / 2, FOOTER_Y + 70);
  ctx.letterSpacing = '0px';

  // Bottom rule
  ctx.strokeStyle = `${COLOR.gold}55`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, FOOTER_Y + 100);
  ctx.lineTo(CARD_W - 80, FOOTER_Y + 100);
  ctx.stroke();

  // ── 7. Export to Blob ──────────────────────────────────────────────────────
  return new Promise((resolve) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, corsBlocked });
          } else {
            resolve(null);
          }
        },
        'image/png',
        1.0,
      );
    } catch (err) {
      // SecurityError — canvas is tainted (CORS)
      console.warn('[shareArtwork] Canvas tainted — CORS blocked artwork image:', err);
      // Attempt again without the artwork image (text-only branded card)
      ctx.fillStyle = COLOR.background;
      ctx.fillRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H);
      ctx.fillStyle = '#161620';
      ctx.beginPath();
      ctx.roundRect(IMG_BOX_X, IMG_BOX_Y, IMG_BOX_W, IMG_BOX_H, 12);
      ctx.fill();
      try {
        canvas.toBlob(
          (blob) => resolve(blob ? { blob, corsBlocked: true } : null),
          'image/png',
          1.0,
        );
      } catch {
        resolve(null);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Share text + URL helpers
// ---------------------------------------------------------------------------

/**
 * Build dynamic share text for an artwork.
 * Example: "Discover 'Golden Horizon' by Anita Rao on Fameuxarte — original art from emerging artists."
 */
export function buildArtworkShareText(title: string, artistName: string): string {
  return `Discover "${title}" by ${artistName} on Fameuxarte — original art from emerging artists.\n\n${SITE_ORIGIN}`;
}

/**
 * Build the canonical public URL for an artwork page.
 * Always uses the slug if available; falls back to the id.
 */
export function buildArtworkShareUrl(slug: string | null | undefined, id: string): string {
  const path = slug && slug.trim() ? slug : id;
  return `${SITE_ORIGIN}/artworks/${path}`;
}

// ---------------------------------------------------------------------------
// Capability detection
// ---------------------------------------------------------------------------

/** Detect what sharing mechanisms are available in the current browser. */
export function detectShareCapabilities(): ShareCapabilities {
  const isMobile = typeof window !== 'undefined'
    ? /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.matchMedia('(max-width: 768px)').matches
    : false;

  const canShareText =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  let canShareFiles = false;
  if (canShareText && typeof navigator.canShare === 'function') {
    try {
      // A dummy 1-byte PNG to test file sharing support
      const testFile = new File(
        [new Uint8Array([137, 80, 78, 71])],
        'test.png',
        { type: 'image/png' },
      );
      canShareFiles = navigator.canShare({ files: [testFile] });
    } catch {
      canShareFiles = false;
    }
  }

  return { isMobile, canShareText, canShareFiles };
}

// ---------------------------------------------------------------------------
// Share actions
// ---------------------------------------------------------------------------

/**
 * Trigger the native OS share sheet with the generated image file.
 * Must be called synchronously from a user gesture (click handler).
 */
export async function triggerNativeShare(
  blob: Blob,
  title: string,
  text: string,
  url: string,
): Promise<ShareOutcome> {
  if (typeof navigator.share !== 'function') return 'unsupported';

  const filename = `fameuxarte-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  const { canShareFiles } = detectShareCapabilities();

  try {
    if (canShareFiles) {
      await navigator.share({ files: [file], title, text, url });
    } else {
      // Share text + URL only (no image file)
      await navigator.share({ title, text, url });
    }
    return 'shared';
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
    console.warn('[shareArtwork] navigator.share error:', err);
    return 'error';
  }
}

/**
 * Trigger a browser download of the generated PNG.
 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay to ensure the download starts
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

/**
 * Copy a string to the clipboard.
 * Returns true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}

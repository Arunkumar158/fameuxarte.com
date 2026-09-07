/**
 * email/design-system.ts
 * Fameuxarte Master Email Design System
 *
 * ONE reusable design system for all Fameuxarte emails.
 * Every template uses these components — consistent brand, zero duplication.
 *
 * Design direction:
 *   Premium · Minimalist · Editorial · Dark obsidian theme
 *   Gold accents · High whitespace · Strong visual hierarchy
 *   Mobile-first responsive · Accessible
 *
 * Deno-compatible — no React, no JSX.
 * Email-safe HTML/CSS only (inlined, table-based where required for Outlook).
 */

// ---------------------------------------------------------------------------
// Brand Tokens
// ---------------------------------------------------------------------------

export const BRAND = {
  colors: {
    obsidian:     '#0c0a09',   // Background
    surface1:     '#1c1917',   // Card background
    surface2:     '#292524',   // Secondary surface
    surface3:     '#3c3836',   // Input/tag background
    gold:         '#D4AF37',   // Primary accent
    goldLight:    '#E8C74A',   // Gold hover
    linen:        '#fafaf9',   // Primary text
    stone:        '#a8a29e',   // Secondary text
    muted:        '#78716c',   // Muted/footer text
    border:       'rgba(255,255,255,0.1)',
    success:      '#34d399',
    warning:      '#fbbf24',
    error:        '#f87171',
  },
  fonts: {
    // Email-safe fallback stack — Inter not available in most email clients
    body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  spacing: {
    container: '600px',
    padding:   '40px',
    cardPad:   '32px',
  },
  brand: {
    name:   'Fameuxarte',
    tagline: 'The Global Destination for Fine Art',
    url:    'https://fameuxarte.com',
    logo:   'FAMEUXARTE',     // Text logo — no image dependency in email
    year:   new Date().getFullYear(),
  },
} as const;

// ---------------------------------------------------------------------------
// Utility: safe HTML escape
// ---------------------------------------------------------------------------

export function escHtml(str: unknown): string {
  if (str === null || str === undefined || str === '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/** Master email layout — wraps all content */
export function EmailLayout(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${escHtml(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    body {
      margin: 0;
      padding: 0;
      background-color: ${BRAND.colors.obsidian};
      font-family: ${BRAND.fonts.body};
      -webkit-font-smoothing: antialiased;
    }
    
    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-pad { padding: 20px !important; }
      .card-pad { padding: 24px !important; }
      .btn-block { display: block !important; text-align: center !important; }
      .hide-mobile { display: none !important; }
      .stack-mobile { display: block !important; width: 100% !important; }
      .font-mobile-sm { font-size: 13px !important; }
      h1, .h1 { font-size: 22px !important; }
    }
    
    /* Outlook link color fix */
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    
    /* Gmail-specific */
    u + #body a { color: ${BRAND.colors.gold}; text-decoration: none; }
  </style>
</head>
<body id="body" style="margin:0;padding:0;background-color:${BRAND.colors.obsidian};">
  <!-- Preheader text (hidden, sets email preview) -->

  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${BRAND.colors.obsidian};">
    <tr>
      <td align="center" style="padding:40px 20px;" class="email-pad">
        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px;width:100%;">

          ${EmailHeader()}

          <!-- Content -->
          <tr>
            <td>
              ${content}
            </td>
          </tr>

          ${EmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Email header with Fameuxarte logo */
export function EmailHeader(): string {
  return `
  <!-- Header -->
  <tr>
    <td align="center" style="padding:0 0 32px 0;">
      <a href="${BRAND.brand.url}" style="text-decoration:none;" target="_blank">
        <span style="
          font-family:${BRAND.fonts.body};
          font-size:20px;
          font-weight:300;
          letter-spacing:0.2em;
          text-transform:uppercase;
          color:${BRAND.colors.linen};
          text-decoration:none;
        ">${BRAND.brand.logo}</span>
      </a>
    </td>
  </tr>`;
}

/** Email footer with copyright, links */
export function EmailFooter(options?: { unsubscribeUrl?: string }): string {
  const unsubscribeLink = options?.unsubscribeUrl
    ? `<a href="${escHtml(options.unsubscribeUrl)}" style="color:${BRAND.colors.muted};text-decoration:underline;font-size:12px;">Unsubscribe</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;`
    : '';

  return `
  <!-- Footer -->
  <tr>
    <td align="center" style="padding:32px 0 0 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding-bottom:16px;">
            <div style="height:1px;background-color:${BRAND.colors.border};width:100%;"></div>
          </td>
        </tr>
        <tr>
          <td align="center" style="font-family:${BRAND.fonts.body};font-size:12px;color:${BRAND.colors.muted};line-height:1.6;">
            <p style="margin:0 0 8px 0;">${BRAND.brand.name} &mdash; ${BRAND.brand.tagline}</p>
            <p style="margin:0 0 12px 0;">
              ${unsubscribeLink}
              <a href="${BRAND.brand.url}/legal/privacy" style="color:${BRAND.colors.muted};text-decoration:underline;font-size:12px;">Privacy Policy</a>
              &nbsp;&nbsp;&bull;&nbsp;&nbsp;
              <a href="${BRAND.brand.url}/legal/terms" style="color:${BRAND.colors.muted};text-decoration:underline;font-size:12px;">Terms of Service</a>
              &nbsp;&nbsp;&bull;&nbsp;&nbsp;
              <a href="${BRAND.brand.url}/contact-us" style="color:${BRAND.colors.muted};text-decoration:underline;font-size:12px;">Contact Us</a>
            </p>
            <p style="margin:0;color:${BRAND.colors.muted};font-size:11px;">&copy; ${BRAND.brand.year} ${BRAND.brand.name}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

/** Reusable email card wrapper */
export function EmailCard(content: string): string {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="background-color:${BRAND.colors.surface1};border-radius:12px;border:1px solid ${BRAND.colors.border};overflow:hidden;">
    <tr>
      <td style="padding:32px;" class="card-pad">
        ${content}
      </td>
    </tr>
  </table>`;
}

/** Email heading (H1) */
export function EmailHeading(text: string): string {
  return `<h1 style="
    font-family:${BRAND.fonts.body};
    font-size:24px;
    font-weight:500;
    line-height:1.3;
    color:${BRAND.colors.linen};
    margin:0 0 20px 0;
    letter-spacing:-0.01em;
  " class="h1">${escHtml(text)}</h1>`;
}

/** Email subheading (H2) */
export function EmailSubheading(text: string): string {
  return `<h2 style="
    font-family:${BRAND.fonts.body};
    font-size:16px;
    font-weight:500;
    line-height:1.4;
    color:${BRAND.colors.linen};
    margin:0 0 12px 0;
  ">${escHtml(text)}</h2>`;
}

/** Body paragraph */
export function EmailText(text: string, opts?: { small?: boolean; muted?: boolean }): string {
  const size   = opts?.small ? '13px' : '15px';
  const color  = opts?.muted ? BRAND.colors.stone : BRAND.colors.stone;
  return `<p style="
    font-family:${BRAND.fonts.body};
    font-size:${size};
    line-height:1.6;
    color:${color};
    margin:0 0 20px 0;
  ">${text}</p>`;
}

/** Primary CTA button */
export function EmailButton(label: string, href: string, opts?: { secondary?: boolean }): string {
  const bg   = opts?.secondary ? BRAND.colors.surface2 : BRAND.colors.linen;
  const text = opts?.secondary ? BRAND.colors.linen : BRAND.colors.obsidian;
  const border = opts?.secondary ? `border:1px solid ${BRAND.colors.border};` : '';
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 24px 0;">
    <tr>
      <td align="center" style="border-radius:6px;background-color:${bg};${border}">
        <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
            href="${escHtml(href)}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="8%" strokecolor="${bg}" fillcolor="${bg}">
            <w:anchorlock/>
            <center style="color:${text};font-family:${BRAND.fonts.body};font-size:14px;font-weight:500;">${escHtml(label)}</center>
          </v:roundrect>
        <![endif]-->
        <a href="${escHtml(href)}"
          target="_blank"
          style="
            display:inline-block;
            padding:12px 28px;
            font-family:${BRAND.fonts.body};
            font-size:14px;
            font-weight:500;
            color:${text};
            text-decoration:none;
            border-radius:6px;
            mso-hide:all;
          ">${escHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

/** Horizontal divider */
export function EmailDivider(): string {
  return `<div style="height:1px;background-color:${BRAND.colors.border};margin:24px 0;"></div>`;
}

/** Key-value info row (order details etc.) */
export function EmailInfoRow(label: string, value: string, highlight?: boolean): string {
  const valueColor = highlight ? BRAND.colors.gold : BRAND.colors.linen;
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="margin-bottom:10px;">
    <tr>
      <td style="font-family:${BRAND.fonts.body};font-size:13px;color:${BRAND.colors.stone};padding-right:16px;vertical-align:top;width:50%;">
        ${escHtml(label)}
      </td>
      <td align="right" style="font-family:${BRAND.fonts.body};font-size:13px;color:${valueColor};font-weight:500;vertical-align:top;text-align:right;">
        ${escHtml(value)}
      </td>
    </tr>
  </table>`;
}

/** Status badge pill */
export function EmailStatusBadge(status: string, type: 'success' | 'warning' | 'info' | 'neutral' = 'info'): string {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: 'rgba(52,211,153,0.15)', text: BRAND.colors.success },
    warning: { bg: 'rgba(251,191,36,0.15)', text: BRAND.colors.warning },
    info:    { bg: `rgba(212,175,55,0.15)`, text: BRAND.colors.gold },
    neutral: { bg: `rgba(168,162,158,0.15)`, text: BRAND.colors.stone },
  };
  const c = colors[type];
  return `<span style="
    display:inline-block;
    padding:3px 10px;
    border-radius:100px;
    font-family:${BRAND.fonts.body};
    font-size:11px;
    font-weight:500;
    letter-spacing:0.05em;
    text-transform:uppercase;
    background-color:${c.bg};
    color:${c.text};
  ">${escHtml(status)}</span>`;
}

/** Artwork card — image left, title/artist right */
export function EmailArtworkCard(opts: {
  title: string;
  artist: string;
  price?: string;
  imageUrl?: string;
  artworkUrl?: string;
  quantity?: number;
}): string {
  const imgCell = opts.imageUrl
    ? `<td style="width:80px;padding-right:16px;vertical-align:top;" class="hide-mobile">
        <img src="${escHtml(opts.imageUrl)}" alt="${escHtml(opts.title)}" width="80" height="80"
          style="display:block;border-radius:6px;width:80px;height:80px;object-fit:cover;background-color:${BRAND.colors.surface3};">
      </td>`
    : `<td style="width:80px;padding-right:16px;vertical-align:top;" class="hide-mobile">
        <div style="width:80px;height:80px;border-radius:6px;background-color:${BRAND.colors.surface3};display:flex;align-items:center;justify-content:center;">
        </div>
      </td>`;

  const titleEl = opts.artworkUrl
    ? `<a href="${escHtml(opts.artworkUrl)}" style="font-family:${BRAND.fonts.body};font-size:14px;font-weight:500;color:${BRAND.colors.linen};text-decoration:none;">${escHtml(opts.title)}</a>`
    : `<span style="font-family:${BRAND.fonts.body};font-size:14px;font-weight:500;color:${BRAND.colors.linen};">${escHtml(opts.title)}</span>`;

  const quantityEl = opts.quantity && opts.quantity > 1
    ? `<span style="font-size:12px;color:${BRAND.colors.stone};"> &times; ${opts.quantity}</span>`
    : '';

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="background-color:${BRAND.colors.surface2};border-radius:8px;margin-bottom:12px;">
    <tr>
      <td style="padding:16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            ${imgCell}
            <td style="vertical-align:top;">
              ${titleEl}${quantityEl}
              <p style="font-family:${BRAND.fonts.body};font-size:12px;color:${BRAND.colors.stone};margin:4px 0 0 0;">by ${escHtml(opts.artist)}</p>
              ${opts.price ? `<p style="font-family:${BRAND.fonts.body};font-size:14px;font-weight:600;color:${BRAND.colors.gold};margin:8px 0 0 0;">${escHtml(opts.price)}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

/** Order summary block */
export function EmailOrderSummary(opts: {
  subtotal: string;
  shippingFee: string;
  total: string;
}): string {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="background-color:${BRAND.colors.surface2};border-radius:8px;margin-top:16px;">
    <tr>
      <td style="padding:16px;">
        ${EmailInfoRow('Subtotal', opts.subtotal)}
        ${EmailInfoRow('Shipping', opts.shippingFee)}
        <div style="height:1px;background-color:${BRAND.colors.border};margin:10px 0;"></div>
        ${EmailInfoRow('Total', opts.total, true)}
      </td>
    </tr>
  </table>`;
}

/** Support box — "Need help?" footer block */
export function EmailSupportBox(): string {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="margin-top:24px;background-color:${BRAND.colors.surface2};border-radius:8px;border:1px solid ${BRAND.colors.border};">
    <tr>
      <td style="padding:20px;text-align:center;">
        <p style="font-family:${BRAND.fonts.body};font-size:13px;color:${BRAND.colors.stone};margin:0 0 8px 0;">
          Need help with your order?
        </p>
        <a href="https://fameuxarte.com/collector/support"
          style="font-family:${BRAND.fonts.body};font-size:13px;color:${BRAND.colors.gold};text-decoration:none;font-weight:500;">
          Contact Fameuxarte Support &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

/** Section label / eyebrow text */
export function EmailLabel(text: string): string {
  return `<p style="
    font-family:${BRAND.fonts.body};
    font-size:11px;
    font-weight:500;
    letter-spacing:0.1em;
    text-transform:uppercase;
    color:${BRAND.colors.muted};
    margin:0 0 8px 0;
  ">${escHtml(text)}</p>`;
}

/** Preheader hidden text (email client preview) */
export function EmailPreheader(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;font-size:1px;color:${BRAND.colors.obsidian};">${escHtml(text)}</div>`;
}

/** Gold accent bar at top of card */
export function EmailAccentBar(): string {
  return `<div style="height:3px;background:linear-gradient(90deg,${BRAND.colors.gold},${BRAND.colors.goldLight});border-radius:2px 2px 0 0;margin:-32px -32px 24px -32px;"></div>`;
}

/** Certificate number display */
export function EmailCertificateNumber(certNumber: string): string {
  return `
  <div style="
    background-color:${BRAND.colors.surface2};
    border:1px solid ${BRAND.colors.gold};
    border-radius:8px;
    padding:16px;
    text-align:center;
    margin:16px 0;
  ">
    <p style="font-family:${BRAND.fonts.body};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.colors.muted};margin:0 0 4px 0;">Certificate Number</p>
    <p style="font-family:'Courier New',Courier,monospace;font-size:18px;font-weight:700;color:${BRAND.colors.gold};margin:0;letter-spacing:0.05em;">${escHtml(certNumber)}</p>
  </div>`;
}

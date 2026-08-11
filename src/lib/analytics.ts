/**
 * analytics.ts
 * Reusable PostHog analytics utility for Fameuxarte.
 *
 * Usage:
 *   import { trackEvent, identifyUser } from '@/lib/analytics';
 *   trackEvent('button_clicked', { button_name: 'Buy Now' });
 *   identifyUser('user-123', { email: 'user@example.com', role: 'buyer' });
 */

// Guard: posthog is a browser-only library. This module is safe to import
// anywhere because every public function checks `typeof window` before acting.
import { supabase } from '@/integrations/supabase/client';

const isBrowser = typeof window !== 'undefined';

/** Lazily retrieve the posthog singleton so SSR never blows up. */
const getPostHog = () => {
  if (!isBrowser) return null;
  // posthog-js sets window.posthog after init; for tree-shaking we use the
  // named import path but fall back to the global just in case.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('posthog-js').default;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Track a custom event with optional properties.
 *
 * @example
 * trackEvent('button_clicked', { button_name: 'Add to Cart' });
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
): void => {
  const ph = getPostHog();
  if (!ph) return;
  ph.capture(eventName, properties ?? {});
};

/**
 * Identify the currently logged-in user so PostHog links events to a person.
 *
 * @param userId  Unique identifier (e.g. Supabase user.id)
 * @param props   Optional traits: email, name, role, etc.
 *
 * @example
 * identifyUser('uuid-123', { email: 'alice@example.com', role: 'buyer' });
 */
export const identifyUser = (
  userId: string,
  props?: Record<string, unknown>
): void => {
  const ph = getPostHog();
  if (!ph) return;
  ph.identify(userId, props ?? {});
};

/**
 * Reset the PostHog identity — call this on sign-out so the next user
 * gets a fresh anonymous session.
 */
export const resetAnalytics = (): void => {
  const ph = getPostHog();
  if (!ph) return;
  ph.reset();
};

// ---------------------------------------------------------------------------
// Sample custom events (requirement §6)
// ---------------------------------------------------------------------------

/** Fire when a user completes sign-up. */
export const trackUserSignedUp = (props?: { method?: string }) =>
  trackEvent('user_signed_up', props);

/** Fire when a page is intentionally viewed (supplements auto-pageview). */
export const trackPageViewed = (props?: { page?: string; title?: string }) =>
  trackEvent('page_viewed', props);

/** Fire when a notable button is clicked. */
export const trackButtonClicked = (props?: {
  button_name?: string;
  page?: string;
}) => trackEvent('button_clicked', props);

// ---------------------------------------------------------------------------
// QA & Discovery Diagnostics (Sprint 5.7)
// ---------------------------------------------------------------------------

export const trackDiscoveryAuditCompleted = (props?: { score?: number; url?: string; passed?: boolean }) =>
  trackEvent('discovery_audit_completed', props);

export const trackPageIndexabilityChecked = (props?: { url?: string; indexable?: boolean }) =>
  trackEvent('page_indexability_checked', props);

export const trackStructuredDataValidated = (props?: { url?: string; isValid?: boolean }) =>
  trackEvent('structured_data_validated', props);

export const trackAiReadinessChecked = (props?: { url?: string; score?: number }) =>
  trackEvent('ai_readiness_checked', props);

export const trackAccessibilityChecked = (props?: { url?: string; score?: number }) =>
  trackEvent('accessibility_checked', props);

export const trackPerformanceChecked = (props?: { url?: string; score?: number }) =>
  trackEvent('performance_checked', props);

export const trackSitemapGenerated = (props?: { totalUrls?: number }) =>
  trackEvent('sitemap_generated', props);

// ---------------------------------------------------------------------------
// Trust & Real-Time Metrics (Sprint 2)
// ---------------------------------------------------------------------------

const SESSION_VIEW_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

const hasViewedRecently = (key: string): boolean => {
  if (!isBrowser) return false;
  try {
    const lastViewed = sessionStorage.getItem(key);
    if (!lastViewed) return false;
    if (Date.now() - parseInt(lastViewed, 10) < SESSION_VIEW_EXPIRY_MS) {
      return true;
    }
  } catch (e) {
    // sessionStorage not available (incognito, etc.)
  }
  return false;
};

const markAsViewed = (key: string): void => {
  if (!isBrowser) return;
  try {
    sessionStorage.setItem(key, Date.now().toString());
  } catch (e) {}
};

/**
 * Track an artwork view in both PostHog and Supabase with deduplication.
 */
export const recordArtworkView = async (artworkId: string, title: string, artistId: string | null) => {
  if (!artworkId) return;
  
  // Track in PostHog
  trackEvent('artwork_viewed', { 
    artwork_id: artworkId, 
    title: title,
    artist_id: artistId
  });

  // Check deduplication token for Supabase increment
  const sessionKey = `viewed_artwork_${artworkId}`;
  if (hasViewedRecently(sessionKey)) return;

  markAsViewed(sessionKey);
  
  // Increment in Supabase
  try {
    const { error } = await supabase.rpc('increment_artwork_view', { p_artwork_id: artworkId });
    if (error) console.error("Failed to increment artwork view:", error);
  } catch (err) {
    console.error("Error calling increment_artwork_view:", err);
  }
};

/**
 * Track an artist profile view in both PostHog and Supabase with deduplication.
 */
export const recordProfileView = async (artistId: string, artistName: string | null) => {
  if (!artistId) return;

  // Track in PostHog
  trackEvent('artist_profile_viewed', { 
    artist_id: artistId, 
    name: artistName || 'Unknown Artist'
  });

  // Check deduplication token for Supabase increment
  const sessionKey = `viewed_artist_${artistId}`;
  if (hasViewedRecently(sessionKey)) return;

  markAsViewed(sessionKey);
  
  // Increment in Supabase
  try {
    const { error } = await supabase.rpc('increment_profile_view', { p_artist_id: artistId });
    if (error) console.error("Failed to increment profile view:", error);
  } catch (err) {
    console.error("Error calling increment_profile_view:", err);
  }
};

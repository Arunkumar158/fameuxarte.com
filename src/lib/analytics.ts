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

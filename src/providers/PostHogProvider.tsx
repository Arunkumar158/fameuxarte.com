/**
 * PostHogProvider.tsx
 *
 * Initializes PostHog once on the client side (never during SSR).
 * Wrap this around your app in App.tsx so every page gets analytics.
 *
 * Features enabled:
 *  - autocapture  (clicks, form inputs, pageviews)
 *  - capture_pageview (automatic $pageview on route change)
 *  - capture_pageleave
 */

import { useEffect, useRef } from 'react';
import posthog from 'posthog-js';
import { useLocation } from 'react-router-dom';

// ─── Config ────────────────────────────────────────────────────────────────
const POSTHOG_KEY  = 'phc_avR5yTz17AURm69ADMuVRyOdcwwzoXOIWI75VDYZI4n';
const POSTHOG_HOST = 'https://app.posthog.com';
// ───────────────────────────────────────────────────────────────────────────

interface PostHogProviderProps {
  children: React.ReactNode;
}

/**
 * PostHogProvider
 *
 * - Initialises PostHog exactly once (guarded by a ref + `__SU_INITIALIZED__`
 *   flag to survive React Strict-Mode double-invocation).
 * - Sends a `$pageview` event on every React Router navigation.
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  const initialized = useRef(false);
  const location    = useLocation();

  // ── 1. Initialise PostHog (client-side, once) ──────────────────────────
  useEffect(() => {
    // Hard guard: skip if not a browser environment (SSR safety)
    if (typeof window === 'undefined') return;

    // Prevent re-initialisation across Strict Mode double mounts
    if (initialized.current) return;
    initialized.current = true;

    posthog.init(POSTHOG_KEY, {
      api_host:            POSTHOG_HOST,
      autocapture:         true,           // auto-track clicks, inputs, etc.
      capture_pageview:    false,          // we fire $pageview manually below
      capture_pageleave:   true,           // track when users leave
      persistence:         'localStorage', // survive page refreshes
      loaded: (ph) => {
        // Console confirmation once PostHog is ready
        console.log('[PostHog] Analytics initialised ✅', ph.get_distinct_id());
      },
    });
  }, []);

  // ── 2. Send $pageview on every route change ────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!posthog.__loaded) return;

    posthog.capture('$pageview', {
      $current_url: window.location.href,
    });
  }, [location.pathname, location.search]);

  return <>{children}</>;
}

export default PostHogProvider;

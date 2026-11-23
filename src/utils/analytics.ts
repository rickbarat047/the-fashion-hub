/**
 * Privacy-first analytics: every storefront event funnels through trackEvent(),
 * which forwards to Vercel Web Analytics (custom events, no cookies) and keeps
 * the console + dataLayer hooks for debugging and future tag managers.
 */
import { track as vaTrack } from "@vercel/analytics";
import { trackGAEvent } from "./ga";

export type AnalyticsEvent =
  | { type: "product_view"; productId: string; productName: string; price: number }
  | { type: "product_search"; query: string; resultsCount: number }
  | { type: "category_click"; category: string }
  | { type: "wishlist_add"; productId: string; productName: string }
  | { type: "wishlist_remove"; productId: string }
  | { type: "product_share"; productId: string; method: "native" | "clipboard" | "whatsapp" }
  | { type: "buy_now_click"; productId: string; productName: string; price: number; url: string }
  | { type: "instagram_click"; location: string };

/** Flatten an event into string-only properties for Vercel custom events. */
function toProps(event: AnalyticsEvent): Record<string, string> {
  const props: Record<string, string> = {};
  for (const [k, v] of Object.entries(event)) {
    if (k === "type") continue;
    props[k] = typeof v === "string" ? v : String(v);
  }
  return props;
}

/** Server-side log of BUY taps for the morning email digest. */
function trackBuyServer(event: AnalyticsEvent): void {
  if (event.type !== "buy_now_click") return;
  try {
    fetch("/api/track-buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: event.productId,
        productName: event.productName,
        price: event.price,
      }),
      keepalive: true,
    }).catch(() => {
      // digest logging must never break the storefront
    });
  } catch {
    // ignore — fetch unavailable
  }
}

/**
 * Opt out of analytics when browsing your own site.
 * Run this in the browser console:
 *   localStorage.setItem("fashionhub_no_track", "1")
 * To re-enable:
 *   localStorage.removeItem("fashionhub_no_track")
 */
function isOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("fashionhub_no_track") === "1";
}

export function trackEvent(event: AnalyticsEvent): void {
  // Skip analytics entirely when the visitor has opted out (e.g., site owner browsing)
  if (isOptedOut()) return;

  // In development, log cleanly to console without cluttering
  if (process.env.NODE_ENV !== "production") {
    // Quiet developer log
    console.debug(`[FashionHub Analytics] ${event.type}:`, event);
  }

  // Vercel Web Analytics custom event (visible on Pro; harmless on Hobby)
  try {
    vaTrack(event.type, toProps(event));
  } catch {
    // analytics must never break the storefront
  }

  // Server-side tap log for the morning email digest.
  // Fire-and-forget: must never delay the Meesho redirect.
  trackBuyServer(event);

  // Google Analytics 4 (free, unlimited history) — same events, recommended names
  trackGAEvent(event);

  // Hook for Google Tag Manager / window.dataLayer if present in future
  if (typeof window !== "undefined" && (window as unknown as { dataLayer?: unknown[] }).dataLayer) {
    (window as unknown as { dataLayer: unknown[] }).dataLayer.push({
      event: event.type,
      ...event,
      timestamp: new Date().toISOString(),
    });
  }
}

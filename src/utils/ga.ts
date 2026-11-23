/**
 * Google Analytics 4 bridge.
 * Maps storefront events to GA4 recommended ecommerce events so the standard
 * GA4 reports (items viewed, wishlisted, selected) work with zero custom
 * dimension setup. No-ops when no measurement ID is configured.
 */

import type { AnalyticsEvent } from "./analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

let initialized = false;

export function initGA(measurementId: string | undefined) {
  if (!measurementId || initialized) return;
  if (typeof document === "undefined") return;
  try {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    const gtag = (...args: unknown[]) => {
      (window.dataLayer as unknown[]).push(args);
    };
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", measurementId);
    initialized = true;
  } catch {
    // analytics must never break the storefront
  }
}

const INR = "INR";

export function trackGAEvent(event: AnalyticsEvent): void {
  if (!initialized || typeof window === "undefined" || !window.gtag) return;
  try {
    const gtag = window.gtag;
    switch (event.type) {
      case "product_view":
        gtag("event", "view_item", {
          currency: INR,
          value: event.price,
          items: [{ item_id: event.productId, item_name: event.productName, price: event.price }],
        });
        break;
      case "wishlist_add":
        gtag("event", "add_to_wishlist", {
          currency: INR,
          items: [{ item_id: event.productId, item_name: event.productName }],
        });
        break;
      case "buy_now_click":
        gtag("event", "select_item", {
          currency: INR,
          value: event.price,
          items: [{ item_id: event.productId, item_name: event.productName, price: event.price }],
        });
        break;
      case "product_share":
        gtag("event", "share", {
          method: event.method,
          content_type: "product",
          item_id: event.productId,
        });
        break;
      case "product_search":
        gtag("event", "search", { search_term: event.query });
        break;
      case "category_click":
        gtag("event", "view_item_list", {
          item_list_id: event.category,
          item_list_name: event.category,
        });
        break;
      case "instagram_click":
        gtag("event", "select_content", {
          content_type: "instagram",
          item_id: event.location,
        });
        break;
      case "wishlist_remove":
        break;
    }
  } catch {
    // analytics must never break the storefront
  }
}

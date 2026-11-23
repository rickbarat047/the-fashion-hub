import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "../types/product";

export interface LivePrice {
  price: number;
  priceLabel: string;
  rating?: number;
  ratingCount?: number;
}

interface PriceContextType {
  /** Live price + formatted label, falling back to the catalog snapshot. */
  getPrice: (product: Product) => { price: number; priceLabel: string };
  /** Fresh rating figures when Meesho supplied them. */
  getRating: (product: Product) => { rating?: number; ratingCount?: number };
  isLive: boolean;
}

const fallback = (product: Product) => ({
  price: product.price,
  priceLabel: product.priceLabel || `₹${product.price}`,
});

const PriceContext = createContext<PriceContextType>({
  getPrice: fallback,
  getRating: () => ({}),
  isLive: false,
});

function isLivePrice(value: unknown): value is LivePrice {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<LivePrice>;
  return (
    typeof candidate.price === "number" &&
    isFinite(candidate.price) &&
    candidate.price > 0
  );
}

/**
 * Loads live Meesho prices once per session. The UI renders immediately with
 * catalog prices and quietly updates in place when the API responds.
 */
export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMap] = useState<Record<string, LivePrice>>({});
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const apply = (data: unknown): boolean => {
      const next: Record<string, LivePrice> = {};
      if (data && typeof data === "object") {
        for (const [key, value] of Object.entries(data)) {
          if (!isLivePrice(value)) continue;
          next[key] = {
            price: value.price,
            priceLabel:
              value.priceLabel || `₹${value.price.toLocaleString("en-IN")}`,
            ...(typeof value.rating === "number" ? { rating: value.rating } : {}),
            ...(typeof value.ratingCount === "number" ? { ratingCount: value.ratingCount } : {}),
          };
        }
      }
      if (Object.keys(next).length === 0) return false;
      setMap(next);
      setIsLive(true);
      return true;
    };

    const load = async () => {
      try {
        const response = await fetch("/api/prices", { signal: controller.signal });
        if (response.ok && apply(await response.json())) return;
      } catch {
        // fall through to the snapshot
      }
      try {
        // Build-time snapshot, used if the live endpoint is unavailable.
        const response = await fetch("/prices.json", { signal: controller.signal });
        if (response.ok) apply(await response.json());
      } catch {
        // catalog snapshot prices remain in place
      }
    };

    load();

    return () => controller.abort();
  }, []);

  const value = useMemo<PriceContextType>(() => {
    const liveFor = (product: Product) =>
      product.meeshoProductId ? map[product.meeshoProductId] : undefined;

    return {
      getPrice: (product) => {
        const live = liveFor(product);
        if (!live) return fallback(product);
        const onwards =
          product.priceLabel?.includes("onwards") && !live.priceLabel.includes("onwards")
            ? " onwards"
            : "";
        return { price: live.price, priceLabel: `${live.priceLabel}${onwards}` };
      },
      getRating: (product) => {
        const live = liveFor(product);
        return {
          rating: live?.rating,
          ratingCount: live?.ratingCount,
        };
      },
      isLive,
    };
  }, [map, isLive]);

  return <PriceContext.Provider value={value}>{children}</PriceContext.Provider>;
};

export const usePrice = () => useContext(PriceContext);

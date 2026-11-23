import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, X } from "lucide-react";

interface StoredReview {
  rating: number;
  comments: string;
  author: string;
  helpfulCount: number;
  media: string[];
}

interface StoredEntry {
  rating: number;
  ratingCount: number;
  reviews: StoredReview[];
  fetchedAt: string;
}

let cache: Promise<Record<string, StoredEntry>> | null = null;

export function loadReviews(): Promise<Record<string, StoredEntry>> {
  if (!cache) {
    cache = fetch("/reviews.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
    // Never cache an empty/failed result — a later remount must retry.
    cache.then(
      (data) => {
        if (!data || Object.keys(data).length === 0) cache = null;
      },
      () => {
        cache = null;
      }
    );
  }
  return cache;
}

interface ReviewsProps {
  meeshoProductId?: string;
  affiliateUrl: string;
}

/**
 * Real buyer reviews pulled from Meesho at build time (see
 * scripts/fetch-reviews.cjs). Renders nothing when the product has
 * no collected reviews — never fakes any.
 */
export const Reviews: React.FC<ReviewsProps> = ({ meeshoProductId, affiliateUrl }) => {
  const [entry, setEntry] = useState<StoredEntry | null>(null);
  const [viewer, setViewer] = useState<{ images: string[]; index: number } | null>(null);

  useEffect(() => {
    if (!meeshoProductId) return;
    let live = true;
    let settled = false;
    const apply = (all: Record<string, StoredEntry>) => {
      if (!live || settled) return;
      const e = all[meeshoProductId];
      if (e && e.reviews && e.reviews.length > 0) {
        settled = true;
        setEntry(e);
      }
    };
    loadReviews().then(apply);
    // One delayed second chance so a single failed fetch never hides
    // reviews for the whole visit (e.g. direct landing from a share).
    const t = setTimeout(() => {
      if (!settled) loadReviews().then(apply);
    }, 4000);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [meeshoProductId]);

  // Lock scroll + keyboard nav while the photo viewer is open
  useEffect(() => {
    if (!viewer) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewer(null);
      if (e.key === "ArrowRight")
        setViewer((v) => (v ? { images: v.images, index: (v.index + 1) % v.images.length } : v));
      if (e.key === "ArrowLeft")
        setViewer((v) =>
          v ? { images: v.images, index: (v.index - 1 + v.images.length) % v.images.length } : v
        );
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [viewer]);

  if (!entry) return null;

  return (
    <div className="mt-14 sm:mt-20 border-t border-[#17130E]/12 pt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="meta-sm text-[#702629]">Buyer reviews — via Meesho</div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light tracking-tight mt-1">
            Worn &amp; rated.
          </h2>
        </div>
        <div className="text-right shrink-0">
          <div className="font-editorial text-3xl tabular-nums">★ {entry.rating}</div>
          <div className="meta-sm text-[#5F564A] mt-1">
            {entry.ratingCount.toLocaleString("en-IN")} ratings
          </div>
        </div>
      </div>

      <div className="mt-6 divide-y divide-[#17130E]/10 border-y border-[#17130E]/10">
        {entry.reviews.map((r, i) => (
          <div key={i} className="py-5 grid grid-cols-12 gap-3 sm:gap-6">
            <div className="col-span-12 sm:col-span-8">
              <div className="meta-sm text-[#702629]">★ {r.rating} / 5</div>
              <p className="mt-1.5 font-garamond text-lg sm:text-xl font-light leading-relaxed text-[#17130E]/90">
                &ldquo;{r.comments}&rdquo;
              </p>
              <div className="mt-2 meta-sm text-[#5F564A]">
                — {r.author}
                {r.helpfulCount > 0 && ` · helpful to ${r.helpfulCount}`}
              </div>
            </div>
            {r.media.length > 0 && (
              <div className="col-span-12 sm:col-span-4 flex gap-2">
                {r.media.map((src, j) => (
                  <button
                    key={j}
                    onClick={() => setViewer({ images: r.media, index: j })}
                    aria-label={`View buyer photo ${j + 1} full size`}
                    data-cursor="open"
                    className="block w-14 h-16 min-w-[44px] min-h-[44px] overflow-hidden border border-[#17130E]/15 bg-[#E6DFD3] hover:border-[#17130E] transition-colors"
                  >
                    <img
                      src={src}
                      alt={`Buyer photo ${j + 1}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover look-img pointer-events-none"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <a
        href={affiliateUrl}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="mt-5 meta underline underline-offset-8 inline-flex items-center gap-2"
      >
        Read all {entry.ratingCount.toLocaleString("en-IN")} reviews on Meesho
        <ArrowRight className="w-4 h-4" />
      </a>

      {/* Fullscreen buyer-photo viewer — complete uncropped pictures */}
      <AnimatePresence>
        {viewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[75] bg-[#17130E] text-[#F5F1E8] flex flex-col"
            role="dialog"
            aria-label="Buyer photo — full view"
          >
            <div className="flex items-center justify-between px-5 sm:px-10 min-h-14 sm:h-16 border-b border-[#F5F1E8]/15 shrink-0">
              <span className="meta-sm text-[#F5F1E8]/60">
                Buyer photo {viewer.index + 1} / {viewer.images.length}
              </span>
              <button
                onClick={() => setViewer(null)}
                aria-label="Close buyer photo"
                className="meta flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center"
              >
                Close <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center px-4 sm:px-10 py-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={viewer.index}
                  src={viewer.images[viewer.index]}
                  alt={`Buyer photo ${viewer.index + 1} — full view`}
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-full max-w-full object-contain look-img"
                  draggable={false}
                />
              </AnimatePresence>
            </div>

            {viewer.images.length > 1 && (
              <div className="shrink-0 border-t border-[#F5F1E8]/15 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2 justify-center">
                {viewer.images.map((src, j) => (
                  <button
                    key={j}
                    onClick={() => setViewer({ images: viewer.images, index: j })}
                    aria-label={`Buyer photo ${j + 1}`}
                    className={`w-12 h-14 overflow-hidden border min-w-[44px] min-h-[44px] ${
                      viewer.index === j ? "border-[#F5F1E8]" : "border-[#F5F1E8]/25 opacity-60"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

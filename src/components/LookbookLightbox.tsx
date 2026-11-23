import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import { Product } from "../types/product";
import { getPreferredImageSrc } from "./ImageWithFallback";
import { usePrice } from "../context/PriceContext";
import { trackEvent } from "../utils/analytics";

interface LookbookLightboxProps {
  product: Product | null;
  chapterNo: string;
  onClose: () => void;
  onOpenProduct: (p: Product) => void;
}

/**
 * Fullscreen photo viewer for lookbook slides — shows the COMPLETE,
 * uncropped dress photo (object-contain) with all listing angles.
 * Solid charcoal takeover, no glass. Tap thumbnails to switch angles.
 */
export const LookbookLightbox: React.FC<LookbookLightboxProps> = ({
  product,
  chapterNo,
  onClose,
  onOpenProduct,
}) => {
  const { getPrice } = usePrice();
  const [photo, setPhoto] = useState(0);
  const price = product ? getPrice(product) : null;

  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
      setPhoto(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && product) onClose();
      if (!product) return;
      if (e.key === "ArrowRight") setPhoto((i) => (i + 1) % product.images.length);
      if (e.key === "ArrowLeft")
        setPhoto((i) => (i - 1 + product.images.length) % product.images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  const openProduct = () => {
    if (!product) return;
    trackEvent({ type: "product_view", productId: product.id, productName: product.name, price: price?.price ?? product.price });
    onClose();
    onOpenProduct(product);
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[75] bg-[#141210] text-[#F3EFE7] flex flex-col"
          role="dialog"
          aria-label={`${product.name} — full photos`}
        >
          {/* top bar */}
          <div className="flex items-center justify-between px-5 sm:px-10 min-h-14 sm:h-16 border-b border-[#F3EFE7]/15 shrink-0">
            <span className="meta-sm text-[#F3EFE7]/60">
              {chapterNo} — {product.images.length} photos · swipe or tap thumbs
            </span>
            <button
              onClick={onClose}
              aria-label="Close full photos"
              className="meta flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center"
            >
              Close <X className="w-4 h-4" />
            </button>
          </div>

          {/* complete uncropped photo */}
          <div className="flex-1 min-h-0 flex items-center justify-center px-4 sm:px-10 py-4">
            <AnimatePresence mode="wait">
              <motion.img
                key={photo}
                src={getPreferredImageSrc(product.images[photo] || product.images[0])}
                alt={`${product.name} — full photo ${photo + 1}`}
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

          {/* angles + action */}
          <div className="shrink-0 border-t border-[#F3EFE7]/15 px-5 sm:px-10 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center mb-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setPhoto(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`w-12 h-14 overflow-hidden border min-w-[44px] min-h-[44px] ${
                      photo === i ? "border-[#F3EFE7]" : "border-[#F3EFE7]/25 opacity-60"
                    }`}
                  >
                    <img
                      src={getPreferredImageSrc(img)}
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
              <span className="meta-sm text-[#F3EFE7]/60 truncate">
                {price?.priceLabel ?? `₹${product.price}`}
              </span>
              <button
                onClick={openProduct}
                className="meta bg-[#F3EFE7] text-[#141210] px-6 min-h-[44px] flex items-center gap-2 shrink-0"
              >
                Discover piece <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

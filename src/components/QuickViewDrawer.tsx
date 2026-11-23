import React, { useEffect, useState } from "react";
import { X, ArrowRight, Heart } from "lucide-react";
import { Product } from "../types/product";
import { ImageWithFallback, getPreferredImageSrc } from "./ImageWithFallback";
import { useWishlist } from "../context/WishlistContext";
import { usePrice } from "../context/PriceContext";
import { trackEvent } from "../utils/analytics";

interface QuickViewDrawerProps {
  product: Product | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const QuickViewDrawer: React.FC<QuickViewDrawerProps> = ({
  product,
  onClose,
  onNavigate,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  if (!product) return null;
  const saved = isInWishlist(product.id);

  const buy = () => {
    trackEvent({
      type: "buy_now_click",
      productId: product.id,
      productName: product.name,
      price: price?.price ?? product.price,
      url: product.meeshoAffiliateUrl,
    });
    window.open(product.meeshoAffiliateUrl, "_blank", "nofollow sponsored noopener");
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-label={`Quick view ${product.name}`}>
      <div onClick={onClose} className="absolute inset-0 bg-[#17130E]/50" />
      <aside className="relative w-full max-w-md bg-[#F5F1E8] text-[#17130E] h-full overflow-y-auto border-l border-[#17130E]/15 flex flex-col">
        <div className="flex items-center justify-between px-5 min-h-14 border-b border-[#17130E]/10 shrink-0">
          <span className="meta-sm text-[#5F564A]">Quick view</span>
          <button
            onClick={onClose}
            aria-label="Close quick view"
            className="meta flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center"
          >
            Close <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          <div className="border border-[#17130E]/15 bg-[#E6DFD3] overflow-hidden">
            <ImageWithFallback
              src={product.images[photo] || product.images[0]}
              alt={product.name}
              aspectRatioClass="aspect-[3/4]"
              className="w-full h-full object-cover object-top look-img"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Product photos">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setPhoto(i)}
                  aria-label={`Photo ${i + 1}`}
                  aria-pressed={photo === i}
                  className={`w-14 h-[70px] shrink-0 overflow-hidden border bg-[#E6DFD3] ${
                    photo === i ? "border-[#17130E]" : "border-[#17130E]/15 opacity-60"
                  }`}
                >
                  <img src={getPreferredImageSrc(img)} alt="" referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="meta-sm text-[#5F564A]">{product.category}</div>
            <h2 className="font-editorial text-3xl font-light leading-tight mt-1">{product.name}</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-semibold tabular-nums">
                {price?.priceLabel ?? `₹${product.price}`}
              </span>
              {product.rating != null && (
                <span className="text-[12px] text-[#5F564A]">★ {product.rating}</span>
              )}
            </div>
          </div>

          <p className="text-[13px] leading-relaxed text-[#17130E]/75 font-light border-t border-[#17130E]/10 pt-4">
            {product.description}
          </p>
        </div>

        <div className="p-5 border-t border-[#17130E]/10 space-y-2 bg-[#F5F1E8]">
          <button
            onClick={buy}
            className="w-full min-h-[52px] bg-[#17130E] text-[#F5F1E8] meta flex items-center justify-between px-5 hover:bg-[#702629] transition-colors"
          >
            <span>Buy on Meesho</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={saved}
              className="meta-sm text-[#5F564A] hover:text-[#17130E] flex items-center gap-1.5 min-h-[44px]"
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? "fill-[#702629] text-[#702629]" : ""}`} />
              <span>{saved ? "Saved" : "Save for later"}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate(`/product/${product.slug}`);
              }}
              className="meta-sm text-[#17130E] underline underline-offset-4 min-h-[44px]"
            >
              Full details →
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

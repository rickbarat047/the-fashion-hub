import React, { useEffect, useState } from "react";
import { ArrowRight, Heart, ChevronDown } from "lucide-react";
import { Product } from "../types/product";
import { ProductGallery } from "../components/ProductGallery";
import { ProductCard } from "../components/ProductCard";
import { Reviews, loadReviews } from "../components/Reviews";
import { getRelatedProducts } from "../data/products";
import { useWishlist } from "../context/WishlistContext";
import { usePrice } from "../context/PriceContext";
import { trackEvent } from "../utils/analytics";
import { useDocumentTitle } from "../utils/reveal";

interface ProductDetailPageProps {
  product: Product;
  onNavigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onNavigate }) => {
  useDocumentTitle(`${product.name} — The Fashion Hub`);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { getPrice, isLive } = usePrice();
  const saved = isInWishlist(product.id);
  const price = getPrice(product);
  const [size, setSize] = useState<string | null>(product.sizes?.[2] ?? product.sizes?.[0] ?? null);
  const [openAcc, setOpenAcc] = useState<string | null>("details");
  const [liveRating, setLiveRating] = useState<{ rating: number; ratingCount: number } | null>(null);
  const related = getRelatedProducts(product.slug, 4);
  const rating = liveRating?.rating ?? product.rating;
  const ratingCount = liveRating?.ratingCount ?? product.ratingCount;

  // Keep the header rating in lockstep with the reviews block below.
  useEffect(() => {
    const productId = product.meeshoProductId;
    if (!productId) return;
    let active = true;
    loadReviews().then((all) => {
      const entry = all[productId];
      if (active && entry) setLiveRating({ rating: entry.rating, ratingCount: entry.ratingCount });
    });
    return () => {
      active = false;
    };
  }, [product.meeshoProductId]);

  const buy = () => {
    trackEvent({ type: "buy_now_click", productId: product.id, productName: product.name, price: price.price, url: product.meeshoAffiliateUrl });
    window.open(product.meeshoAffiliateUrl, "_blank", "nofollow sponsored noopener");
  };

  const attrs = [product.fabric, product.pattern || product.patternType, product.fit, product.length].filter(Boolean) as string[];
  // Only show attributes we actually know — never a row full of em dashes.
  const detailRows: Array<[string, string]> = [
    ["Color", product.color || ""],
    ["Fabric", product.fabric || ""],
    ["Pattern", product.pattern || product.patternType || ""],
    ["Fit", product.fit || ""],
    ["Neck", product.neck || ""],
    ["Sleeve", product.sleeve || ""],
    ["Length", product.length || ""],
    ["Ornamentation", product.ornamentation || ""],
    ["Occasion", product.occasion || ""],
    ["Care", "Hand Wash / Gentle Wash"],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>;

  const Acc = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-black/8">
      <button onClick={() => setOpenAcc(openAcc === id ? null : id)} className="w-full flex items-center justify-between py-4 text-[13px] font-bold">
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${openAcc === id ? "rotate-180" : ""}`} />
      </button>
      {openAcc === id && <div className="pb-4">{children}</div>}
    </div>
  );

  return (
    <div className="bg-[#FAF7F2] text-[#1C1917] min-h-screen pt-14 sm:pt-16 lg:pt-[104px] pb-24 lg:pb-0">
      <div className="px-4 sm:px-6 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:sticky lg:top-24 self-start">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-editorial text-[24px] sm:text-4xl leading-[1.15] font-medium flex-1">{product.name}</h1>
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Save"
                className="w-11 h-11 shrink-0 rounded-full bg-white border border-black/10 flex items-center justify-center"
              >
                <Heart className={`w-5 h-5 ${saved ? "fill-[#7F1D2D] text-[#7F1D2D]" : ""}`} />
              </button>
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="text-[20px] font-bold tabular-nums">{price.priceLabel}</span>
              {isLive && product.meeshoProductId && (
                <span className="text-[10px] font-semibold tracking-[0.12em] text-[#7F1D2D] uppercase">Live on Meesho</span>
              )}
            </div>
            {rating != null && (
              <div className="mt-1 text-[12px] text-black/60 font-medium">
                ★ {rating} · {ratingCount?.toLocaleString("en-IN")} Meesho ratings
              </div>
            )}

            {attrs.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {attrs.map((a) => (
                  <span key={a} className="chip-attr">{a}</span>
                ))}
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-5">
                <div className="text-[13px] font-bold">Size:</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-11 h-11 px-3 rounded-[10px] text-[12px] font-bold border ${
                        size === s ? "bg-[#1C1917] text-white border-[#1C1917]" : "bg-white border-black/12"
                      }`}
                    >
                      {s.replace("XXXL", "3XL")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={buy} className="btn-burgundy mt-5 w-full h-[52px] text-[13px] flex items-center justify-center gap-2">
              BUY ON MEESHO <ArrowRight className="w-4 h-4" />
            </button>
            <p className="mt-2 text-[11px] text-black/60 text-center">Checkout & fulfilment by Meesho · No extra cost to you</p>

            <div className="mt-5 bg-white rounded-[16px] px-4 border border-black/5">
              <Acc id="details" title="Product Details">
                <div className="flex flex-col">
                  {detailRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 text-[13px] border-b border-black/5 last:border-0">
                      <span className="text-black/60">{k}</span>
                      <span className="font-medium text-right">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-black/60">{product.description}</p>
              </Acc>
              <Acc id="size" title="Size Guide">
                <p className="text-[13px] text-black/60 leading-relaxed">
                  S 34 · M 36 · L 38 · XL 40 · XXL 42 · 3XL 44 · 4XL 46. Fits vary by seller — confirm on the Meesho listing.
                </p>
              </Acc>
              <Acc id="ship" title="Shipping & Returns">
                <p className="text-[13px] text-black/60 leading-relaxed">
                  COD, shipping & returns follow the Meesho listing. Check the live listing before buying — The Fashion Hub never handles payment or delivery.
                </p>
              </Acc>
            </div>

            <Reviews meeshoProductId={product.meeshoProductId} affiliateUrl={product.meeshoAffiliateUrl} />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-[20px]">You May Also Like</h2>
              <button onClick={() => onNavigate("/shop")} className="text-[12px] font-semibold text-black/60">View all →</button>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-7">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}
        <div className="h-8" />
      </div>

      {/* sticky mobile buy like mockup */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/8 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3 shadow-[0_-12px_32px_rgba(28,25,23,0.10)]">
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold tabular-nums leading-tight">{price.priceLabel}</div>
          <div className="text-[11px] text-black/60 truncate">{product.name}</div>
        </div>
        <button onClick={buy} className="btn-burgundy h-12 px-6 text-[12px] flex items-center gap-2 shrink-0">
          BUY ON MEESHO <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

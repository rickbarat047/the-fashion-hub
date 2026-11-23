import React from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Product } from "../types/product";
import { ImageWithFallback } from "./ImageWithFallback";
import { useWishlist } from "../context/WishlistContext";
import { usePrice } from "../context/PriceContext";
import { trackEvent } from "../utils/analytics";

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
  index?: number;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, className = "" }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { getPrice } = usePrice();
  const saved = isInWishlist(product.id);
  const price = getPrice(product);

  const open = () => {
    trackEvent({ type: "product_view", productId: product.id, productName: product.name, price: price.price });
    onNavigate(`/product/${product.slug}`);
  };

  return (
    <article className={`group ${className}`}>
      <div onClick={open} className="relative product-img aspect-[3/4] cursor-pointer shadow-[0_12px_32px_rgba(28,25,23,0.10)]">
        <ImageWithFallback
          src={product.images[0]}
          alt={product.name}
          aspectRatioClass="aspect-[3/4]"
          containerClassName="!rounded-[16px]"
          className="w-full h-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={saved ? "Remove from saved" : "Save"}
          aria-pressed={saved}
          className="press absolute top-2.5 right-2.5 w-11 h-11 rounded-full bg-white/95 backdrop-blur shadow-[0_6px_16px_rgba(0,0,0,0.14)] flex items-center justify-center"
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-[#7F1D2D] text-[#7F1D2D]" : "text-[#1C1917]"}`} />
        </button>
        {product.newArrival && (
          <span className="absolute top-2.5 left-2.5 bg-[#1C1917] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
            NEW
          </span>
        )}
      </div>
      <div className="pt-2.5 px-0.5">
        <h3 onClick={open} className="text-[13px] leading-[1.35] font-medium text-[#1C1917] line-clamp-2 min-h-[36px] cursor-pointer">
          {product.name}
        </h3>
        <div className="mt-1 min-h-[15px] flex items-center gap-1 text-[10px] font-medium text-black/60">
          {product.rating != null && (
            <>
              <span className="text-[#7F1D2D]" aria-hidden="true">★</span>
              <span className="font-bold text-black/75">{product.rating}</span>
              {product.ratingCount != null && (
                <span className="truncate">({product.ratingCount.toLocaleString("en-IN")})</span>
              )}
            </>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[14px] font-bold tabular-nums tracking-[-0.01em]">{price.priceLabel}</span>
          <button
            onClick={open}
            aria-label={`View ${product.name}`}
            className="press w-11 h-11 rounded-full bg-[#1C1917] text-white flex items-center justify-center group-hover:bg-[#7F1D2D] transition-colors shadow-[0_6px_14px_rgba(28,25,23,0.25)]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

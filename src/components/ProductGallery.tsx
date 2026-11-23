import React, { useState } from "react";
import { ImageWithFallback, getPreferredImageSrc } from "./ImageWithFallback";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  onIndexChange?: (i: number) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName, onIndexChange }) => {
  const [idx, setIdx] = useState(0);
  const set = (i: number) => {
    setIdx(i);
    onIndexChange?.(i);
  };
  const current = images[idx] || images[0] || "";

  return (
    <div>
      <div className="relative product-img aspect-[3/4] !rounded-[20px]">
        <ImageWithFallback
          src={current}
          alt={productName}
          aspectRatioClass="aspect-[3/4]"
          containerClassName="!rounded-[20px]"
          className="w-full h-full object-cover object-top"
        />
        <span className="absolute bottom-3 right-3 bg-black/55 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur">
          {idx + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => set(i)}
              aria-label={`Photo ${i + 1}`}
              className={`product-img aspect-[3/4] !rounded-[12px] overflow-hidden ${idx === i ? "ring-2 ring-[#1C1917]" : "opacity-80"}`}
            >
              <img src={getPreferredImageSrc(img)} alt="" referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover object-top" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

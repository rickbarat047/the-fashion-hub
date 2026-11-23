import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { searchProducts } from "../data/products";
import { usePrice } from "../context/PriceContext";
import { ImageWithFallback } from "./ImageWithFallback";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [query, setQuery] = useState("");
  const { getPrice } = usePrice();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setQuery("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const results = searchProducts(query);
  const terms = ["Cotton", "Silk", "Festive", "Kurti", "Floral", "Rayon"];

  return (
    <div className="fixed inset-0 z-[80] bg-[#FAF7F2] flex flex-col" role="dialog" aria-label="Search">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-black/8 shrink-0 max-w-[1200px] w-full mx-auto">
        <label className="flex-1 flex items-center gap-3 bg-white rounded-full px-5 h-11 shadow-sm border border-black/5">
          <Search className="w-4 h-4 text-black/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="bg-transparent flex-1 text-[15px] focus:outline-none placeholder:text-black/35"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-black/40 text-lg leading-none">×</button>
          )}
        </label>
        <button onClick={onClose} aria-label="Close" className="w-11 h-11 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 max-w-[1200px] w-full mx-auto py-5">
        <div className="flex flex-wrap gap-2">
          {terms.map((t) => (
            <button
              key={t}
              onClick={() => setQuery(t)}
              className={`chip-filter ${query === t ? "bg-[#1C1917] text-white" : "bg-white text-[#1C1917] border border-black/8"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {query.trim() ? (
          <div className="mt-5">
            <p className="text-[12px] font-semibold text-black/60">{results.length} found</p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-7">
              {results.map((p) => (
                <button key={p.id} onClick={() => onSelectProduct(p.slug)} className="text-left">
                  <span className="block product-img aspect-[3/4]">
                    <ImageWithFallback src={p.images[0]} alt={p.name} aspectRatioClass="aspect-[3/4]" containerClassName="!rounded-[16px]" className="w-full h-full object-cover object-top" />
                  </span>
                  <span className="block text-[13px] font-medium mt-2 line-clamp-2">{p.name}</span>
                  <span className="block text-[13px] font-bold mt-1">{getPrice(p).priceLabel}</span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="col-span-full py-10 text-center text-black/60 text-sm">Nothing found. Try cotton, silk, festive.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-8 text-center text-black/40 text-sm">Try “Ajrakh”, “Silk”, “Rayon”, “Festive”…</p>
        )}
      </div>
    </div>
  );
};

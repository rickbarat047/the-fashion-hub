import React, { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { ProductFilters } from "../types/product";
import { searchProducts, getProducts, getNewArrivals } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { usePrice } from "../context/PriceContext";
import { getPreferredImageSrc } from "../components/ImageWithFallback";
import { useDocumentTitle } from "../utils/reveal";

interface ShopPageProps {
  initialCategory?: string;
  initialSearch?: string;
  onNavigate: (path: string) => void;
}

const CHIPS = [
  { label: "All", value: "all" },
  { label: "Kurtis", value: "Kurtis" },
  { label: "Tops", value: "Everyday Edit" },
  { label: "Festive", value: "Festive Edit" },
  { label: "New", value: "__new" },
];

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory = "all", initialSearch = "", onNavigate }) => {
  useDocumentTitle("All Collections — The Fashion Hub");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [cat, setCat] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<ProductFilters["sortBy"]>("featured");
  const [showSort, setShowSort] = useState(false);
  const { getPrice } = usePrice();

  useEffect(() => setCat(initialCategory), [initialCategory]);
  useEffect(() => setSearchQuery(initialSearch), [initialSearch]);

  const filtered = useMemo(() => {
    if (cat === "__new") {
      const all = getNewArrivals();
      const q = searchQuery.trim().toLowerCase();
      let list = q ? searchProducts(searchQuery).filter((p) => p.newArrival).sort((a, b) => getProducts().indexOf(b) - getProducts().indexOf(a)) : all;
      if (sortBy === "price-asc") list = [...list].sort((a, b) => getPrice(a).price - getPrice(b).price);
      if (sortBy === "price-desc") list = [...list].sort((a, b) => getPrice(b).price - getPrice(a).price);
      return list;
    }
    const results = searchProducts(searchQuery, { category: cat });
    if (sortBy === "price-asc") return [...results].sort((a, b) => getPrice(a).price - getPrice(b).price);
    if (sortBy === "price-desc") return [...results].sort((a, b) => getPrice(b).price - getPrice(a).price);
    if (sortBy === "newest") return [...results].sort((a, b) => getProducts().indexOf(b) - getProducts().indexOf(a));
    return results;
  }, [searchQuery, cat, sortBy, getPrice]);

  const heroImg = getProducts()[0]?.images[0];
  const isCategoryView = cat !== "all" && cat !== "__new";

  return (
    <div className="bg-[#FAF7F2] text-[#1C1917] min-h-screen pt-14 sm:pt-16 lg:pt-[104px]">
      {/* category hero like mockup Kurtis page */}
      {isCategoryView ? (
        <div className="px-3 sm:px-6 max-w-[1200px] mx-auto">
          <div className="relative h-[190px] sm:h-[260px] rounded-[20px] overflow-hidden">
            <img src={getPreferredImageSrc(filtered[0]?.images[0] || heroImg || "")} alt={cat} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover object-top" />
            <span className="absolute inset-0 bg-black/40" />
            <span className="absolute inset-0 p-5 flex flex-col justify-center">
              <span className="font-editorial text-white text-[32px] sm:text-5xl capitalize">{cat.replace(" Edit", "")}</span>
              <span className="text-white/75 text-[13px] mt-1">Everyday style, reimagined.</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 max-w-[1200px] mx-auto pt-5">
          <p className="kicker text-black/60">The archive — SS26</p>
          <h1 className="font-editorial text-[34px] sm:text-6xl mt-1">All <em>Collections</em></h1>
          <p className="text-[13px] text-black/60 mt-1.5 font-light">{filtered.length} pieces · verified Meesho listings</p>
          <div className="hairline-rule mt-4" />
        </div>
      )}

      <div className="px-4 sm:px-6 max-w-[1200px] mx-auto mt-4 flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 py-1">
          {CHIPS.map((c) => (
            <button
              key={c.label}
              onClick={() => setCat(c.value)}
              className={`chip-filter shrink-0 ${cat === c.value ? "bg-[#1C1917] text-white" : "bg-white text-[#1C1917] border border-black/10"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSort((v) => !v)}
          className="shrink-0 h-11 px-4 rounded-full bg-[#1C1917] text-white text-[12px] font-bold flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
        </button>
      </div>

      <div className="px-4 sm:px-6 max-w-[1200px] mx-auto mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setShowSort((v) => !v)}
            className="w-full h-11 bg-white border border-black/10 rounded-full px-4 text-[13px] font-medium flex items-center justify-between"
          >
            Sort by: {sortBy === "featured" ? "Curated" : sortBy === "price-asc" ? "Low → High" : sortBy === "price-desc" ? "High → Low" : "Newest"}
            <ChevronDown className="w-4 h-4 text-black/50" />
          </button>
          {showSort && (
            <div className="absolute top-12 inset-x-0 bg-white rounded-2xl shadow-xl border border-black/8 overflow-hidden z-20">
              {([
                ["featured", "Curated"],
                ["price-asc", "Low → High"],
                ["price-desc", "High → Low"],
                ["newest", "Newest"],
              ] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => {
                    setSortBy(v);
                    setShowSort(false);
                  }}
                  className={`w-full text-left px-4 h-11 text-[13px] font-medium hover:bg-black/5 ${sortBy === v ? "text-[#7F1D2D]" : ""}`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter — cotton, silk…"
          className="flex-1 h-11 bg-white border border-black/10 rounded-full px-4 text-[13px] focus:outline-none placeholder:text-black/35"
        />
      </div>

      <div className="px-4 sm:px-6 max-w-[1200px] mx-auto mt-5 pb-16">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-editorial text-2xl">Nothing matches.</p>
            <button
              onClick={() => {
                setCat("all");
                setSearchQuery("");
              }}
              className="mt-4 h-11 px-8 rounded-full bg-[#1C1917] text-white text-[12px] font-bold"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

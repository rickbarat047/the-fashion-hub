import React from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { getProducts } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { useDocumentTitle } from "../utils/reveal";

interface WishlistPageProps {
  onNavigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  useDocumentTitle("Saved pieces — The Fashion Hub");
  const saved = getProducts().filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-[#FAF7F2] text-[#1C1917] min-h-screen pt-14 sm:pt-16 lg:pt-[104px]">
      <div className="px-4 sm:px-6 max-w-[1200px] mx-auto pt-6 pb-20">
        <h1 className="font-editorial text-[30px] sm:text-5xl">Saved pieces</h1>
        <p className="text-[13px] text-black/60 mt-1">{saved.length} {saved.length === 1 ? "item" : "items"}</p>

        {saved.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
            {saved.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} onNavigate={onNavigate} />
                <button
                  onClick={() => removeFromWishlist(p.id)}
                  className="mt-2 w-full h-10 text-[12px] font-semibold text-black/60 hover:text-[#7F1D2D] flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 max-w-md">
            <p className="font-editorial text-2xl font-light text-black/60">
              Nothing saved yet. Tap the heart on any piece to keep it here.
            </p>
            <button
              onClick={() => onNavigate("/shop")}
              className="mt-6 h-12 px-8 rounded-full bg-[#1C1917] text-white text-[12px] font-bold inline-flex items-center gap-2"
            >
              Browse the collection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

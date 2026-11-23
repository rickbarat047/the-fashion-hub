import React, { useMemo } from "react";
import { siteConfig } from "../config/site";
import { getProducts } from "../data/products";
import { usePrice } from "../context/PriceContext";
import { trackEvent } from "../utils/analytics";
import { Instagram } from "lucide-react";

interface FooterProps {
  onNavigate: (path: string) => void;
}

const CATALOGUE = getProducts();
const PIECE_COUNT = CATALOGUE.length;

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { getPrice } = usePrice();
  const { PRICE_MIN, PRICE_MAX } = useMemo(() => {
    const prices = CATALOGUE.map((p) => getPrice(p).price);
    return { PRICE_MIN: Math.min(...prices), PRICE_MAX: Math.max(...prices) };
  }, [getPrice]);

  const handleInstagram = () => {
    trackEvent({ type: "instagram_click", location: "footer" });
    window.open(siteConfig.instagramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="bg-[#131010] text-[#F5EFE6] mt-0">
      <div className="px-5 sm:px-10 max-w-[1200px] mx-auto pt-12 pb-8">
        <div className="font-editorial text-3xl sm:text-4xl tracking-wide">THE FASHION HUB</div>
        <p className="mt-3 text-[13px] leading-relaxed text-white/60 max-w-sm">
          Curated womenwear from trusted Meesho finds. {PIECE_COUNT} pieces, verified listing photos, direct pricing ₹{PRICE_MIN.toLocaleString("en-IN")}–₹{PRICE_MAX.toLocaleString("en-IN")}.
        </p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-[13px]">
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold tracking-[0.18em] text-white/60">SHOP</span>
            <button onClick={() => onNavigate("/shop")} className="text-left text-white/80">All Collections</button>
            <button onClick={() => onNavigate("/shop?category=Kurtis")} className="text-left text-white/80">Kurtis</button>
            <button onClick={() => onNavigate("/shop?category=__new")} className="text-left text-white/80">New Arrivals</button>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold tracking-[0.18em] text-white/60">HELP</span>
            <button onClick={() => onNavigate("/wishlist")} className="text-left text-white/80">Saved pieces</button>
            <button onClick={handleInstagram} className="text-left text-white/80">Instagram</button>
          </div>
        </div>

        <button
          onClick={handleInstagram}
          className="mt-8 w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 rounded-full h-11 px-6 text-sm font-medium"
        >
          <Instagram className="w-4 h-4" /> {siteConfig.instagramHandle} — Follow Us →
        </button>

        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col gap-3">
          <span className="text-[11px] text-white/60">© {new Date().getFullYear()} The Fashion Hub</span>
          <p className="text-[11px] leading-relaxed text-white/60 max-w-2xl">{siteConfig.affiliateDisclosure}</p>
        </div>
      </div>
    </footer>
  );
};

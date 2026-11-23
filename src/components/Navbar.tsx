import React, { useState, useEffect } from "react";
import { Menu, Search, Heart, Home } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { MobileMenu } from "./MobileMenu";

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = currentPath === "/" || currentPath === "" || currentPath.startsWith("/#");
  const isProduct = currentPath.startsWith("/product");

  // Transparent over hero on home top, solid elsewhere
  const transparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          transparent ? "bg-transparent text-white" : "bg-[#FAF7F2]/95 backdrop-blur-md text-[#1C1917] border-b border-black/8"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-1">
            {isProduct ? (
              <button
                onClick={() => window.history.length > 1 ? window.history.back() : onNavigate("/shop")}
                aria-label="Back"
                className="w-11 h-11 flex items-center justify-center text-xl"
              >
                ‹
              </button>
            ) : (
              <button onClick={() => setMenuOpen(true)} aria-label="Menu" className="w-11 h-11 flex items-center justify-center">
                <Menu className="w-5 h-5" />
              </button>
            )}
            {!isProduct && (
              <button onClick={() => onNavigate("/")} aria-label="Home" className="w-10 h-10 hidden min-[400px]:flex items-center justify-center opacity-0 pointer-events-none">
                <Home className="w-4 h-4" />
              </button>
            )}
          </div>

          <button onClick={() => onNavigate("/")} className="h-11 flex items-center font-editorial text-[13px] sm:text-lg tracking-[0.14em] font-medium whitespace-nowrap">
            THE FASHION HUB
          </button>

          <div className="flex items-center">
            <button onClick={onOpenSearch} aria-label="Search" className="w-11 h-11 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate("/wishlist")}
              aria-label={`Saved, ${wishlistCount}`}
              className="w-11 h-11 flex items-center justify-center relative"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? "fill-current" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#7F1D2D] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* desktop nav row */}
        <nav className={`hidden lg:flex items-center justify-center gap-8 pb-3 text-[11px] font-semibold tracking-[0.18em] ${transparent ? "text-white/80" : "text-[#57534E]"}`}>
          <button onClick={() => onNavigate("/shop")} className="hover:text-black">SHOP</button>
          <button onClick={() => onNavigate("/shop?category=Kurtis")} className="hover:text-black">KURTIS</button>
          <button onClick={() => onNavigate("/shop?category=Everyday%20Edit")} className="hover:text-black">TOPS</button>
          <button onClick={() => onNavigate("/shop?category=Festive%20Edit")} className="hover:text-black">FESTIVE</button>
          <button onClick={() => onNavigate("/shop?category=__new")} className="hover:text-black">NEW</button>
        </nav>
      </header>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} onOpenSearch={onOpenSearch} />
    </>
  );
};

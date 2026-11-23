import React, { useState } from "react";
import { X, Search, Instagram, Youtube } from "lucide-react";
import { siteConfig } from "../config/site";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate, onOpenSearch }) => {
  const [q, setQ] = useState("");
  if (!isOpen) return null;

  const go = (path: string) => {
    onClose();
    onNavigate(path);
  };

  const links = [
    { label: "Home", path: "/" },
    { label: "Kurtis", path: "/shop?category=Kurtis" },
    { label: "Tops", path: "/shop?category=Everyday%20Edit" },
    { label: "Festive", path: "/shop?category=Festive%20Edit" },
    { label: "New Arrivals", path: "/shop?category=__new" },
    { label: "Collections", path: "/shop" },
    { label: "About", path: "/#about" },
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-[#131010] text-[#F5EFE6] flex flex-col" role="dialog" aria-label="Menu">
      <div className="flex items-center justify-between px-5 h-16 shrink-0">
        <span className="font-editorial text-lg tracking-[0.12em]">THE FASHION HUB</span>
        <button onClick={onClose} aria-label="Close menu" className="w-11 h-11 flex items-center justify-center">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
        <nav className="flex flex-col gap-1 mt-2">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => go(l.path)}
              className="text-left py-3 text-[17px] font-medium text-[#F5EFE6]/90 hover:text-white border-b border-white/5"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => {
              onClose();
              window.open(siteConfig.instagramUrl, "_blank", "noopener,noreferrer");
            }}
            className="text-left py-3 text-[17px] font-medium text-[#F5EFE6]/90"
          >
            Instagram
          </button>
        </nav>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
            if (q.trim()) onNavigate(`/shop?search=${encodeURIComponent(q.trim())}`);
            else onOpenSearch();
          }}
        >
          <label className="flex items-center gap-3 bg-white/10 rounded-full px-5 h-12">
            <Search className="w-4 h-4 text-white/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent flex-1 text-sm placeholder:text-white/60 focus:outline-none"
            />
          </label>
        </form>

        <div className="mt-6 flex items-center gap-5 text-white/80">
          <Instagram className="w-5 h-5" />
          <Youtube className="w-5 h-5" />
          <span className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-[10px] font-bold">P</span>
        </div>
        <p className="mt-8 text-[11px] leading-relaxed text-white/60 max-w-xs">
          Curated womenwear from trusted Meesho finds. Direct pricing, no markup.
        </p>
      </div>
    </div>
  );
};

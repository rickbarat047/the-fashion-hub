/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { WishlistProvider } from "./context/WishlistContext";
import { PriceProvider } from "./context/PriceContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { WishlistPage } from "./pages/WishlistPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SearchOverlay } from "./components/SearchOverlay";
import { QuickViewDrawer } from "./components/QuickViewDrawer";
import { Intro } from "./components/Intro";
import { getProductBySlug } from "./data/products";
import { Product } from "./types/product";

const INTRO_SEEN_KEY = "tfh_intro_seen_v1";

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname + window.location.search;
    }
    return "/";
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  // Brand intro — once per tab session, never for reduced-motion visitors
  const [intro, setIntro] = useState<boolean>(() => {
    try {
      if (
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return false;
      }
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(INTRO_SEEN_KEY)) {
        return false;
      }
    } catch {
      // storage unavailable — still show the intro
    }
    return true;
  });

  const handleIntroDone = React.useCallback(() => {
    setIntro(false);
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleNavigate = (path: string) => {
    if (typeof window !== "undefined") {
      if (path.startsWith("/#")) {
        const selector = path.slice(1) === "" ? "body" : path.slice(1);
        window.history.pushState({}, "", path);
        setCurrentPath(path);
        // The target may live in a view that is not mounted yet (e.g. tapping
        // "About" from the shop). Wait for the new view to paint, then scroll.
        const scrollToTarget = () => {
          document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
        };
        if (document.querySelector(selector)) scrollToTarget();
        else requestAnimationFrame(() => requestAnimationFrame(scrollToTarget));
        return;
      }
      window.history.pushState({}, "", path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const renderCurrentView = () => {
    const url = new URL(currentPath, "https://the-fashion-hub-store.vercel.app");
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    if (pathname === "/" || pathname === "") {
      return <HomePage onNavigate={handleNavigate} />;
    }

    if (pathname === "/shop") {
      const category = searchParams.get("category") || "all";
      const search = searchParams.get("search") || "";
      return (
        <ShopPage
          key={category + search}
          initialCategory={category}
          initialSearch={search}
          onNavigate={handleNavigate}
        />
      );
    }

    if (pathname.startsWith("/product/")) {
      const slug = pathname.replace("/product/", "").replace(/\/$/, "");
      const product = getProductBySlug(slug);
      if (product) {
        return <ProductDetailPage product={product} onNavigate={handleNavigate} />;
      }
      return <NotFoundPage onNavigate={handleNavigate} />;
    }

    if (pathname === "/wishlist") {
      return <WishlistPage onNavigate={handleNavigate} />;
    }

    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  return (
    <WishlistProvider>
      <PriceProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
        {intro && <Intro key="intro" onDone={handleIntroDone} />}
        <Navbar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(slug) => {
            setIsSearchOpen(false);
            handleNavigate(`/product/${slug}`);
          }}
        />
        <QuickViewDrawer product={quickView} onClose={() => setQuickView(null)} onNavigate={handleNavigate} />
        <main className="flex-grow">{renderCurrentView()}</main>
        <Footer onNavigate={handleNavigate} />
        <Analytics />
        <SpeedInsights />
      </div>
      </PriceProvider>
    </WishlistProvider>
  );
}

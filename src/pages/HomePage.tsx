import React, { useMemo, useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Heart, Pause, Play } from "lucide-react";
import { getProducts, getTrendingProducts, getNewArrivals } from "../data/products";
import { ImageWithFallback, getPreferredImageSrc } from "../components/ImageWithFallback";
import { ProductCard } from "../components/ProductCard";
import { usePrice } from "../context/PriceContext";
import { trackEvent } from "../utils/analytics";
import { siteConfig } from "../config/site";
import { useDocumentTitle, useReveal } from "../utils/reveal";

interface HomePageProps {
  onNavigate: (path: string) => void;
}

// Original curated opening sequence. Anything added to the catalogue later is
// appended automatically, so every new product is included in the slideshow.
const HERO_CURATED_ORDER = [
  0, 3, 1, 8, 4, 6, 11, 2, 5, 7, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  useDocumentTitle("The Fashion Hub — Curated Women's Fashion");
  useReveal();
  const { getPrice } = usePrice();
  const products = useMemo(() => getProducts(), []);
  const trending = useMemo(() => getTrendingProducts().slice(0, 4), []);
  const fresh = useMemo(() => getNewArrivals().slice(0, 4), []);
  const hero = useMemo(() => {
    const curated = HERO_CURATED_ORDER.map((i) => products[i]).filter(Boolean);
    const list = [...curated, ...products.filter((p) => !curated.includes(p))];
    // The original opening photo was a weak first impression — lead with the
    // stronger look that used to be slide 35. No slide is dropped; the two
    // simply trade places, and future catalogue additions still append.
    if (list.length > 34) {
      const previousOpening = list[0];
      list[0] = list[34];
      list[34] = previousOpening;
    }
    return list;
  }, [products]);
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const [hi, setHi] = useState(0);
  const [paused, setPaused] = useState(prefersReducedMotion);
  const currentHero = hero[hi];

  useEffect(() => {
    if (hero.length < 2 || paused) return;
    const id = setInterval(() => setHi((v) => (v + 1) % hero.length), 2000);
    return () => clearInterval(id);
  }, [hero.length, paused]);

  const open = (slug: string) => onNavigate(`/product/${slug}`);

  const categories = [
    { name: "Kurtis", sub: "Explore →", img: products[0]?.images[0], path: "/shop?category=Kurtis" },
    { name: "Tops", sub: "Explore →", img: products[5]?.images[0], path: "/shop?category=Everyday%20Edit" },
    { name: "New Arrivals", sub: "Explore →", img: products[8]?.images[0], path: "/shop?category=__new" },
  ];

  const insta = [products[4], products[6], products[11], products[13]].filter(Boolean);
  const lookWeek = products[3] || products[0];

  return (
    <div className="bg-[#FAF7F2] text-[#1C1917]">
      {/* HERO — full-bleed carousel like mockup */}
      <section className="relative h-[94svh] min-h-[620px] max-h-[940px] overflow-hidden sm:mx-3 sm:mt-3 sm:rounded-[26px] bg-[#1C1917]">
        {hero.map((p, i) => {
          const active = i === hi;
          const next = i === (hi + 1) % hero.length;
          const previous = i === (hi - 1 + hero.length) % hero.length;
          // Only the current, next and outgoing slides need to be in memory.
          const shouldLoad = active || next || previous;
          return (
            <div key={p.id} className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${active ? "opacity-100" : "opacity-0"}`}>
              {shouldLoad && (
                <img
                  src={getPreferredImageSrc(p.images[0])}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  loading={active ? "eager" : "lazy"}
                  decoding="async"
                  className={`w-full h-full object-cover object-top ${active ? "scale-100" : "scale-[1.06]"} transition-transform duration-[4000ms] ease-out`}
                />
              )}
            </div>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" />
        <div className="absolute inset-0 hero-grain pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10 max-w-[1200px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <span className="block w-10 h-px bg-white/70" />
            <p className="text-white/85 text-[11px] font-bold tracking-[0.32em]">
              NEW SEASON — N°{String(hi + 1).padStart(2, "0")}
            </p>
          </div>
          <h1 className="font-editorial text-white font-light leading-[0.93] tracking-[-0.01em] text-[58px] sm:text-8xl mt-3">
            Your<br /><em className="font-normal">Next</em><br />Look
          </h1>
          <p className="text-white/75 text-[13px] mt-3 max-w-[270px] leading-relaxed font-light">
            Curated womenwear from trusted Meesho finds.
          </p>
          {currentHero && (
            <button
              onClick={() => open(currentHero.slug)}
              className="press mt-2.5 flex items-center gap-2 max-w-[330px] min-w-0 text-left"
            >
              <span className="text-[11px] font-semibold tracking-[0.06em] text-white/90 truncate min-w-0">
                {currentHero.name}
              </span>
              <span className="text-[11px] text-white/60" aria-hidden="true">·</span>
              <span className="text-[11px] font-bold text-white/90 whitespace-nowrap">
                {getPrice(currentHero).priceLabel}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-white/70 shrink-0" />
            </button>
          )}
          <button
            onClick={() => onNavigate("/shop")}
            className="press mt-5 bg-white text-[#1C1917] rounded-full h-[50px] px-7 text-[12px] font-bold tracking-[0.14em] flex items-center gap-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
          >
            EXPLORE COLLECTION <ArrowRight className="w-4 h-4" />
          </button>

          <div className="mt-7">
            <div className="h-px bg-white/25 relative overflow-hidden rounded-full">
              <div
                key={`${hi}-${paused ? "paused" : "playing"}`}
                className="absolute inset-0 bg-white hero-progress"
                style={{ animationPlayState: paused ? "paused" : "running" }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-white font-medium tabular-nums text-[14px] tracking-[0.12em]">
                {String(hi + 1).padStart(2, "0")} / {String(hero.length).padStart(2, "0")}
              </span>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setPaused((v) => !v)}
                  aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                  className="press btn-circle text-white"
                >
                  {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button onClick={() => setHi((hi - 1 + hero.length) % hero.length)} aria-label="Previous look" className="press btn-circle text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setHi((hi + 1) % hero.length)} aria-label="Next look" className="press btn-circle text-white">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING NOW */}
      <section className="reveal px-4 sm:px-6 max-w-[1200px] mx-auto pt-10">
        <p className="kicker text-black/60">01 — Handpicked</p>
        <div className="mt-1.5 flex items-end justify-between gap-3">
          <h2 className="font-editorial text-[26px] sm:text-4xl font-medium tracking-[0.06em]">TRENDING NOW</h2>
          <button onClick={() => onNavigate("/shop")} className="press text-[12px] font-semibold text-black/60 flex items-center gap-1 shrink-0 pb-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="hairline-rule mt-3" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-7">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="reveal px-4 sm:px-6 max-w-[1200px] mx-auto pt-12">
        <p className="kicker text-black/60">02 — Moods</p>
        <h2 className="mt-1.5 text-[12px] font-bold tracking-[0.24em] text-black/60">SHOP BY CATEGORY</h2>
        <div className="hairline-rule mt-3" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((c) => (
            <button key={c.name} onClick={() => onNavigate(c.path)} className="press relative h-[132px] sm:h-[180px] rounded-[20px] overflow-hidden text-left group shadow-[0_14px_36px_rgba(28,25,23,0.16)]">
              <img src={c.img ? getPreferredImageSrc(c.img) : undefined} alt={c.name} loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-[1200ms] ease-out" />
              <span className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <span className="absolute inset-0 p-5 flex flex-col justify-center">
                <span className="font-editorial text-white text-[30px] leading-none">{c.name}</span>
                <span className="text-white/85 text-[11px] font-bold tracking-[0.2em] mt-2.5 flex items-center gap-2">
                  EXPLORE <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS strip */}
      <section className="reveal px-4 sm:px-6 max-w-[1200px] mx-auto pt-12">
        <p className="kicker text-black/60">03 — Just landed</p>
        <div className="mt-1.5 flex items-end justify-between gap-3">
          <h2 className="font-editorial text-[26px] sm:text-4xl font-medium">New <em>Arrivals</em></h2>
          <button onClick={() => onNavigate("/shop?category=__new")} className="press text-[12px] font-semibold text-black/60 flex items-center gap-1 shrink-0 pb-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="hairline-rule mt-3" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-7">
          {fresh.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* FROM INSTAGRAM */}
      <section className="reveal px-4 sm:px-6 max-w-[1200px] mx-auto pt-12">
        <p className="kicker text-black/60">04 — Community</p>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[12px] font-bold tracking-[0.24em]">FROM INSTAGRAM</h2>
            <p className="text-[12px] text-black/60 mt-1.5 font-light">Style inspiration from our latest posts.</p>
          </div>
          <button
            onClick={() => window.open(siteConfig.instagramUrl, "_blank", "noopener,noreferrer")}
            className="press text-[12px] font-semibold text-black/60 shrink-0"
          >
            Follow Us →
          </button>
        </div>
        <div className="hairline-rule mt-3" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {insta.map((p) => (
            <button key={p.id} onClick={() => open(p.slug)} className="relative product-img aspect-[3/4] text-left">
              <ImageWithFallback src={p.images[0]} alt={p.name} aspectRatioClass="aspect-[3/4]" containerClassName="!rounded-[16px]" className="w-full h-full object-cover object-top" />
              <span className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>

        {/* LOOK OF THE WEEK */}
        {lookWeek && (
          <button onClick={() => open(lookWeek.slug)} className="press relative mt-4 w-full h-[440px] sm:h-[520px] rounded-[22px] overflow-hidden text-left shadow-[0_20px_50px_rgba(28,25,23,0.22)]">
            <img src={getPreferredImageSrc(lookWeek.images[0])} alt={lookWeek.name} loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover object-top" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <span className="absolute inset-0 hero-grain pointer-events-none" />
            <span className="absolute bottom-0 p-6">
              <span className="kicker text-white/70 block">Look of the week</span>
              <span className="font-editorial text-white text-[30px] leading-[1.02] block mt-2">THE LOOK<br /><em>OF THE WEEK</em></span>
              <span className="text-white/70 text-[12px] block mt-2 max-w-[280px] leading-relaxed">
                A perfect blend of tradition and everyday comfort. Handpicked styles for your modern wardrobe.
              </span>
              <span className="mt-3 inline-flex items-center gap-2 text-white text-[12px] font-bold tracking-[0.14em]">
                VIEW COLLECTION <ArrowRight className="w-4 h-4" />
              </span>
            </span>
          </button>
        )}
        <div className="h-10" />
      </section>

      {/* ABOUT — the edit */}
      <section id="about" className="reveal px-4 sm:px-6 max-w-[1200px] mx-auto pt-12 pb-6">
        <p className="kicker text-black/60">05 — The edit</p>
        <div className="hairline-rule mt-3" />
        <div className="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-14">
          <div>
            <h2 className="font-editorial text-[32px] sm:text-5xl font-light leading-[1.05]">
              Considered fashion,
              <br />
              <em>without the scroll.</em>
            </h2>
          </div>
          <div>
            <p className="text-[14px] leading-relaxed text-black/60 font-light">
              {siteConfig.creatorBio}
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-black/60 font-light">
              Every piece here links straight to its original Meesho listing — the same
              photographs, the same price, no markup. We simply do the editing so you don't
              have to.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate("/shop")}
                className="press h-12 px-7 rounded-full bg-[#1C1917] text-white text-[12px] font-bold tracking-[0.1em] inline-flex items-center gap-2"
              >
                EXPLORE THE EDIT <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open(siteConfig.instagramUrl, "_blank", "noopener,noreferrer")}
                className="press text-[12px] font-semibold text-black/60 underline underline-offset-4"
              >
                {siteConfig.instagramHandle} →
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="h-6" />
    </div>
  );
};

import React, { useEffect, useState } from "react";

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: fine)");
    setFine(media.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    media.addEventListener("change", onChange);
    if (!media.matches) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      if (t) {
        const v = t.getAttribute("data-cursor");
        setLabel(v ? v.toUpperCase() : null);
      } else {
        setLabel(null);
      }
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  if (!fine || !visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[70]"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }}
    >
      {label ? (
        <div className="min-w-14 h-14 px-3 rounded-full bg-[#141210] text-[#F3EFE7] flex items-center justify-center text-[9px] tracking-[0.2em] font-medium">
          {label}
        </div>
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-[#141210]/40" />
      )}
    </div>
  );
};

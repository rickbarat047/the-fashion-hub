import React from "react";
import { ArrowLeft } from "lucide-react";
import { useDocumentTitle } from "../utils/reveal";

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  useDocumentTitle("Not found — The Fashion Hub");
  return (
    <div className="bg-[#F5F1E8] text-[#17130E] min-h-[70vh] flex items-center px-5 sm:px-10">
      <div className="max-w-[900px] mx-auto w-full py-20">
        <div className="meta-sm text-[#5F564A]">404 — Not in the edit</div>
        <h1 className="mt-3 font-editorial font-light tracking-tight leading-[0.9] text-6xl sm:text-8xl">
          Lost your
          <br />
          way?
        </h1>
        <p className="mt-4 text-[13px] text-[#5F564A] font-light max-w-sm">
          This page isn't part of the collection. Let's get you back to the clothes.
        </p>
        <button
          onClick={() => onNavigate("/shop")}
          className="mt-8 px-8 min-h-[52px] bg-[#17130E] text-[#F5F1E8] meta inline-flex items-center gap-2 hover:bg-[#702629] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </button>
      </div>
    </div>
  );
};

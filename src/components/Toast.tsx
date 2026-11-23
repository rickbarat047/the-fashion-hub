import React from "react";

interface ToastProps {
  message: string;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 bg-[#17130E] text-[#F5F1E8] meta-sm whitespace-nowrap max-w-[92vw]">
      <span className="w-1.5 h-1.5 bg-[#F5F1E8]" />
      <span>{message}</span>
    </div>
  );
};

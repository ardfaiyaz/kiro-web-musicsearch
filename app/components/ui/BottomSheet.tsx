"use client";

import { useEffect, useRef, useCallback, useState, memo } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

function BottomSheetBase({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setTranslateY(0);
      onClose();
    }, 300);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleKeyDown]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) {
      setTranslateY(dy);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (translateY > 100) {
      handleClose();
    } else {
      setTranslateY(0);
    }
    dragStartY.current = null;
  }, [translateY, handleClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label={title || "Bottom sheet"}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl glass-heavy border-t border-border/50 shadow-2xl transition-transform duration-300 ${
          isClosing ? "translate-y-full" : ""
        }`}
        style={{
          transform: isClosing
            ? "translateY(100%)"
            : translateY > 0
              ? `translateY(${translateY}px)`
              : "translateY(0)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1.5 w-10 rounded-full bg-foreground/20" aria-hidden="true" />
        </div>

        {/* Title */}
        {title && (
          <div className="border-b border-border/30 px-6 pb-3">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-3 pb-8">{children}</div>
      </div>
    </div>
  );
}

export const BottomSheet = memo(BottomSheetBase);
export default BottomSheet;

"use client";

import { useCallback, useRef, useState, ReactNode, ButtonHTMLAttributes } from "react";

interface HapticButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md" | "lg";
}

/**
 * HapticButton - a button wrapper that adds subtle CSS scale/transform
 * animation on tap to simulate haptic feedback. The button scales down
 * slightly then bounces back on press.
 */
export default function HapticButton({
  children,
  variant = "default",
  size = "md",
  className = "",
  onClick,
  ...props
}: HapticButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = useCallback(() => {
    setIsPressed(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsPressed(false);
    }, 150);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handlePress();
      onClick?.(e);
    },
    [handlePress, onClick]
  );

  const handleTouchStart = useCallback(() => {
    handlePress();
  }, [handlePress]);

  const variantClasses = {
    default:
      "glass-card text-foreground hover:bg-foreground/5 border border-border/50",
    primary:
      "bg-foreground text-background hover:bg-foreground/90 shadow-md",
    ghost: "text-foreground hover:bg-foreground/5",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-2xl",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 ease-out
        active:scale-[0.92] active:opacity-90
        ${isPressed ? "scale-[0.94] opacity-90" : "scale-100 opacity-100"}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </button>
  );
}

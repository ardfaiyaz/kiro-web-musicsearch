"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * MorphTransition - Provides shared element transition when navigating
 * from an album card to the album detail page using the View Transitions API.
 * Falls back to standard navigation if the API is unavailable.
 */

interface MorphTransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  viewTransitionName?: string;
  ariaLabel?: string;
}

export default function MorphTransitionLink({
  href,
  children,
  className = "",
  viewTransitionName,
  ariaLabel,
}: MorphTransitionLinkProps) {
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      // Check if the html element has reduce-motion class
      const reduceMotion =
        document.documentElement.classList.contains("reduce-motion");

      if (
        !reduceMotion &&
        "startViewTransition" in document &&
        typeof (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition === "function"
      ) {
        (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
          router.push(href);
        });
      } else {
        router.push(href);
      }
    },
    [href, router]
  );

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      style={
        viewTransitionName
          ? { viewTransitionName }
          : undefined
      }
    >
      {children}
    </a>
  );
}

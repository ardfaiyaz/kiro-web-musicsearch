"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, ReactNode } from "react";
import { schedulePrefetch } from "@/lib/prefetch";

interface PrefetchLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetchOnHover?: boolean;
  "aria-label"?: string;
}

/**
 * PrefetchLink wraps Next.js Link to prefetch the target page
 * when the user hovers over it, using requestIdleCallback for
 * non-blocking prefetching.
 */
export default function PrefetchLink({
  href,
  children,
  className,
  prefetchOnHover = true,
  "aria-label": ariaLabel,
}: PrefetchLinkProps) {
  const router = useRouter();
  const hasPrefetched = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (!prefetchOnHover || hasPrefetched.current) return;
    hasPrefetched.current = true;

    schedulePrefetch(href, () => {
      router.prefetch(href);
    });
  }, [href, prefetchOnHover, router]);

  const handleFocus = useCallback(() => {
    if (!prefetchOnHover || hasPrefetched.current) return;
    hasPrefetched.current = true;

    schedulePrefetch(href, () => {
      router.prefetch(href);
    });
  }, [href, prefetchOnHover, router]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      prefetch={false}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}

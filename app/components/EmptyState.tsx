"use client";

import { memo } from "react";
import Link from "next/link";
import { Search, Heart, Clock, ListMusic, Compass } from "lucide-react";

type EmptyStateVariant = "no-results" | "no-favorites" | "no-history" | "no-queue" | "generic";

interface EmptyStateProps {
  query?: string;
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

const variantConfig: Record<
  EmptyStateVariant,
  {
    icon: React.ReactNode;
    defaultTitle: string;
    defaultDescription: string;
    defaultAction?: { label: string; href: string };
  }
> = {
  "no-results": {
    icon: (
      <svg
        className="h-10 w-10 text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
        />
      </svg>
    ),
    defaultTitle: "No results found",
    defaultDescription: "Try a different search term or browse our discover page.",
    defaultAction: { label: "Discover Music", href: "/discover" },
  },
  "no-favorites": {
    icon: <Heart className="h-10 w-10 text-muted" strokeWidth={1} aria-hidden="true" />,
    defaultTitle: "No favorites yet",
    defaultDescription: "Start adding tracks, artists, and albums you love by tapping the heart icon.",
    defaultAction: { label: "Search Music", href: "/" },
  },
  "no-history": {
    icon: <Clock className="h-10 w-10 text-muted" strokeWidth={1} aria-hidden="true" />,
    defaultTitle: "No listening history",
    defaultDescription: "Play some music to start building your listening history.",
    defaultAction: { label: "Discover Music", href: "/discover" },
  },
  "no-queue": {
    icon: <ListMusic className="h-10 w-10 text-muted" strokeWidth={1} aria-hidden="true" />,
    defaultTitle: "Queue is empty",
    defaultDescription: "Add tracks to your queue by searching for music or browsing the discover page.",
    defaultAction: { label: "Search Music", href: "/" },
  },
  generic: {
    icon: <Compass className="h-10 w-10 text-muted" strokeWidth={1} aria-hidden="true" />,
    defaultTitle: "Nothing here yet",
    defaultDescription: "Explore and discover new music to get started.",
    defaultAction: { label: "Get Started", href: "/" },
  },
};

function EmptyStateBase({
  query,
  variant = "no-results",
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const config = variantConfig[variant];

  const displayTitle = title || config.defaultTitle;
  const displayDescription = query
    ? `No music found for \u201c${query}\u201d. Try a different search term.`
    : description || config.defaultDescription;
  const action = {
    label: actionLabel || config.defaultAction?.label || "Go Home",
    href: actionHref || config.defaultAction?.href || "/",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center animate-fade-in sm:py-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground/5 sm:h-24 sm:w-24">
        {variant === "no-results" && query ? (
          <Search className="h-10 w-10 text-muted" strokeWidth={1} aria-hidden="true" />
        ) : (
          config.icon
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          {displayTitle}
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted sm:text-base">
          {displayDescription}
        </p>
      </div>
      <Link
        href={action.href}
        className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-premium hover:bg-foreground/80"
      >
        {action.label}
      </Link>
    </div>
  );
}

const EmptyState = memo(EmptyStateBase);
export default EmptyState;

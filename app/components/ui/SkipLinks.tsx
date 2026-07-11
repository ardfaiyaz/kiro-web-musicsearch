import { memo } from "react";

function SkipLinksBase() {
  return (
    <nav aria-label="Skip links" className="sr-only focus-within:not-sr-only fixed left-4 top-4 z-[200] flex flex-col gap-2">
      <a
        href="#main-content"
        className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Skip to main content
      </a>
      <a
        href="#mini-player"
        className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Skip to player
      </a>
      <a
        href="#main-navigation"
        className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Skip to navigation
      </a>
    </nav>
  );
}

export const SkipLinks = memo(SkipLinksBase);
export default SkipLinks;

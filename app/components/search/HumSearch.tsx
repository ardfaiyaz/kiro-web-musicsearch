"use client";

import { Music2 } from "lucide-react";

export default function HumSearch() {
  return (
    <a
      href="https://www.google.com/search?q=hum+to+search"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted transition-all hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5"
      aria-label="Search by humming (opens Google hum to search)"
    >
      <Music2
        size={12}
        className="text-muted transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
      <span>Search by humming</span>
    </a>
  );
}

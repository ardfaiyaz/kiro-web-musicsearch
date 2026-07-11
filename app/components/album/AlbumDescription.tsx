"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AlbumDescriptionProps {
  description: string | null;
}

export default function AlbumDescription({
  description,
}: AlbumDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      aria-label="Album description"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <h2 className="mb-4 text-xl font-bold text-foreground tracking-tight">
        About This Album
      </h2>
      <div className="glass-light rounded-2xl p-6">
        {description ? (
          <>
            <div
              className={`relative overflow-hidden transition-[max-height] duration-[var(--duration-complex)] ease-out ${
                expanded ? "max-h-[2000px]" : "max-h-24"
              }`}
            >
              <p className="text-sm leading-relaxed text-muted whitespace-pre-line">
                {description.replace(/<[^>]*>/g, "")}
              </p>
              {!expanded && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent"
                  aria-hidden="true"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  Show less
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  Read more
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </>
        ) : (
          <p className="text-sm italic text-muted">
            No description is currently available.
          </p>
        )}
      </div>
    </section>
  );
}

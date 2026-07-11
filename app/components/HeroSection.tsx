import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { RSSFeedItem } from "@/lib/discovery";

interface HeroSectionProps {
  featured: RSSFeedItem;
}

export default function HeroSection({ featured }: HeroSectionProps) {
  const artworkUrl = featured.artworkUrl100
    ? featured.artworkUrl100.replace("100x100", "600x600")
    : "";

  return (
    <section
      className="relative min-h-[60vh] overflow-hidden sm:min-h-[70vh]"
      aria-label="Featured track"
    >
      {/* Dynamic gradient background from artwork */}
      {artworkUrl && (
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={artworkUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover scale-110 blur-3xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </div>
      )}

      {/* Content overlay */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-end gap-8 px-4 pb-16 pt-32 sm:flex-row sm:items-end sm:gap-12 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        {/* Artwork */}
        <div className="animate-slide-up relative aspect-square w-56 shrink-0 overflow-hidden rounded-2xl shadow-xl sm:w-64 lg:w-72">
          {artworkUrl && (
            <Image
              src={artworkUrl}
              alt={`${featured.name} by ${featured.artistName}`}
              fill
              sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 288px"
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Text and CTA */}
        <div className="animate-slide-up flex flex-1 flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <span className="inline-block rounded-full border border-border/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
            Featured
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {featured.name}
          </h2>
          <p className="text-lg text-muted sm:text-xl">
            {featured.artistName}
          </p>
          <Link
            href={`/track/${featured.id}`}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-premium hover:opacity-90 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={`Play ${featured.name} by ${featured.artistName}`}
          >
            <Play size={18} fill="currentColor" aria-hidden="true" />
            Play Now
          </Link>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { RSSFeedItem } from "@/lib/discovery";

interface TrendingSectionProps {
  tracks: RSSFeedItem[];
}

export default function TrendingSection({ tracks }: TrendingSectionProps) {
  if (tracks.length === 0) return null;

  const featured = tracks[0];
  const rest = tracks.slice(1, 5);

  return (
    <section
      className="animate-on-scroll-slide-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Trending tracks"
    >
      <div className="mb-8 flex items-center gap-3">
        <TrendingUp size={24} className="text-primary" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
          Trending Now
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
        {/* Large featured card */}
        {featured && (
          <Link
            href={`/track/${featured.id}`}
            className="glass-card card-tilt group relative col-span-1 overflow-hidden rounded-2xl md:col-span-2 lg:col-span-7 lg:row-span-2"
            aria-label={`${featured.name} by ${featured.artistName}`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9]">
              {featured.artworkUrl100 && (
                <Image
                  src={featured.artworkUrl100.replace("100x100", "600x600")}
                  alt={`${featured.name} artwork`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 58vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="mb-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-light">
                #1 Trending
              </span>
              <h4 className="text-xl font-bold text-white sm:text-2xl">
                {featured.name}
              </h4>
              <p className="mt-1 text-sm text-white/70">
                {featured.artistName}
              </p>
            </div>
          </Link>
        )}

        {/* Smaller cards grid */}
        {rest.map((track, index) => (
          <Link
            key={track.id}
            href={`/track/${track.id}`}
            className="glass-card card-tilt group flex items-center gap-4 overflow-hidden rounded-xl p-3 transition-premium hover:shadow-lg lg:col-span-5"
            aria-label={`${track.name} by ${track.artistName}`}
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-border shadow-sm sm:h-20 sm:w-20">
              {track.artworkUrl100 && (
                <Image
                  src={track.artworkUrl100.replace("100x100", "200x200")}
                  alt={`${track.name} artwork`}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-muted">
                #{index + 2}
              </span>
              <h4 className="truncate text-sm font-semibold text-foreground">
                {track.name}
              </h4>
              <p className="truncate text-xs text-muted">
                {track.artistName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

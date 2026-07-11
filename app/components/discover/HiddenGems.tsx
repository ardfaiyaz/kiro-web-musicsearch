import Image from "next/image";
import Link from "next/link";
import { Gem } from "lucide-react";
import { getHiddenGems } from "@/lib/ai-discovery";

export default async function HiddenGems() {
  const result = await getHiddenGems("indie");

  if (result.error || result.tracks.length === 0) {
    return null;
  }

  return (
    <section aria-label="Hidden gems" className="mb-16">
      <div className="mb-6 flex items-center gap-3">
        <Gem size={24} className="text-amber-500" aria-hidden="true" />
        <div>
          <h3 className="text-2xl font-bold text-foreground">Hidden Gems</h3>
          <p className="text-sm text-muted">
            Lesser-known tracks waiting to be discovered
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {result.tracks.map((track) => (
          <Link
            key={track.trackId}
            href={`/track/${track.trackId}`}
            className="group flex items-center gap-3 rounded-xl border border-border/50 bg-surface/50 p-3 transition-all duration-300 hover:border-foreground/10 hover:bg-surface hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-border">
              {track.artworkUrl100 ? (
                <Image
                  src={track.artworkUrl100.replace("100x100", "200x200")}
                  alt={`${track.trackName} artwork`}
                  fill
                  sizes="48px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Gem size={16} className="text-muted" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-foreground">
                {track.trackName}
              </span>
              <span className="truncate text-xs text-muted">
                {track.artistName}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

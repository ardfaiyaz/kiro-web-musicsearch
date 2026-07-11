import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { getTrendingSongs } from "@/lib/discovery";

export default async function PopularThisWeek() {
  const trendingSongs = await getTrendingSongs();

  if (trendingSongs.length === 0) {
    return null;
  }

  const topSongs = trendingSongs.slice(0, 10);

  return (
    <section aria-label="Popular this week" className="mb-16">
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp size={24} className="text-primary" aria-hidden="true" />
        <div>
          <h3 className="text-2xl font-bold text-foreground">
            Popular This Week
          </h3>
          <p className="text-sm text-muted">
            The most played tracks right now
          </p>
        </div>
      </div>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {topSongs.map((song, index) => (
          <li key={song.id}>
            <Link
              href={`/track/${song.id}`}
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface/50 p-3 transition-all duration-300 hover:border-foreground/10 hover:bg-surface hover:shadow-md"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-sm font-bold text-muted"
                aria-label={`Number ${index + 1}`}
              >
                {index + 1}
              </span>
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-border">
                {song.artworkUrl100 && (
                  <Image
                    src={song.artworkUrl100.replace("100x100", "200x200")}
                    alt={`${song.name} artwork`}
                    fill
                    sizes="44px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-foreground">
                  {song.name}
                </span>
                <span className="truncate text-xs text-muted">
                  {song.artistName}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

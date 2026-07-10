import Image from "next/image";
import Link from "next/link";
import { RecommendedTrack } from "@/lib/ai-discovery";

interface RecommendationPanelProps {
  title: string;
  tracks: RecommendedTrack[];
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function RecommendationPanel({
  title,
  tracks,
}: RecommendationPanelProps) {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <section className="glass-recommendation p-6" aria-label={title}>
      <h3 className="mb-6 text-xl font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => (
          <Link
            key={track.trackId}
            href={`/track/${track.trackId}`}
            className="group flex items-center gap-3 rounded-xl border border-border/50 bg-surface/50 p-3 transition-premium hover:border-foreground/10 hover:bg-surface"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-border">
              {track.artworkUrl100 ? (
                <Image
                  src={track.artworkUrl100.replace("100x100", "200x200")}
                  alt={`${track.trackName} artwork`}
                  fill
                  sizes="48px"
                  className="object-cover transition-premium group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    className="h-5 w-5 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-foreground group-hover:text-accent transition-premium">
                {track.trackName}
              </span>
              <span className="truncate text-xs text-muted">
                {track.artistName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted/80">
                <svg
                  className="h-2.5 w-2.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {track.reason}
              </span>
            </div>
            {track.trackTimeMillis && (
              <span className="shrink-0 text-xs text-muted/70">
                {formatDuration(track.trackTimeMillis)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

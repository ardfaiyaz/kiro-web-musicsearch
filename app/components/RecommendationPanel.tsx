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
      <div className="mb-6 flex items-center gap-3">
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
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => (
          <Link
            key={track.trackId}
            href={`/track/${track.trackId}`}
            className="group flex items-start gap-3 rounded-xl border border-border/50 bg-surface/50 p-3 transition-premium hover:border-foreground/10 hover:bg-surface hover:shadow-md"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-border shadow-sm">
              {track.artworkUrl100 ? (
                <Image
                  src={track.artworkUrl100.replace("100x100", "200x200")}
                  alt={`${track.trackName} artwork`}
                  fill
                  sizes="56px"
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
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-semibold text-foreground group-hover:text-accent transition-premium">
                {track.trackName}
              </span>
              <span className="truncate text-xs text-muted">
                {track.artistName}
              </span>
              <span className="mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium italic text-muted/90">
                <svg
                  className="h-3 w-3 shrink-0"
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
              <span className="shrink-0 pt-0.5 text-xs text-muted/70">
                {formatDuration(track.trackTimeMillis)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

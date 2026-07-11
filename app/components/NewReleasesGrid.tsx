import Image from "next/image";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { RSSFeedItem } from "@/lib/discovery";

interface NewReleasesGridProps {
  releases: RSSFeedItem[];
}

function formatReleaseDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NewReleasesGrid({ releases }: NewReleasesGridProps) {
  if (releases.length === 0) return null;

  return (
    <section
      className="animate-on-scroll-slide-up mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-label="New releases"
    >
      <div className="mb-8 flex items-center gap-3">
        <Disc3 size={24} className="text-info" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
          New Releases
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {releases.slice(0, 10).map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1"
            aria-label={`${album.name} by ${album.artistName}`}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-border">
              {album.artworkUrl100 && (
                <Image
                  src={album.artworkUrl100.replace("100x100", "300x300")}
                  alt={`${album.name} artwork`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
              {/* New badge */}
              <span className="absolute left-2 top-2 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                New
              </span>
              {/* Release date badge */}
              {album.releaseDate && (
                <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  {formatReleaseDate(album.releaseDate)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 p-3 sm:p-4">
              <h4 className="truncate text-sm font-semibold text-foreground">
                {album.name}
              </h4>
              <p className="truncate text-xs text-muted">
                {album.artistName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

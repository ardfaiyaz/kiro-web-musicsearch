import Image from "next/image";
import Link from "next/link";
import { Calendar, Disc3 } from "lucide-react";
import { getNewReleases, RSSFeedItem } from "@/lib/discovery";

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function getRelativeWeek(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return "This Week";
    if (diffDays < 14) return "Last Week";
    if (diffDays < 30) return "This Month";
    return "Earlier";
  } catch {
    return "Earlier";
  }
}

function groupByWeek(releases: RSSFeedItem[]): Record<string, RSSFeedItem[]> {
  const groups: Record<string, RSSFeedItem[]> = {};
  for (const release of releases) {
    const week = getRelativeWeek(release.releaseDate || "");
    if (!groups[week]) groups[week] = [];
    groups[week].push(release);
  }
  return groups;
}

export default async function ReleaseRadar() {
  const releases = await getNewReleases();

  if (releases.length === 0) return null;

  // Sort by release date (newest first)
  const sorted = [...releases].sort((a, b) => {
    const dateA = new Date(a.releaseDate || "").getTime();
    const dateB = new Date(b.releaseDate || "").getTime();
    return dateB - dateA;
  });

  const grouped = groupByWeek(sorted);
  const weekOrder = ["This Week", "Last Week", "This Month", "Earlier"];

  return (
    <section aria-label="Release radar" className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={20} className="text-accent" aria-hidden="true" />
        <div>
          <h3 className="text-2xl font-bold text-foreground">Release Radar</h3>
          <p className="text-sm text-muted">New albums and releases, organized by date</p>
        </div>
      </div>

      <div className="space-y-8">
        {weekOrder.map((week) => {
          const items = grouped[week];
          if (!items || items.length === 0) return null;

          return (
            <div key={week}>
              {/* Timeline marker */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-accent shadow-sm shadow-accent/30" aria-hidden="true" />
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  {week}
                </h4>
                <div className="flex-1 h-px bg-border" aria-hidden="true" />
              </div>

              {/* Release cards */}
              <div className="grid grid-cols-2 gap-4 pl-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((release) => (
                  <Link
                    key={release.id}
                    href={`/album/${release.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-border">
                      {release.artworkUrl100 ? (
                        <Image
                          src={release.artworkUrl100.replace("100x100", "300x300")}
                          alt={`${release.name} artwork`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Disc3 size={24} className="text-muted" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-3">
                      <h5 className="truncate text-sm font-semibold text-foreground">
                        {release.name}
                      </h5>
                      <p className="truncate text-xs text-muted">
                        {release.artistName}
                      </p>
                      {release.releaseDate && (
                        <p className="text-[10px] font-medium text-muted/70">
                          {formatDate(release.releaseDate)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

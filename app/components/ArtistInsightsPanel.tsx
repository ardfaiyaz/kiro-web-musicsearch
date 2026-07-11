import {
  Music,
  TrendingUp,
  Headphones,
  Disc3,
} from "lucide-react";
import type { UnifiedArtist, ItunesAlbum } from "@/lib/types";

interface ArtistInsightsPanelProps {
  unifiedArtist: UnifiedArtist;
  albums: ItunesAlbum[];
}

function PopularityBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="text-xs font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value}%`}
        />
      </div>
    </div>
  );
}

export default function ArtistInsightsPanel({
  unifiedArtist,
  albums,
}: ArtistInsightsPanelProps) {
  const { genres, popularity, followers, lastfm } = unifiedArtist;

  // Compute career stats
  const sortedAlbums = [...albums].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );
  const startYear = sortedAlbums[0]
    ? new Date(sortedAlbums[0].releaseDate).getFullYear()
    : null;
  const currentYear = new Date().getFullYear();
  const yearsActive = startYear ? currentYear - startYear : null;

  // Musical style analysis
  const mainGenres = genres.slice(0, 4);
  const era = startYear
    ? startYear >= 2020
      ? "Contemporary"
      : startYear >= 2010
        ? "Modern"
        : startYear >= 2000
          ? "2000s"
          : startYear >= 1990
            ? "90s"
            : "Classic"
    : "Unknown";

  // Listening context suggestions
  const listeningContexts = getListeningContexts(genres);

  return (
    <aside
      className="glass-subtle rounded-2xl p-6"
      aria-label="AI-generated artist insights"
    >
      <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
        <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
        Artist Insights
      </h3>

      <div className="flex flex-col gap-6">
        {/* Musical Style Analysis */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <Music className="h-3.5 w-3.5" aria-hidden="true" />
            Musical Style
          </h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg bg-surface/50 px-3 py-2">
              <span className="text-xs text-muted">Era</span>
              <span className="text-xs font-semibold text-foreground">{era}</span>
            </div>
            {mainGenres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {mainGenres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-medium text-primary"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popularity */}
        {popularity !== undefined && (
          <PopularityBar value={popularity} label="Popularity Score" />
        )}

        {/* Career Stats */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <Disc3 className="h-3.5 w-3.5" aria-hidden="true" />
            Career Stats
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {albums.length > 0 && (
              <div className="flex flex-col gap-0.5 rounded-lg bg-surface/50 p-3">
                <span className="text-lg font-bold text-foreground">{albums.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted">Albums</span>
              </div>
            )}
            {yearsActive !== null && yearsActive > 0 && (
              <div className="flex flex-col gap-0.5 rounded-lg bg-surface/50 p-3">
                <span className="text-lg font-bold text-foreground">{yearsActive}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted">Years Active</span>
              </div>
            )}
            {followers !== undefined && (
              <div className="flex flex-col gap-0.5 rounded-lg bg-surface/50 p-3">
                <span className="text-lg font-bold text-foreground">
                  {followers >= 1000000
                    ? `${(followers / 1000000).toFixed(1)}M`
                    : followers >= 1000
                      ? `${(followers / 1000).toFixed(0)}K`
                      : followers.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted">Followers</span>
              </div>
            )}
            {lastfm?.stats?.listeners && (
              <div className="flex flex-col gap-0.5 rounded-lg bg-surface/50 p-3">
                <span className="text-lg font-bold text-foreground">
                  {parseInt(lastfm.stats.listeners) >= 1000000
                    ? `${(parseInt(lastfm.stats.listeners) / 1000000).toFixed(1)}M`
                    : parseInt(lastfm.stats.listeners) >= 1000
                      ? `${(parseInt(lastfm.stats.listeners) / 1000).toFixed(0)}K`
                      : parseInt(lastfm.stats.listeners).toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted">Listeners</span>
              </div>
            )}
          </div>
        </div>

        {/* Listening Context */}
        {listeningContexts.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
              Perfect For
            </h4>
            <div className="flex flex-wrap gap-2">
              {listeningContexts.map((context) => (
                <span
                  key={context}
                  className="rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {context}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function getListeningContexts(genres: string[]): string[] {
  const genreSet = genres.map((g) => g.toLowerCase());
  const contexts: string[] = [];

  if (genreSet.some((g) => g.includes("chill") || g.includes("ambient") || g.includes("lo-fi"))) {
    contexts.push("Relaxation", "Study");
  }
  if (genreSet.some((g) => g.includes("workout") || g.includes("edm") || g.includes("electronic") || g.includes("dance"))) {
    contexts.push("Working Out", "Dance");
  }
  if (genreSet.some((g) => g.includes("rock") || g.includes("metal") || g.includes("punk"))) {
    contexts.push("Driving", "Energy Boost");
  }
  if (genreSet.some((g) => g.includes("pop") || g.includes("r&b") || g.includes("soul"))) {
    contexts.push("Mood Lift", "Social");
  }
  if (genreSet.some((g) => g.includes("classical") || g.includes("jazz") || g.includes("piano"))) {
    contexts.push("Focus", "Evening Wind-down");
  }
  if (genreSet.some((g) => g.includes("hip hop") || g.includes("rap") || g.includes("trap"))) {
    contexts.push("Commute", "Pre-game");
  }
  if (genreSet.some((g) => g.includes("indie") || g.includes("folk") || g.includes("acoustic"))) {
    contexts.push("Morning Coffee", "Road Trips");
  }
  if (genreSet.some((g) => g.includes("country"))) {
    contexts.push("Road Trips", "Outdoor Activities");
  }

  // Default contexts if none matched
  if (contexts.length === 0) {
    contexts.push("Everyday Listening", "Discovery");
  }

  // Deduplicate and limit
  return [...new Set(contexts)].slice(0, 5);
}

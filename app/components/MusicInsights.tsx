"use client";

import Link from "next/link";
import { ItunesTrack, ItunesAlbum, LastFmArtist } from "@/lib/types";

interface TrackInsightsProps {
  type: "track";
  track: ItunesTrack;
}

interface ArtistInsightsProps {
  type: "artist";
  artistName: string;
  genre: string;
  lastFmInfo?: LastFmArtist | null;
  albums?: ItunesAlbum[];
}

type MusicInsightsProps = TrackInsightsProps | ArtistInsightsProps;

function PopularityBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="text-xs font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
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

function GenreTags({ tags }: { tags: string[] }) {
  const colors = [
    "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${colors[index % colors.length]}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function DiscographyTimeline({ albums }: { albums: ItunesAlbum[] }) {
  const sorted = [...albums].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-3 pb-2" style={{ minWidth: "max-content" }}>
        {sorted.map((album) => {
          const year = new Date(album.releaseDate).getFullYear();
          return (
            <Link
              key={album.collectionId}
              href={`/album/${album.collectionId}`}
              className="group flex flex-col items-center gap-2 rounded-lg p-2 transition-premium hover:bg-surface"
            >
              <div className="h-8 w-0.5 bg-border group-hover:bg-foreground/30 transition-premium" />
              <span className="text-[10px] font-medium text-muted">{year}</span>
              <span className="max-w-20 truncate text-center text-xs font-medium text-foreground group-hover:text-accent transition-premium">
                {album.collectionName}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function MusicInsights(props: MusicInsightsProps) {
  if (props.type === "track") {
    const { track } = props;
    const releaseYear = new Date(track.releaseDate).getFullYear();
    const decade = `${Math.floor(releaseYear / 10) * 10}s`;

    return (
      <section className="glass-stats p-5" aria-label="Track insights">
        <h3 className="mb-4 text-lg font-bold text-foreground">Track Insights</h3>
        <div className="flex flex-col gap-4">
          <GenreTags tags={[track.primaryGenreName]} />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 rounded-lg bg-surface/50 p-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                Era
              </span>
              <span className="text-sm font-bold text-foreground">{decade}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-surface/50 p-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                Released
              </span>
              <span className="text-sm font-bold text-foreground">{releaseYear}</span>
            </div>
          </div>

          <PopularityBar value={75} label="Popularity" />
        </div>
      </section>
    );
  }

  const { artistName, genre, lastFmInfo, albums } = props;
  const tags = lastFmInfo?.tags?.tag?.map((t) => t.name) || [genre];
  const listeners = lastFmInfo?.stats?.listeners
    ? parseInt(lastFmInfo.stats.listeners)
    : 0;
  const playcount = lastFmInfo?.stats?.playcount
    ? parseInt(lastFmInfo.stats.playcount)
    : 0;

  // Estimate popularity score from listener count (max out around 10M listeners)
  const popularityScore = listeners
    ? Math.min(100, Math.round((Math.log10(listeners + 1) / 7) * 100))
    : 50;

  const similarArtists = lastFmInfo?.similar?.artist || [];

  return (
    <section className="glass-stats p-5" aria-label="Artist insights">
      <h3 className="mb-4 text-lg font-bold text-foreground">Artist Insights</h3>
      <div className="flex flex-col gap-5">
        {/* Genre tags */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
            Genres & Tags
          </h4>
          <GenreTags tags={tags.slice(0, 6)} />
        </div>

        {/* Popularity */}
        <PopularityBar value={popularityScore} label="Popularity" />

        {/* Stats */}
        {(listeners > 0 || playcount > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {listeners > 0 && (
              <div className="flex flex-col gap-1 rounded-lg bg-surface/50 p-3">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  Listeners
                </span>
                <span className="text-sm font-bold text-foreground">
                  {listeners.toLocaleString()}
                </span>
              </div>
            )}
            {playcount > 0 && (
              <div className="flex flex-col gap-1 rounded-lg bg-surface/50 p-3">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  Total Plays
                </span>
                <span className="text-sm font-bold text-foreground">
                  {playcount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Discography timeline */}
        {albums && albums.length > 0 && (
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
              Discography Timeline
            </h4>
            <DiscographyTimeline albums={albums} />
          </div>
        )}

        {/* Related artists */}
        {similarArtists.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
              Related Artists
            </h4>
            <div className="flex flex-wrap gap-2">
              {similarArtists.slice(0, 6).map((artist) => (
                <span
                  key={artist.name}
                  className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {artist.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Release era */}
        {albums && albums.length > 0 && (
          <div className="flex flex-col gap-1 rounded-lg bg-surface/50 p-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Active Since
            </span>
            <span className="text-sm font-bold text-foreground">
              {new Date(
                [...albums].sort(
                  (a, b) =>
                    new Date(a.releaseDate).getTime() -
                    new Date(b.releaseDate).getTime()
                )[0].releaseDate
              ).getFullYear()}{" "}
              - Present
            </span>
            <span className="text-xs text-muted">
              {albums.length} album{albums.length !== 1 ? "s" : ""} released | {artistName}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

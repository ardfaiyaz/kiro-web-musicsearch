"use client";

import { useState, useCallback } from "react";
import { Search, ArrowRight, Disc3, Music, Tag } from "lucide-react";

interface ArtistInfo {
  artistId: number;
  artistName: string;
  primaryGenreName: string;
  artworkUrl?: string;
  albums: AlbumInfo[];
}

interface AlbumInfo {
  collectionId: number;
  collectionName: string;
  releaseDate: string;
  artworkUrl100: string;
  trackCount: number;
  primaryGenreName: string;
}

export default function ArtistComparison() {
  const [artist1, setArtist1] = useState<ArtistInfo | null>(null);
  const [artist2, setArtist2] = useState<ArtistInfo | null>(null);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [results1, setResults1] = useState<ArtistInfo[]>([]);
  const [results2, setResults2] = useState<ArtistInfo[]>([]);
  const [searching1, setSearching1] = useState(false);
  const [searching2, setSearching2] = useState(false);

  const searchArtist = useCallback(
    async (query: string, side: 1 | 2) => {
      if (!query.trim()) return;
      const setSearching = side === 1 ? setSearching1 : setSearching2;
      const setResults = side === 1 ? setResults1 : setResults2;

      setSearching(true);
      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=5`
        );
        const data = await response.json();
        const artists = data.results
          .filter((r: { wrapperType: string }) => r.wrapperType === "artist")
          .map((a: { artistId: number; artistName: string; primaryGenreName: string }) => ({
            artistId: a.artistId,
            artistName: a.artistName,
            primaryGenreName: a.primaryGenreName,
            albums: [],
          }));
        setResults(artists);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  const selectArtist = useCallback(
    async (artist: ArtistInfo, side: 1 | 2) => {
      const setArtist = side === 1 ? setArtist1 : setArtist2;
      const setResults = side === 1 ? setResults1 : setResults2;

      // Fetch albums
      try {
        const response = await fetch(
          `https://itunes.apple.com/lookup?id=${artist.artistId}&entity=album&limit=50`
        );
        const data = await response.json();
        const albums = data.results
          .filter(
            (r: { wrapperType: string; collectionType?: string }) =>
              r.wrapperType === "collection" && r.collectionType === "Album"
          )
          .map(
            (a: {
              collectionId: number;
              collectionName: string;
              releaseDate: string;
              artworkUrl100: string;
              trackCount: number;
              primaryGenreName: string;
            }) => ({
              collectionId: a.collectionId,
              collectionName: a.collectionName,
              releaseDate: a.releaseDate,
              artworkUrl100: a.artworkUrl100,
              trackCount: a.trackCount,
              primaryGenreName: a.primaryGenreName,
            })
          );

        // Get artwork from first album
        const artworkUrl = albums.length > 0 ? albums[0].artworkUrl100 : undefined;

        setArtist({
          ...artist,
          artworkUrl,
          albums,
        });
      } catch {
        setArtist({ ...artist, albums: [] });
      }
      setResults([]);
    },
    []
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Artist 1 */}
        <ArtistSelector
          label="Artist 1"
          artist={artist1}
          search={search1}
          setSearch={setSearch1}
          results={results1}
          searching={searching1}
          onSearch={() => searchArtist(search1, 1)}
          onSelect={(a) => selectArtist(a, 1)}
          onClear={() => {
            setArtist1(null);
            setSearch1("");
          }}
        />

        {/* Artist 2 */}
        <ArtistSelector
          label="Artist 2"
          artist={artist2}
          search={search2}
          setSearch={setSearch2}
          results={results2}
          searching={searching2}
          onSearch={() => searchArtist(search2, 2)}
          onSelect={(a) => selectArtist(a, 2)}
          onClear={() => {
            setArtist2(null);
            setSearch2("");
          }}
        />
      </div>

      {/* Comparison Results */}
      {artist1 && artist2 && (
        <section
          className="glass-stats overflow-hidden rounded-2xl"
          aria-label="Artist comparison"
        >
          {/* Header */}
          <div className="grid grid-cols-3 border-b border-border p-4">
            <div className="flex flex-col items-center gap-2">
              {artist1.artworkUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist1.artworkUrl.replace("100x100", "200x200")}
                  alt={artist1.artistName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <p className="text-center text-sm font-semibold text-foreground">
                {artist1.artistName}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
                VS
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              {artist2.artworkUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist2.artworkUrl.replace("100x100", "200x200")}
                  alt={artist2.artistName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <p className="text-center text-sm font-semibold text-foreground">
                {artist2.artistName}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="divide-y divide-border">
            <ComparisonRow
              label="Genre"
              value1={artist1.primaryGenreName}
              value2={artist2.primaryGenreName}
              icon={<Tag className="h-4 w-4" />}
            />
            <ComparisonRow
              label="Albums"
              value1={artist1.albums.length.toString()}
              value2={artist2.albums.length.toString()}
              icon={<Disc3 className="h-4 w-4" />}
              highlight={true}
            />
            <ComparisonRow
              label="Total Tracks"
              value1={artist1.albums
                .reduce((sum, a) => sum + a.trackCount, 0)
                .toString()}
              value2={artist2.albums
                .reduce((sum, a) => sum + a.trackCount, 0)
                .toString()}
              icon={<Music className="h-4 w-4" />}
              highlight={true}
            />
            <ComparisonRow
              label="Genres"
              value1={[
                ...new Set(artist1.albums.map((a) => a.primaryGenreName)),
              ].join(", ")}
              value2={[
                ...new Set(artist2.albums.map((a) => a.primaryGenreName)),
              ].join(", ")}
              icon={<Tag className="h-4 w-4" />}
            />
          </div>

          {/* Latest Releases */}
          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Latest Releases
              </h4>
              <div className="flex flex-col gap-2">
                {artist1.albums.slice(0, 3).map((album) => (
                  <div
                    key={album.collectionId}
                    className="flex items-center gap-2 rounded-lg border border-border p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={album.artworkUrl100}
                      alt=""
                      className="h-8 w-8 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {album.collectionName}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(album.releaseDate).getFullYear()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Latest Releases
              </h4>
              <div className="flex flex-col gap-2">
                {artist2.albums.slice(0, 3).map((album) => (
                  <div
                    key={album.collectionId}
                    className="flex items-center gap-2 rounded-lg border border-border p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={album.artworkUrl100}
                      alt=""
                      className="h-8 w-8 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {album.collectionName}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(album.releaseDate).getFullYear()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ArtistSelector({
  label,
  artist,
  search,
  setSearch,
  results,
  searching,
  onSearch,
  onSelect,
  onClear,
}: {
  label: string;
  artist: ArtistInfo | null;
  search: string;
  setSearch: (val: string) => void;
  results: ArtistInfo[];
  searching: boolean;
  onSearch: () => void;
  onSelect: (artist: ArtistInfo) => void;
  onClear: () => void;
}) {
  if (artist) {
    return (
      <div className="glass-stats flex flex-col items-center gap-3 rounded-xl p-4">
        {artist.artworkUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.artworkUrl.replace("100x100", "200x200")}
            alt={artist.artistName}
            className="h-20 w-20 rounded-full object-cover"
          />
        )}
        <p className="text-center font-semibold text-foreground">
          {artist.artistName}
        </p>
        <p className="text-xs text-muted">{artist.primaryGenreName}</p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          Change artist
        </button>
      </div>
    );
  }

  return (
    <div className="glass-stats flex flex-col gap-3 rounded-xl p-4">
      <p className="text-sm font-medium text-muted">{label}</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Search artist..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none"
            aria-label={`Search for ${label}`}
          />
        </div>
        <button
          type="button"
          onClick={onSearch}
          disabled={searching || !search.trim()}
          className="rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/10 disabled:opacity-50"
          aria-label="Search"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {searching && (
        <div className="flex justify-center py-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        </div>
      )}

      {results.length > 0 && (
        <ul className="flex flex-col gap-1" role="listbox">
          {results.map((r) => (
            <li key={r.artistId}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface"
                role="option"
                aria-selected={false}
              >
                <span className="font-medium">{r.artistName}</span>
                <span className="ml-2 text-xs text-muted">
                  {r.primaryGenreName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ComparisonRow({
  label,
  value1,
  value2,
  icon,
  highlight = false,
}: {
  label: string;
  value1: string;
  value2: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  const num1 = Number(value1);
  const num2 = Number(value2);
  const isNumeric = !isNaN(num1) && !isNaN(num2) && highlight;

  return (
    <div className="grid grid-cols-3 items-center gap-2 px-4 py-3">
      <p
        className={`text-center text-sm ${
          isNumeric && num1 > num2
            ? "font-bold text-green-400"
            : "text-foreground"
        }`}
      >
        {value1}
      </p>
      <div className="flex items-center justify-center gap-2 text-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`text-center text-sm ${
          isNumeric && num2 > num1
            ? "font-bold text-green-400"
            : "text-foreground"
        }`}
      >
        {value2}
      </p>
    </div>
  );
}

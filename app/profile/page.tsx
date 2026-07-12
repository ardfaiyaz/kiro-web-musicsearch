"use client";

import { useMemo, useRef, useEffect, useCallback, useState } from "react";
import Header from "@/app/components/Header";
import { usePersonalization } from "@/app/components/PersonalizationContext";
import {
  computeListeningSummary,
  computeTopArtists,
  computeTopSongs,
  computeGenreAnalytics,
  computeAchievements,
} from "@/lib/analytics";
import { Music, Award, BarChart3, Users, Disc3, Clock } from "lucide-react";

export default function ProfilePage() {
  const { listeningHistory, favoriteArtists, favoriteAlbums, playlists } =
    usePersonalization();

  const [now] = useState(() => Date.now());

  const summary = useMemo(
    () => computeListeningSummary(listeningHistory, "all", now),
    [listeningHistory, now]
  );

  const topArtists = useMemo(
    () => computeTopArtists(listeningHistory, 10),
    [listeningHistory]
  );

  const topSongs = useMemo(
    () => computeTopSongs(listeningHistory, 5),
    [listeningHistory]
  );

  const genres = useMemo(
    () => computeGenreAnalytics(listeningHistory),
    [listeningHistory]
  );

  const achievements = useMemo(
    () =>
      computeAchievements(
        listeningHistory,
        favoriteArtists.length + favoriteAlbums.length,
        favoriteArtists.length,
        favoriteAlbums.length,
        now
      ),
    [listeningHistory, favoriteArtists.length, favoriteAlbums.length, now]
  );

  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  // Taste summary
  const tasteSummary = useMemo(() => {
    if (genres.length === 0) return "Start listening to build your taste profile!";
    const topGenre = genres[0]?.genre || "Music";
    const variety = genres.length;
    if (variety >= 8) return `Eclectic listener with a love for ${topGenre}`;
    if (variety >= 5) return `Diverse taste centered around ${topGenre}`;
    if (variety >= 3) return `Focused listener who loves ${topGenre}`;
    return `Dedicated ${topGenre} enthusiast`;
  }, [genres]);

  return (
    <div className="flex flex-1 flex-col">
      <Header showBack />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500">
            <Music className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Music Taste Profile
          </h1>
          <p className="mt-2 text-muted">{tasteSummary}</p>
        </header>

        {/* Stats Summary */}
        <section
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          aria-label="Listening statistics"
        >
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Hours Listened"
            value={summary.hours.toString()}
          />
          <StatCard
            icon={<Music className="h-5 w-5" />}
            label="Songs Played"
            value={summary.songs.toString()}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Artists"
            value={summary.artists.toString()}
          />
          <StatCard
            icon={<Disc3 className="h-5 w-5" />}
            label="Albums"
            value={summary.albums.toString()}
          />
        </section>

        {/* Genre Pie Chart */}
        {genres.length > 0 && (
          <section className="glass-stats mb-8 p-6" aria-label="Genre breakdown">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <BarChart3 className="h-5 w-5 text-muted" aria-hidden="true" />
              Genre Breakdown
            </h2>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <GenrePieChart genres={genres.slice(0, 8)} />
              <div className="flex flex-1 flex-col gap-2">
                {genres.slice(0, 8).map((genre, i) => (
                  <div key={genre.genre} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm text-foreground">{genre.genre}</span>
                    <span className="text-sm font-medium text-muted">
                      {genre.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <section className="glass-stats mb-8 p-6" aria-label="Top artists">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Users className="h-5 w-5 text-muted" aria-hidden="true" />
              Top Artists
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {topArtists.map((artist, index) => (
                <div
                  key={artist.artistName}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface/50 p-3 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20">
                    <span className="text-lg font-bold text-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs font-medium text-foreground">
                    {artist.artistName}
                  </p>
                  <p className="text-xs text-muted">
                    {artist.playCount} plays
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Songs */}
        {topSongs.length > 0 && (
          <section className="glass-stats mb-8 p-6" aria-label="Top songs">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Music className="h-5 w-5 text-muted" aria-hidden="true" />
              Top Songs
            </h2>
            <div className="flex flex-col gap-2">
              {topSongs.map((song, index) => (
                <div
                  key={song.trackId}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-3"
                >
                  <span className="w-6 text-center text-sm font-bold text-muted">
                    {index + 1}
                  </span>
                  {song.artworkUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={song.artworkUrl}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {song.trackName}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {song.artistName}
                    </p>
                  </div>
                  <span className="text-xs text-muted">
                    {song.playCount} plays
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        <section className="glass-stats mb-8 p-6" aria-label="Achievements">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Award className="h-5 w-5 text-muted" aria-hidden="true" />
            Badges ({unlockedAchievements.length}/{achievements.length})
          </h2>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                    achievement.unlocked
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-border bg-surface/30 opacity-50"
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {getAchievementEmoji(achievement.icon)}
                  </span>
                  <p className="text-xs font-medium text-foreground">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-muted">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-yellow-500/50"
                        style={{
                          width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted">
              Start listening to unlock achievements!
            </p>
          )}
        </section>

        {/* Library Summary */}
        <section className="glass-stats p-6" aria-label="Library summary">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Library Overview
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {favoriteArtists.length}
              </p>
              <p className="text-xs text-muted">Favorite Artists</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {favoriteAlbums.length}
              </p>
              <p className="text-xs text-muted">Favorite Albums</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {playlists.length}
              </p>
              <p className="text-xs text-muted">Playlists</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-stats flex flex-col items-center gap-2 p-4 text-center">
      <div className="text-muted" aria-hidden="true">
        {icon}
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

const GENRE_COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
];

function GenrePieChart({ genres }: { genres: { genre: string; percentage: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 80;

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;
    for (let i = 0; i < genres.length; i++) {
      const sliceAngle = (genres[i].percentage / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = GENRE_COLORS[i % GENRE_COLORS.length];
      ctx.fill();
      startAngle += sliceAngle;
    }

    // Center circle (donut)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = "var(--card, #1a1a2e)";
    ctx.fill();
  }, [genres]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="h-[200px] w-[200px]"
      aria-label={`Genre pie chart showing ${genres.map((g) => `${g.genre} at ${g.percentage}%`).join(", ")}`}
      role="img"
    />
  );
}

function getAchievementEmoji(icon: string): string {
  const iconMap: Record<string, string> = {
    play: "\u25B6\uFE0F",
    compass: "\u{1F9ED}",
    headphones: "\u{1F3A7}",
    palette: "\u{1F3A8}",
    disc: "\u{1F4BF}",
    users: "\u{1F465}",
    moon: "\u{1F319}",
    fire: "\u{1F525}",
    star: "\u2B50",
    trophy: "\u{1F3C6}",
    heart: "\u2764\uFE0F",
    music: "\u{1F3B5}",
    zap: "\u26A1",
    crown: "\u{1F451}",
    rocket: "\u{1F680}",
  };
  return iconMap[icon] || "\u{1F3B5}";
}

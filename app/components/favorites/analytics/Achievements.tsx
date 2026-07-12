"use client";

import { useMemo, useEffect, useSyncExternalStore } from "react";
import {
  Trophy,
  Play,
  Compass,
  Headphones,
  Palette,
  Disc3,
  Users,
  Moon,
  Flame,
  Sun,
  Star,
  Zap,
  Music,
  Globe,
  Heart,
} from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeListeningStreak, type Achievement as AchievementType } from "@/lib/analytics";

interface AchievementsProps {
  history: HistoryEntry[];
  favCount: number;
  artistCount: number;
  albumCount: number;
}

function subscribeNoop() {
  return () => {};
}

function getClientNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

const BADGES_STORAGE_KEY = "music-search-earned-badges";

function loadEarnedBadges(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(BADGES_STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored) as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function saveEarnedBadges(badges: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(Array.from(badges)));
  } catch {
    // ignore quota errors
  }
}

const ICON_MAP: Record<string, React.ReactNode> = {
  play: <Play className="h-5 w-5" />,
  compass: <Compass className="h-5 w-5" />,
  headphones: <Headphones className="h-5 w-5" />,
  palette: <Palette className="h-5 w-5" />,
  disc: <Disc3 className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  moon: <Moon className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
  sun: <Sun className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
  zap: <Zap className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  globe: <Globe className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  trophy: <Trophy className="h-5 w-5" />,
};

function computeComprehensiveAchievements(
  history: HistoryEntry[],
  favCount: number,
  artistCount: number,
  albumCount: number,
  now: number
): AchievementType[] {
  const totalPlays = history.length;
  const uniqueArtists = new Set(history.map((e) => e.artistName));
  const uniqueGenres = new Set(
    history.map((e) => e.primaryGenreName).filter(Boolean)
  );
  const uniqueSongs = new Set(history.map((e) => e.trackId));

  // Night listens (10pm - 5am)
  const nightListens = history.filter((e) => {
    const hour = new Date(e.playedAt).getHours();
    return hour >= 22 || hour < 5;
  }).length;

  // Early bird listens (5am - 8am)
  const earlyBirdListens = history.filter((e) => {
    const hour = new Date(e.playedAt).getHours();
    return hour >= 5 && hour < 8;
  }).length;

  // Streak calculation
  const streak = computeListeningStreak(history, now);

  // Favorite songs (played 5+ times)
  const songPlayCounts = new Map<number, number>();
  for (const entry of history) {
    songPlayCounts.set(entry.trackId, (songPlayCounts.get(entry.trackId) || 0) + 1);
  }
  const repeatFavorites = Array.from(songPlayCounts.values()).filter((c) => c >= 5).length;

  // Total listening hours
  const totalMs = history.reduce((sum, e) => sum + e.duration, 0);
  const totalHours = totalMs / (1000 * 60 * 60);

  return [
    {
      id: "first-song",
      title: "First Song",
      description: "Play your first song",
      icon: "play",
      unlocked: totalPlays >= 1,
      progress: Math.min(totalPlays, 1),
      target: 1,
    },
    {
      id: "music-explorer",
      title: "Music Explorer",
      description: "Play 50 songs",
      icon: "compass",
      unlocked: totalPlays >= 50,
      progress: Math.min(totalPlays, 50),
      target: 50,
    },
    {
      id: "century-club",
      title: "Century Club",
      description: "Play 100 songs",
      icon: "star",
      unlocked: totalPlays >= 100,
      progress: Math.min(totalPlays, 100),
      target: 100,
    },
    {
      id: "dedicated-listener",
      title: "Dedicated Listener",
      description: "Play 200 songs",
      icon: "headphones",
      unlocked: totalPlays >= 200,
      progress: Math.min(totalPlays, 200),
      target: 200,
    },
    {
      id: "music-machine",
      title: "Music Machine",
      description: "Play 500 songs",
      icon: "zap",
      unlocked: totalPlays >= 500,
      progress: Math.min(totalPlays, 500),
      target: 500,
    },
    {
      id: "artist-discoverer",
      title: "Artist Discoverer",
      description: "Listen to 20 unique artists",
      icon: "users",
      unlocked: uniqueArtists.size >= 20,
      progress: Math.min(uniqueArtists.size, 20),
      target: 20,
    },
    {
      id: "artist-connoisseur",
      title: "Artist Connoisseur",
      description: "Listen to 50 unique artists",
      icon: "globe",
      unlocked: uniqueArtists.size >= 50,
      progress: Math.min(uniqueArtists.size, 50),
      target: 50,
    },
    {
      id: "genre-adventurer",
      title: "Genre Adventurer",
      description: "Explore 5 or more genres",
      icon: "palette",
      unlocked: uniqueGenres.size >= 5,
      progress: Math.min(uniqueGenres.size, 5),
      target: 5,
    },
    {
      id: "genre-explorer",
      title: "Genre Explorer",
      description: "Explore 10 or more genres",
      icon: "compass",
      unlocked: uniqueGenres.size >= 10,
      progress: Math.min(uniqueGenres.size, 10),
      target: 10,
    },
    {
      id: "album-collector",
      title: "Album Collector",
      description: "Save 10 or more albums",
      icon: "disc",
      unlocked: albumCount >= 10,
      progress: Math.min(albumCount, 10),
      target: 10,
    },
    {
      id: "artist-fan",
      title: "Artist Fan",
      description: "Save 10 or more artists",
      icon: "heart",
      unlocked: artistCount >= 10,
      progress: Math.min(artistCount, 10),
      target: 10,
    },
    {
      id: "night-owl",
      title: "Night Owl",
      description: "Listen to 50 songs at night (10PM-5AM)",
      icon: "moon",
      unlocked: nightListens >= 50,
      progress: Math.min(nightListens, 50),
      target: 50,
    },
    {
      id: "early-bird",
      title: "Early Bird",
      description: "Listen to 30 songs in the early morning (5AM-8AM)",
      icon: "sun",
      unlocked: earlyBirdListens >= 30,
      progress: Math.min(earlyBirdListens, 30),
      target: 30,
    },
    {
      id: "streak-starter",
      title: "Streak Starter",
      description: "Maintain a 3-day listening streak",
      icon: "flame",
      unlocked: streak.longest >= 3,
      progress: Math.min(streak.longest, 3),
      target: 3,
    },
    {
      id: "streak-master",
      title: "Streak Master",
      description: "Maintain a 7-day listening streak",
      icon: "flame",
      unlocked: streak.longest >= 7,
      progress: Math.min(streak.longest, 7),
      target: 7,
    },
    {
      id: "streak-legend",
      title: "Streak Legend",
      description: "Maintain a 30-day listening streak",
      icon: "trophy",
      unlocked: streak.longest >= 30,
      progress: Math.min(streak.longest, 30),
      target: 30,
    },
    {
      id: "repeat-lover",
      title: "Repeat Lover",
      description: "Play 5 songs at least 5 times each",
      icon: "music",
      unlocked: repeatFavorites >= 5,
      progress: Math.min(repeatFavorites, 5),
      target: 5,
    },
    {
      id: "song-variety",
      title: "Song Variety",
      description: "Listen to 100 unique songs",
      icon: "music",
      unlocked: uniqueSongs.size >= 100,
      progress: Math.min(uniqueSongs.size, 100),
      target: 100,
    },
    {
      id: "marathon-listener",
      title: "Marathon Listener",
      description: "Accumulate 24 hours of listening",
      icon: "headphones",
      unlocked: totalHours >= 24,
      progress: Math.min(Math.round(totalHours), 24),
      target: 24,
    },
    {
      id: "super-fan",
      title: "Super Fan",
      description: "Add 20 favorites",
      icon: "heart",
      unlocked: favCount >= 20,
      progress: Math.min(favCount, 20),
      target: 20,
    },
  ];
}

function AchievementCard({ achievement }: { achievement: AchievementType }) {
  const progressPercent = Math.min(
    Math.round((achievement.progress / achievement.target) * 100),
    100
  );

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 transition-premium ${
        achievement.unlocked
          ? "glass-heavy border border-amber-400/30 shadow-amber-400/10 shadow-lg"
          : "glass-subtle opacity-70"
      }`}
    >
      {/* Unlock shimmer effect */}
      {achievement.unlocked && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent"
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className={`shrink-0 rounded-lg p-2 ${
            achievement.unlocked
              ? "bg-amber-400/20 text-amber-400"
              : "bg-foreground/5 text-muted"
          }`}
          aria-hidden="true"
        >
          {ICON_MAP[achievement.icon] || <Trophy className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {achievement.title}
            </p>
            {achievement.unlocked && (
              <span className="shrink-0 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                Unlocked
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">
            {achievement.description}
          </p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-muted mb-1">
              <span>
                {achievement.progress}/{achievement.target}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  achievement.unlocked ? "bg-amber-400" : "bg-foreground/40"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Achievements({
  history,
  favCount,
  artistCount,
  albumCount,
}: AchievementsProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const achievements = useMemo(
    () =>
      computeComprehensiveAchievements(
        history,
        favCount,
        artistCount,
        albumCount,
        now
      ),
    [history, favCount, artistCount, albumCount, now]
  );

  // Persist earned badges to localStorage
  useEffect(() => {
    const earned = new Set(
      achievements.filter((a) => a.unlocked).map((a) => a.id)
    );
    const stored = loadEarnedBadges();
    // Only save if there are new badges
    let hasNew = false;
    for (const badge of earned) {
      if (!stored.has(badge)) {
        hasNew = true;
        break;
      }
    }
    if (hasNew) {
      // Merge with existing (keep old badges even if un-earned now due to data change)
      const merged = new Set([...stored, ...earned]);
      saveEarnedBadges(merged);
    }
  }, [achievements]);

  if (achievements.length === 0) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <section aria-label="Achievements" className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">Achievements</h3>
        <span className="ml-auto text-xs text-muted">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>

      {/* Progress overview */}
      <div className="rounded-xl glass-light p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">Overall Progress</span>
          <span className="text-xs font-medium text-foreground">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700"
            style={{
              width: `${(unlockedCount / achievements.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </section>
  );
}

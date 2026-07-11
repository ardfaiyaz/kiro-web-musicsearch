"use client";

import { useMemo, useSyncExternalStore } from "react";
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
} from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";
import { computeAchievements, type Achievement as AchievementType } from "@/lib/analytics";

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

const ICON_MAP: Record<string, React.ReactNode> = {
  play: <Play className="h-5 w-5" />,
  compass: <Compass className="h-5 w-5" />,
  headphones: <Headphones className="h-5 w-5" />,
  palette: <Palette className="h-5 w-5" />,
  disc: <Disc3 className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  moon: <Moon className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
};

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
      computeAchievements(history, favCount, artistCount, albumCount, now),
    [history, favCount, artistCount, albumCount, now]
  );

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </section>
  );
}

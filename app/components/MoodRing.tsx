"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getListeningHistory, type HistoryEntry } from "@/lib/personalization";

function subscribeNoop() {
  return () => {};
}

function getClientHistory(): HistoryEntry[] {
  return getListeningHistory();
}

const emptyHistory: HistoryEntry[] = [];

function getServerHistory(): HistoryEntry[] {
  return emptyHistory;
}

type Mood = "energetic" | "chill" | "happy" | "sad" | "neutral";

interface MoodConfig {
  color: string;
  gradient: string;
  label: string;
  shadowColor: string;
}

const MOOD_MAP: Record<Mood, MoodConfig> = {
  energetic: {
    color: "#ef4444",
    gradient: "from-red-500 via-orange-500 to-yellow-500",
    label: "Energetic",
    shadowColor: "rgba(239, 68, 68, 0.4)",
  },
  chill: {
    color: "#3b82f6",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    label: "Chill",
    shadowColor: "rgba(59, 130, 246, 0.4)",
  },
  happy: {
    color: "#eab308",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    label: "Happy",
    shadowColor: "rgba(234, 179, 8, 0.4)",
  },
  sad: {
    color: "#8b5cf6",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    label: "Melancholic",
    shadowColor: "rgba(139, 92, 246, 0.4)",
  },
  neutral: {
    color: "#6b7280",
    gradient: "from-gray-400 via-slate-500 to-gray-600",
    label: "Neutral",
    shadowColor: "rgba(107, 114, 128, 0.3)",
  },
};

// Genre to mood mapping
const GENRE_MOOD_MAP: Record<string, Mood> = {
  // Energetic genres
  "rock": "energetic",
  "metal": "energetic",
  "punk": "energetic",
  "hard rock": "energetic",
  "dance": "energetic",
  "edm": "energetic",
  "hip-hop/rap": "energetic",
  "hip-hop": "energetic",
  "rap": "energetic",
  // Chill genres
  "ambient": "chill",
  "lo-fi": "chill",
  "chillwave": "chill",
  "jazz": "chill",
  "bossa nova": "chill",
  "new age": "chill",
  "downtempo": "chill",
  "electronic": "chill",
  // Happy genres
  "pop": "happy",
  "funk": "happy",
  "disco": "happy",
  "reggae": "happy",
  "ska": "happy",
  "latin": "happy",
  "k-pop": "happy",
  "dance pop": "happy",
  // Sad genres
  "blues": "sad",
  "folk": "sad",
  "singer/songwriter": "sad",
  "classical": "sad",
  "emo": "sad",
  "indie": "sad",
  "alternative": "sad",
  "soul": "sad",
  "r&b": "sad",
  // Country can go either way
  "country": "happy",
};

function deriveMood(history: HistoryEntry[]): Mood {
  if (history.length === 0) return "neutral";

  // Only look at recent history (last 10 tracks)
  const recent = history.slice(0, 10);
  const moodScores: Record<Mood, number> = {
    energetic: 0,
    chill: 0,
    happy: 0,
    sad: 0,
    neutral: 0,
  };

  recent.forEach((entry) => {
    const genre = entry.primaryGenreName?.toLowerCase() || "";
    const mood = GENRE_MOOD_MAP[genre] || "neutral";
    // Weight more recent tracks higher
    moodScores[mood] += 1;
  });

  // Find dominant mood
  let maxMood: Mood = "neutral";
  let maxScore = 0;
  for (const [mood, score] of Object.entries(moodScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxMood = mood as Mood;
    }
  }

  return maxMood;
}

export default function MoodRing() {
  const history = useSyncExternalStore(subscribeNoop, getClientHistory, getServerHistory);

  const mood = useMemo(() => deriveMood(history), [history]);
  const config = MOOD_MAP[mood];
  const mounted = history !== emptyHistory || typeof window !== "undefined";

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="h-24 w-24 rounded-full shimmer-wave" />
        <div className="h-4 w-20 rounded shimmer-wave" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3" aria-label={`Musical mood ring: ${config.label}`}>
      {/* Animated ring */}
      <div className="relative">
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full blur-md animate-pulse"
          style={{ backgroundColor: config.shadowColor }}
          aria-hidden="true"
        />

        {/* Ring */}
        <div className={`relative h-24 w-24 rounded-full bg-gradient-to-br ${config.gradient} p-1 sm:h-28 sm:w-28`}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
            <div className={`h-16 w-16 rounded-full bg-gradient-to-tr ${config.gradient} opacity-30 animate-spin sm:h-20 sm:w-20`} style={{ animationDuration: "8s" }} aria-hidden="true" />
          </div>
        </div>

        {/* Pulse effect */}
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: config.color, animationDuration: "3s" }}
          aria-hidden="true"
        />
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{config.label}</p>
        <p className="text-xs text-muted">
          {history.length > 0 ? "Based on recent listening" : "Start listening to see your mood"}
        </p>
      </div>
    </div>
  );
}

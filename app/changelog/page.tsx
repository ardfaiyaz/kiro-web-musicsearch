"use client";

import Link from "next/link";
import {
  Music,
  Search,
  Smartphone,
  Palette,
  BarChart3,
  Library,
  Users,
  Zap,
  Accessibility,
  Gamepad2,
  Code,
  ChevronLeft,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface FeatureCategory {
  id: string;
  title: string;
  icon: typeof Music;
  range: string;
  features: string[];
}

const CATEGORIES: FeatureCategory[] = [
  {
    id: "music-experience",
    title: "Music Experience",
    icon: Music,
    range: "1-10",
    features: [
      "30-second audio previews with visualizer",
      "Queue management and up-next list",
      "Crossfade between tracks",
      "Sleep timer for playback",
      "Playback speed control",
      "Equalizer with presets",
      "Lyrics display synced to playback",
      "Mini player with album art",
      "Full-screen immersive player mode",
      "Cassette retro player theme",
    ],
  },
  {
    id: "search-discovery",
    title: "Search & Discovery",
    icon: Search,
    range: "11-20",
    features: [
      "Autocomplete search suggestions",
      "Advanced filters (genre, year, explicit)",
      "Search history and recent queries",
      "Trending tracks section",
      "Artist radio - similar songs",
      "Genre explorer with visual map",
      "Mood-based playlists",
      "Release radar for new music",
      "AI-powered recommendations",
      "Similar artist graph/network",
    ],
  },
  {
    id: "mobile-touch",
    title: "Mobile & Touch",
    icon: Smartphone,
    range: "21-30",
    features: [
      "Swipe gestures for navigation",
      "Pull-to-refresh on lists",
      "Haptic feedback on actions",
      "Bottom sheet for track details",
      "Pinch-to-zoom album art",
      "Shake to shuffle",
      "Mobile-optimized landscape player",
      "Swipe-to-favorite tracks",
      "Touch-friendly large tap targets",
      "Mobile bottom navigation bar",
    ],
  },
  {
    id: "visual-animation",
    title: "Visual & Animation",
    icon: Palette,
    range: "31-40",
    features: [
      "Dynamic color extraction from album art",
      "Ambient background effects",
      "Smooth page transitions",
      "Skeleton loading states",
      "Particle effects on interactions",
      "Parallax scrolling effects",
      "Staggered grid animations",
      "Text reveal animations",
      "3D card tilt effects",
      "Custom cursor effects",
    ],
  },
  {
    id: "analytics-insights",
    title: "Analytics & Insights",
    icon: BarChart3,
    range: "41-50",
    features: [
      "Listening history dashboard",
      "Top artists/tracks statistics",
      "Listening time heatmap",
      "Genre distribution chart",
      "Discovery score and streak",
      "Weekly listening report",
      "Mood tracking based on plays",
      "Personal music taste profile",
      "Year-in-review summary",
      "Listening milestones and achievements",
    ],
  },
  {
    id: "organization-library",
    title: "Organization & Library",
    icon: Library,
    range: "51-60",
    features: [
      "Create custom playlists",
      "Playlist collaboration invites",
      "Smart playlists with auto-rules",
      "Drag-and-drop playlist reordering",
      "Folder organization for playlists",
      "Tag system for tracks",
      "Bulk actions on selections",
      "Import/export playlists",
      "Duplicate detection and cleanup",
      "Collection statistics overview",
    ],
  },
  {
    id: "social-sharing",
    title: "Social & Sharing",
    icon: Users,
    range: "61-70",
    features: [
      "Share tracks via link/social media",
      "Collaborative listening sessions",
      "Music taste matching",
      "Activity feed of friends",
      "Comment and rate tracks",
      "Create public profiles",
      "Follow other users",
      "Shared playlist editing",
      "Music recommendations from friends",
      "Social listening stats comparison",
    ],
  },
  {
    id: "performance-technical",
    title: "Performance & Technical",
    icon: Zap,
    range: "71-80",
    features: [
      "Service Worker for offline caching",
      "Virtual scrolling for long lists",
      "Image lazy loading with blur-up",
      "Prefetching for instant navigation",
      "IndexedDB for large data storage",
      "Web Worker for heavy computations",
      "Optimistic UI updates",
      "Request deduplication and batching",
      "Memory-efficient infinite scroll",
      "Bundle size optimization",
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    icon: Accessibility,
    range: "81-90",
    features: [
      "Full keyboard navigation support",
      "Screen reader announcements",
      "High contrast mode",
      "Focus mode for reduced distractions",
      "Voice navigation commands",
      "Adjustable font sizes",
      "Color blind friendly palette",
      "Skip navigation links",
      "ARIA labels and landmarks",
      "Reduced motion preferences",
    ],
  },
  {
    id: "fun-engagement",
    title: "Fun & Engagement",
    icon: Gamepad2,
    range: "91-100",
    features: [
      "Easter eggs and hidden features",
      "Music trivia game mode",
      "Achievement badges system",
      "Daily music challenges",
      "Streak tracking for logins",
      "Confetti celebrations on milestones",
      "Custom themes and skins",
      "Sound effects for interactions",
      "Mini music quiz",
      "Seasonal holiday themes",
    ],
  },
  {
    id: "developer-meta",
    title: "Developer & Meta",
    icon: Code,
    range: "101-110",
    features: [
      "Changelog page with version history",
      "Feature flags for experimental toggles",
      "Debug mode with API metrics",
      "Component playground/showcase",
      "Onboarding flow for new users",
      "Feedback widget for user input",
      "Keyboard shortcuts cheat sheet",
      "API status indicator in footer",
      "Performance dashboard with Web Vitals",
      "PWA install prompt banner",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Header showBack />
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="flex items-center gap-1 text-muted transition-premium hover:text-foreground sm:hidden"
              aria-label="Back to home"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Changelog
            </h1>
          </div>
          <p className="text-sm text-muted">
            Version history and all 110 features shipped in this release.
          </p>
        </div>

        {/* Version Entry */}
        <article className="mb-10">
          <header className="mb-6 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              v1.0.0
            </span>
            <time
              dateTime="2025-01-15"
              className="text-sm text-muted"
            >
              January 2025
            </time>
          </header>

          <p className="mb-6 text-sm text-muted">
            Complete music search and discovery platform with 110 features across
            11 categories.
          </p>

          {/* Categories */}
          <div className="space-y-6">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <section
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-border/50 glass-card"
                  aria-labelledby={`cat-${category.id}`}
                >
                  <header className="flex items-center gap-3 px-6 py-4 border-b border-border/30">
                    <Icon
                      size={20}
                      className="text-accent"
                      aria-hidden="true"
                    />
                    <h2
                      id={`cat-${category.id}`}
                      className="text-base font-semibold text-foreground"
                    >
                      {category.title}
                    </h2>
                    <span className="ml-auto text-xs text-muted">
                      Items {category.range}
                    </span>
                  </header>
                  <ol className="divide-y divide-border/20 px-6 py-2">
                    {category.features.map((feature, index) => {
                      const baseNum = parseInt(category.range.split("-")[0]);
                      const featureNum = baseNum + index;
                      return (
                        <li
                          key={index}
                          className="flex items-center gap-3 py-2.5"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-muted">
                            {featureNum}
                          </span>
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}

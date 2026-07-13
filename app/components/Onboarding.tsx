"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, ArrowLeft, Search, Heart, ListMusic, Compass, Play } from "lucide-react";

const STORAGE_KEY = "music-onboarding-complete";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Search;
  position: "top" | "bottom" | "center";
}

const STEPS: OnboardingStep[] = [
  {
    id: "search",
    title: "Search for Music",
    description:
      "Use the search bar or press / to quickly find songs, artists, and albums from the iTunes catalog.",
    icon: Search,
    position: "center",
  },
  {
    id: "favorites",
    title: "Save Your Favorites",
    description:
      "Click the heart icon on any track to save it to your favorites. Access them anytime from the Favorites page.",
    icon: Heart,
    position: "center",
  },
  {
    id: "playlists",
    title: "Create Playlists",
    description:
      "Organize your music into custom playlists. Drag and drop tracks to reorder them.",
    icon: ListMusic,
    position: "center",
  },
  {
    id: "discover",
    title: "Discover New Music",
    description:
      "Explore trending tracks, genre-based recommendations, and AI-powered suggestions on the Discover page.",
    icon: Compass,
    position: "center",
  },
  {
    id: "player",
    title: "Preview & Play",
    description:
      "Click any track to hear a 30-second preview. Use keyboard shortcuts (Space, N, P) for playback control.",
    icon: Play,
    position: "center",
  },
];

export default function Onboarding() {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        // Show onboarding after a brief delay for first-time users
        const timer = setTimeout(() => setActive(true), 2000);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  if (!active) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
    >
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border/50 glass-card p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={completeOnboarding}
          className="absolute right-4 top-4 rounded-md p-1 text-muted transition-colors hover:text-foreground"
          aria-label="Skip tour"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Step content */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <Icon size={32} className="text-accent" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">
            {step.title}
          </h2>
          <p className="mb-6 text-sm text-muted leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="mb-4 flex items-center justify-center gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep
                  ? "w-6 bg-accent"
                  : i < currentStep
                    ? "w-1.5 bg-accent/50"
                    : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-premium hover:text-foreground disabled:opacity-0"
            aria-label="Previous step"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back
          </button>
          <span className="text-xs text-muted" aria-live="polite">
            {currentStep + 1} of {STEPS.length}
          </span>
          <button
            onClick={nextStep}
            className="flex items-center gap-1 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-premium hover:bg-accent/20"
            aria-label={isLast ? "Finish tour" : "Next step"}
          >
            {isLast ? "Get Started" : "Next"}
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

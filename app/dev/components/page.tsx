"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Palette,
  Heart,
  Play,
  Search,
  Music,
  Star,
  Bell,
  Check,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/50 glass-card overflow-hidden">
      <header className="border-b border-border/30 px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function ComponentPlaygroundPage() {
  const [inputValue, setInputValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<"sm" | "md" | "lg">("md");

  return (
    <>
      <Header showBack />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
            <Palette size={24} className="text-accent" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Component Playground
            </h1>
          </div>
          <p className="text-sm text-muted">
            Showcase of all UI components in different states and variations.
          </p>
        </div>

        <div className="space-y-8">
          {/* Buttons */}
          <Section title="Buttons">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-premium hover:opacity-90">
                  Primary
                </button>
                <button className="rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-premium hover:bg-accent/20">
                  Secondary
                </button>
                <button className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-premium hover:bg-surface">
                  Outline
                </button>
                <button className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-premium hover:text-foreground hover:bg-surface">
                  Ghost
                </button>
                <button
                  className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background opacity-50 cursor-not-allowed"
                  disabled
                >
                  Disabled
                </button>
              </div>

              {/* Icon buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-premium hover:opacity-90">
                  <Play size={16} aria-hidden="true" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent transition-premium hover:bg-accent/20">
                  <Heart size={16} aria-hidden="true" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-premium hover:text-foreground hover:bg-surface">
                  <Star size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Sizes */}
              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground text-background">
                  Small
                </button>
                <button className="rounded-xl px-4 py-2.5 text-sm font-medium bg-foreground text-background">
                  Medium
                </button>
                <button className="rounded-xl px-6 py-3 text-base font-medium bg-foreground text-background">
                  Large
                </button>
              </div>
            </div>
          </Section>

          {/* Glass Cards */}
          <Section title="Glass Cards">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-border/50 glass-card p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Music size={20} className="text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Level 1 Card
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Basic glass card with border
                </p>
              </div>
              <div className="glass-elevated rounded-2xl border border-border/50 p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Star size={20} className="text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Level 2 Elevated
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Elevated glass with more blur
                </p>
              </div>
              <div className="glass-subtle rounded-2xl border border-border/50 p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Bell size={20} className="text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Level 3 Subtle
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Subtle glass variant
                </p>
              </div>
            </div>
          </Section>

          {/* Inputs */}
          <Section title="Inputs">
            <div className="space-y-4 max-w-md">
              {/* Text input */}
              <div>
                <label
                  htmlFor="demo-input"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Text Input
                </label>
                <input
                  id="demo-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type something..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              {/* Search input */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              {/* Checkbox */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="h-4 w-4 accent-foreground rounded"
                />
                <span className="text-sm text-foreground">
                  Checkbox option
                </span>
              </label>

              {/* Toggle group */}
              <div>
                <span className="mb-2 block text-sm font-medium text-foreground">
                  Toggle Group
                </span>
                <div className="flex gap-2">
                  {(["sm", "md", "lg"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-premium ${
                        selectedSize === size
                          ? "bg-foreground text-background"
                          : "bg-surface text-muted hover:text-foreground"
                      }`}
                      aria-pressed={selectedSize === size}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Badges */}
          <Section title="Badges & Tags">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Accent
              </span>
              <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
                <Check size={12} className="mr-1" aria-hidden="true" />
                Success
              </span>
              <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500">
                Warning
              </span>
              <span className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500">
                Error
              </span>
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                Outline
              </span>
              <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">
                Default
              </span>
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-foreground">
                Heading 1
              </h1>
              <h2 className="text-2xl font-bold text-foreground">
                Heading 2
              </h2>
              <h3 className="text-xl font-semibold text-foreground">
                Heading 3
              </h3>
              <h4 className="text-lg font-semibold text-foreground">
                Heading 4
              </h4>
              <p className="text-base text-foreground">
                Body text with regular weight. The quick brown fox jumps over
                the lazy dog.
              </p>
              <p className="text-sm text-muted">
                Secondary text in muted color. Smaller font size for supporting
                content.
              </p>
              <p className="text-xs text-muted">
                Caption text. Very small supporting information.
              </p>
              <p className="font-mono text-sm text-foreground">
                Monospace text for code-like content
              </p>
            </div>
          </Section>

          {/* Loading States */}
          <Section title="Loading States">
            <div className="space-y-4">
              {/* Skeleton cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-border/50 p-4"
                  >
                    <div className="mb-3 h-32 rounded-xl bg-surface" />
                    <div className="mb-2 h-4 w-3/4 rounded bg-surface" />
                    <div className="h-3 w-1/2 rounded bg-surface" />
                  </div>
                ))}
              </div>

              {/* Spinner */}
              <div className="flex items-center gap-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
                <span className="text-sm text-muted">Loading...</span>
              </div>
            </div>
          </Section>

          {/* Colors */}
          <Section title="Color Palette">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {[
                { name: "foreground", cls: "bg-foreground" },
                { name: "background", cls: "bg-background border border-border" },
                { name: "muted", cls: "bg-muted" },
                { name: "accent", cls: "bg-accent" },
                { name: "surface", cls: "bg-surface" },
                { name: "border", cls: "bg-border" },
              ].map((color) => (
                <div key={color.name} className="text-center">
                  <div
                    className={`mx-auto h-12 w-12 rounded-xl ${color.cls}`}
                  />
                  <span className="mt-1 block text-xs text-muted">
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
      <Footer />
    </>
  );
}

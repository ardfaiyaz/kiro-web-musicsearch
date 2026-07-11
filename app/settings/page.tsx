"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Play,
  Shield,
  HardDrive,
  Info,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import PlaybackSettings from "../components/settings/PlaybackSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import StorageSettings from "../components/settings/StorageSettings";
import AboutSettings from "../components/settings/AboutSettings";

interface SettingsSection {
  id: string;
  label: string;
  icon: typeof Palette;
  component: React.ComponentType;
}

const SECTIONS: SettingsSection[] = [
  { id: "appearance", label: "Appearance", icon: Palette, component: AppearanceSettings },
  { id: "playback", label: "Playback", icon: Play, component: PlaybackSettings },
  { id: "privacy", label: "Privacy", icon: Shield, component: PrivacySettings },
  { id: "storage", label: "Storage", icon: HardDrive, component: StorageSettings },
  { id: "about", label: "About", icon: Info, component: AboutSettings },
];

export default function SettingsPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["appearance"])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <Header showBack />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
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
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
          </div>
          <p className="text-sm text-muted">
            Customize your music experience
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {SECTIONS.map(({ id, label, icon: Icon, component: Component }) => {
            const isExpanded = expandedSections.has(id);
            return (
              <div
                key={id}
                className="overflow-hidden rounded-2xl border border-border/50 glass-card"
              >
                <button
                  onClick={() => toggleSection(id)}
                  className="flex w-full items-center justify-between px-6 py-4 transition-premium hover:bg-surface-hover/50"
                  aria-expanded={isExpanded}
                  aria-controls={`section-${id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className="text-muted"
                      aria-hidden="true"
                    />
                    <span className="text-base font-semibold text-foreground">
                      {label}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isExpanded && (
                  <div
                    id={`section-${id}`}
                    className="border-t border-border/30 px-6 py-6"
                    role="region"
                    aria-label={`${label} settings`}
                  >
                    <Component />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}

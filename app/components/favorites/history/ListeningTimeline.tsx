"use client";

import { useMemo, useState, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { HistoryEntry } from "@/lib/personalization";

interface ListeningTimelineProps {
  history: HistoryEntry[];
}

type TimeGroup =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "Last Week"
  | "This Month"
  | "Older";

interface GroupedEntries {
  label: TimeGroup;
  entries: HistoryEntry[];
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

function formatRelativeTime(timestamp: number, now: number): string {
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function categorizeByTime(timestamp: number, now: number): TimeGroup {
  const date = new Date(timestamp);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= weekStart) return "This Week";
  if (date >= lastWeekStart) return "Last Week";
  if (date >= monthStart) return "This Month";
  return "Older";
}

export default function ListeningTimeline({ history }: ListeningTimelineProps) {
  const now = useSyncExternalStore(subscribeNoop, getClientNow, getServerNow);

  const groups = useMemo((): GroupedEntries[] => {
    if (now === 0) return [];
    const groupMap = new Map<TimeGroup, HistoryEntry[]>();
    const order: TimeGroup[] = [
      "Today",
      "Yesterday",
      "This Week",
      "Last Week",
      "This Month",
      "Older",
    ];

    for (const entry of history) {
      const category = categorizeByTime(entry.playedAt, now);
      const existing = groupMap.get(category) || [];
      existing.push(entry);
      groupMap.set(category, existing);
    }

    return order
      .filter((label) => groupMap.has(label))
      .map((label) => ({
        label,
        entries: groupMap.get(label) || [],
      }));
  }, [history, now]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<TimeGroup>>(
    new Set()
  );

  const toggleGroup = useCallback((group: TimeGroup) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  if (groups.length === 0) return null;

  return (
    <section aria-label="Listening timeline" className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
      <div className="space-y-2">
        {groups.map((group) => {
          const isCollapsed = collapsedGroups.has(group.label);
          return (
            <div key={group.label} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="sticky top-0 z-10 flex min-h-[44px] w-full items-center gap-2 rounded-xl glass-subtle px-4 py-2 text-sm font-semibold text-foreground transition-premium hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                aria-expanded={!isCollapsed}
                aria-controls={`timeline-group-${group.label.replace(/\s/g, "-")}`}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
                )}
                {group.label}
                <span className="ml-auto text-xs font-normal text-muted">
                  {group.entries.length} {group.entries.length === 1 ? "song" : "songs"}
                </span>
              </button>
              {!isCollapsed && (
                <ul
                  id={`timeline-group-${group.label.replace(/\s/g, "-")}`}
                  className="space-y-1"
                  role="list"
                >
                  {group.entries.map((entry) => (
                    <TimelineItem
                      key={`${entry.trackId}-${entry.playedAt}`}
                      entry={entry}
                      now={now}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TimelineItem({ entry, now }: { entry: HistoryEntry; now: number }) {
  return (
    <li className="flex items-center gap-3 rounded-xl glass-light p-3 transition-premium hover:bg-foreground/5">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={entry.artworkUrl.replace("100x100", "100x100")}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
          unoptimized
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {entry.trackName}
        </p>
        <p className="truncate text-xs text-muted">
          {entry.artistName} &middot; {entry.albumName}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-muted">
          {formatRelativeTime(entry.playedAt, now)}
        </p>
        <p className="text-xs text-muted">{formatDuration(entry.duration)}</p>
      </div>
    </li>
  );
}

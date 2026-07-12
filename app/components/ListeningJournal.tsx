"use client";

import { useState, useCallback } from "react";
import {
  getJournalEntry,
  setJournalEntry,
  JournalEntry,
} from "@/lib/listening-journal";

interface ListeningJournalProps {
  trackId: number;
}

export default function ListeningJournal({ trackId }: ListeningJournalProps) {
  const [entry, setEntry] = useState<JournalEntry | null>(() => {
    if (typeof window === "undefined") return null;
    return getJournalEntry(trackId);
  });
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(() => {
    if (typeof window === "undefined") return "";
    const existing = getJournalEntry(trackId);
    return existing?.note || "";
  });

  const refreshEntry = useCallback(() => {
    const existing = getJournalEntry(trackId);
    setEntry(existing);
    setNoteText(existing?.note || "");
  }, [trackId]);

  function handleSave() {
    setJournalEntry(trackId, noteText);
    refreshEntry();
    setIsEditing(false);
  }

  function handleCancel() {
    setNoteText(entry?.note || "");
    setIsEditing(false);
  }

  return (
    <section className="space-y-3" aria-label="Listening journal">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <svg
            className="h-4 w-4 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          Personal Note
        </h4>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            {entry ? "Edit" : "Add note"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder='Add a personal note... (e.g., "reminds me of summer 2023")'
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
            rows={3}
            autoFocus
            aria-label="Personal note"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-foreground/10 px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg bg-foreground/5 px-4 py-1.5 text-xs text-muted transition-colors hover:bg-foreground/10"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : entry ? (
        <div className="rounded-xl bg-foreground/5 px-4 py-3">
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {entry.note}
          </p>
          <p className="mt-2 text-xs text-muted">
            {new Date(entry.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted">
          No personal note yet. Add your thoughts about this song.
        </p>
      )}
    </section>
  );
}

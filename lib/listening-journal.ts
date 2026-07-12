const JOURNAL_STORAGE_KEY = "music-search-listening-journal";

export interface JournalEntry {
  trackId: number;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export function getJournalEntries(): Record<number, JournalEntry> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveJournal(entries: Record<number, JournalEntry>): void {
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage might be full
  }
}

export function getJournalEntry(trackId: number): JournalEntry | null {
  const entries = getJournalEntries();
  return entries[trackId] || null;
}

export function setJournalEntry(trackId: number, note: string): void {
  if (typeof window === "undefined") return;
  const entries = getJournalEntries();
  const trimmed = note.trim();
  if (!trimmed) {
    delete entries[trackId];
  } else {
    const existing = entries[trackId];
    entries[trackId] = {
      trackId,
      note: trimmed,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  }
  saveJournal(entries);
}

export function deleteJournalEntry(trackId: number): void {
  if (typeof window === "undefined") return;
  const entries = getJournalEntries();
  delete entries[trackId];
  saveJournal(entries);
}

export function getAllJournalEntries(): JournalEntry[] {
  const entries = getJournalEntries();
  return Object.values(entries).sort((a, b) => b.updatedAt - a.updatedAt);
}

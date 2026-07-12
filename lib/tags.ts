const TAGS_STORAGE_KEY = "music-search-tags";

export interface TagMapping {
  [tag: string]: number[];
}

export function getTagMappings(): TagMapping {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveTags(mappings: TagMapping): void {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(mappings));
  } catch {
    // localStorage might be full
  }
}

export function addTagToTrack(tag: string, trackId: number): void {
  if (typeof window === "undefined") return;
  const normalized = tag.startsWith("#") ? tag : `#${tag}`;
  const mappings = getTagMappings();
  if (!mappings[normalized]) {
    mappings[normalized] = [];
  }
  if (!mappings[normalized].includes(trackId)) {
    mappings[normalized].push(trackId);
  }
  saveTags(mappings);
}

export function removeTagFromTrack(tag: string, trackId: number): void {
  if (typeof window === "undefined") return;
  const mappings = getTagMappings();
  if (mappings[tag]) {
    mappings[tag] = mappings[tag].filter((id) => id !== trackId);
    if (mappings[tag].length === 0) {
      delete mappings[tag];
    }
    saveTags(mappings);
  }
}

export function getTagsForTrack(trackId: number): string[] {
  const mappings = getTagMappings();
  const tags: string[] = [];
  for (const [tag, trackIds] of Object.entries(mappings)) {
    if (trackIds.includes(trackId)) {
      tags.push(tag);
    }
  }
  return tags;
}

export function getAllTags(): string[] {
  const mappings = getTagMappings();
  return Object.keys(mappings);
}

export function getTrackIdsByTag(tag: string): number[] {
  const mappings = getTagMappings();
  return mappings[tag] || [];
}

export function deleteTag(tag: string): void {
  if (typeof window === "undefined") return;
  const mappings = getTagMappings();
  delete mappings[tag];
  saveTags(mappings);
}

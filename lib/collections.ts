const COLLECTIONS_KEY = "music-search-collections";

export interface CollectionItem {
  type: "track" | "artist" | "album";
  id: number;
  name: string;
  subtitle: string;
  artworkUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
  createdAt: number;
}

export function getCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function createCollection(name: string, description: string): Collection {
  const collection: Collection = {
    id: `collection-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    description,
    items: [],
    createdAt: Date.now(),
  };
  const collections = getCollections();
  collections.push(collection);
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      // Storage quota exceeded - silently fail
    }
  }
  return collection;
}

export function deleteCollection(collectionId: string): void {
  if (typeof window === "undefined") return;
  const collections = getCollections();
  const updated = collections.filter((c) => c.id !== collectionId);
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      // Storage quota exceeded - silently fail
    }
  }
}

export function addItemToCollection(collectionId: string, item: CollectionItem): void {
  if (typeof window === "undefined") return;
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return;
  if (collection.items.some((i) => i.id === item.id && i.type === item.type)) return;
  collection.items.push(item);
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      // Storage quota exceeded - silently fail
    }
  }
}

export function removeItemFromCollection(collectionId: string, itemId: number, itemType: string): void {
  if (typeof window === "undefined") return;
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return;
  collection.items = collection.items.filter((i) => !(i.id === itemId && i.type === itemType));
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      // Storage quota exceeded - silently fail
    }
  }
}

export const COLLECTIONS_STORAGE_KEY = COLLECTIONS_KEY;

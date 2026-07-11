export const COLLECTIONS_STORAGE_KEY = "music-search-collections";

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
  updatedAt?: number;
  coverStyle?: "single" | "grid2x2" | "grid3x3" | "gradient";
  accentColor?: string;
}

export interface CollectionStatistics {
  songs: number;
  albums: number;
  artists: number;
  genres: string[];
  estimatedDuration: number;
}

export function getCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCollections(collections: Collection[]): void {
  try {
    localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      // Storage quota exceeded - silently fail
    }
  }
}

export function createCollection(
  name: string,
  description: string
): Collection {
  const now = Date.now();
  const collection: Collection = {
    id: `collection-${now}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    description,
    items: [],
    createdAt: now,
    updatedAt: now,
    coverStyle: "gradient",
  };
  const collections = getCollections();
  collections.push(collection);
  saveCollections(collections);
  return collection;
}

export function deleteCollection(collectionId: string): void {
  if (typeof window === "undefined") return;
  const collections = getCollections();
  const updated = collections.filter((c) => c.id !== collectionId);
  saveCollections(updated);
}

export function addItemToCollection(
  collectionId: string,
  item: CollectionItem
): void {
  if (typeof window === "undefined") return;
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return;
  if (collection.items.some((i) => i.id === item.id && i.type === item.type))
    return;
  collection.items.push(item);
  collection.updatedAt = Date.now();
  saveCollections(collections);
}

export function removeItemFromCollection(
  collectionId: string,
  itemId: number,
  itemType: string
): void {
  if (typeof window === "undefined") return;
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return;
  collection.items = collection.items.filter(
    (i) => !(i.id === itemId && i.type === itemType)
  );
  collection.updatedAt = Date.now();
  saveCollections(collections);
}

export function duplicateCollection(collectionId: string): Collection | null {
  if (typeof window === "undefined") return null;
  const collections = getCollections();
  const source = collections.find((c) => c.id === collectionId);
  if (!source) return null;
  const now = Date.now();
  const copy: Collection = {
    ...source,
    id: `collection-${now}-${Math.random().toString(36).slice(2, 9)}`,
    name: `${source.name} (Copy)`,
    items: [...source.items],
    createdAt: now,
    updatedAt: now,
  };
  collections.push(copy);
  saveCollections(collections);
  return copy;
}

export function reorderCollectionItems(
  collectionId: string,
  fromIndex: number,
  toIndex: number
): void {
  if (typeof window === "undefined") return;
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return;
  if (
    fromIndex < 0 ||
    fromIndex >= collection.items.length ||
    toIndex < 0 ||
    toIndex >= collection.items.length
  )
    return;
  const [item] = collection.items.splice(fromIndex, 1);
  collection.items.splice(toIndex, 0, item);
  collection.updatedAt = Date.now();
  saveCollections(collections);
}

export function updateCollection(
  collectionId: string,
  updates: Partial<Pick<Collection, "name" | "description" | "coverStyle" | "accentColor">>
): void {
  if (typeof window === "undefined") return;
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return;
  if (updates.name !== undefined) collection.name = updates.name;
  if (updates.description !== undefined)
    collection.description = updates.description;
  if (updates.coverStyle !== undefined)
    collection.coverStyle = updates.coverStyle;
  if (updates.accentColor !== undefined)
    collection.accentColor = updates.accentColor;
  collection.updatedAt = Date.now();
  saveCollections(collections);
}

export function getCollectionStatistics(
  collection: Collection
): CollectionStatistics {
  const songs = collection.items.filter((i) => i.type === "track").length;
  const albums = collection.items.filter((i) => i.type === "album").length;
  const artists = collection.items.filter((i) => i.type === "artist").length;
  const genres = Array.from(
    new Set(collection.items.map((i) => i.subtitle).filter(Boolean))
  );
  // Estimate: songs ~3.5min, albums ~40min, artists ~0
  const estimatedDuration = songs * 3.5 + albums * 40;
  return { songs, albums, artists, genres, estimatedDuration };
}

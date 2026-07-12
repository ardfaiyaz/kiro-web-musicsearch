const FOLDERS_STORAGE_KEY = "music-search-playlist-folders";

export interface PlaylistFolder {
  id: string;
  name: string;
  playlistIds: string[];
  createdAt: number;
}

export function getPlaylistFolders(): PlaylistFolder[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FOLDERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFolders(folders: PlaylistFolder[]): void {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch {
    // localStorage might be full
  }
}

export function createPlaylistFolder(name: string): PlaylistFolder {
  const folder: PlaylistFolder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    playlistIds: [],
    createdAt: Date.now(),
  };
  const folders = getPlaylistFolders();
  folders.push(folder);
  saveFolders(folders);
  return folder;
}

export function deletePlaylistFolder(folderId: string): void {
  if (typeof window === "undefined") return;
  const folders = getPlaylistFolders();
  const updated = folders.filter((f) => f.id !== folderId);
  saveFolders(updated);
}

export function addPlaylistToFolder(
  folderId: string,
  playlistId: string
): void {
  if (typeof window === "undefined") return;
  const folders = getPlaylistFolders();
  // Remove from any existing folder first
  for (const folder of folders) {
    folder.playlistIds = folder.playlistIds.filter((id) => id !== playlistId);
  }
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return;
  folder.playlistIds.push(playlistId);
  saveFolders(folders);
}

export function removePlaylistFromFolder(
  folderId: string,
  playlistId: string
): void {
  if (typeof window === "undefined") return;
  const folders = getPlaylistFolders();
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return;
  folder.playlistIds = folder.playlistIds.filter((id) => id !== playlistId);
  saveFolders(folders);
}

export function getPlaylistFolderId(playlistId: string): string | null {
  const folders = getPlaylistFolders();
  for (const folder of folders) {
    if (folder.playlistIds.includes(playlistId)) {
      return folder.id;
    }
  }
  return null;
}

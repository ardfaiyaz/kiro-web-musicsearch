"use client";

import { useState, useCallback, useRef, useSyncExternalStore, FormEvent } from "react";
import {
  getCollections,
  createCollection,
  deleteCollection,
  Collection,
  COLLECTIONS_STORAGE_KEY,
} from "@/lib/collections";

const emptyCollections: Collection[] = [];

export default function CollectionsManager() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const listenersRef = useRef(new Set<() => void>());
  const snapshotRef = useRef<Collection[]>(emptyCollections);

  const notify = useCallback(() => {
    snapshotRef.current = getCollections();
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const subscribe = useCallback(
    (listener: () => void) => {
      listenersRef.current.add(listener);
      snapshotRef.current = getCollections();

      const handleStorage = (event: StorageEvent) => {
        if (event.key === COLLECTIONS_STORAGE_KEY) {
          notify();
        }
      };
      window.addEventListener("storage", handleStorage);

      return () => {
        listenersRef.current.delete(listener);
        window.removeEventListener("storage", handleStorage);
      };
    },
    [notify]
  );

  const getSnapshot = useCallback(() => snapshotRef.current, []);
  const getServerSnapshot = useCallback(() => emptyCollections, []);

  const collections = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    createCollection(trimmedName, newDescription.trim());
    setNewName("");
    setNewDescription("");
    setShowCreateModal(false);
    notify();
  }

  function handleDelete(collectionId: string) {
    setPendingDeleteId(collectionId);
  }

  function confirmDelete() {
    if (pendingDeleteId) {
      deleteCollection(pendingDeleteId);
      notify();
      setPendingDeleteId(null);
    }
  }

  function cancelDelete() {
    setPendingDeleteId(null);
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div>
      {/* Create button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:bg-foreground/80"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          New Collection
        </button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground/5">
            <svg
              className="h-10 w-10 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No collections yet
          </h3>
          <p className="max-w-sm text-sm text-muted">
            Create a collection to organize your favorite tracks, artists, and
            albums together.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="glass-card flex flex-col gap-3 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 overflow-hidden">
                  <h4 className="truncate text-base font-bold text-foreground">
                    {collection.name}
                  </h4>
                  {collection.description && (
                    <p className="mt-1 truncate text-xs text-muted">
                      {collection.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(collection.id)}
                  className="ml-2 shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                  aria-label={`Delete collection ${collection.name}`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  {collection.items.length}{" "}
                  {collection.items.length === 1 ? "item" : "items"}
                </span>
                <span>{formatDate(collection.createdAt)}</span>
              </div>
              {collection.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {collection.items.slice(0, 3).map((item) => (
                    <span
                      key={`${item.type}-${item.id}`}
                      className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-muted"
                    >
                      {item.type === "track" && "🎵"}
                      {item.type === "artist" && "🎤"}
                      {item.type === "album" && "💿"}
                      <span className="ml-1 truncate max-w-[80px]">
                        {item.name}
                      </span>
                    </span>
                  ))}
                  {collection.items.length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-muted">
                      +{collection.items.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create new collection"
        >
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md glass-dialog p-6 animate-scale-in">
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Create New Collection
            </h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="collection-name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="collection-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Collection"
                  maxLength={100}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="collection-description"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Description (optional)
                </label>
                <input
                  id="collection-description"
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="A brief description..."
                  maxLength={200}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/80 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm deletion"
        >
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={cancelDelete}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm glass-dialog p-6 animate-scale-in">
            <h3 className="mb-2 text-lg font-bold text-foreground">
              Delete Collection
            </h3>
            <p className="mb-6 text-sm text-muted">
              Are you sure you want to delete this collection? This action cannot
              be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

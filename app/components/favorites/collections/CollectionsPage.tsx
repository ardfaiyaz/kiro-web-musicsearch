"use client";

import { useState, useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { Upload } from "lucide-react";
import {
  getCollections,
  createCollection,
  deleteCollection,
  duplicateCollection,
  updateCollection,
  addItemToCollection,
  type Collection,
  type CollectionItem,
} from "@/lib/collections";
import CollectionHero from "./CollectionHero";
import CollectionGallery from "./CollectionGallery";
import CollectionDetails from "./CollectionDetails";
import CollectionEditor from "./CollectionEditor";
import CollectionSearch from "./CollectionSearch";
import CollectionFilters, { type CollectionFilterOption } from "./CollectionFilters";
import CollectionSorting, { type CollectionSortOption } from "./CollectionSorting";
import CollectionStatistics from "./CollectionStatistics";
import CollectionRecommendations from "./CollectionRecommendations";
import SmartCollections from "./SmartCollections";
import CollectionsSkeleton from "./CollectionsSkeleton";
import EmptyCollections from "./EmptyCollections";

function subscribeNoop() {
  return () => {};
}

type ViewState = "gallery" | "detail";

export default function CollectionsPage() {
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const [collections, setCollections] = useState<Collection[]>(() =>
    getCollections()
  );
  const [view, setView] = useState<ViewState>("gallery");
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<Collection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<CollectionFilterOption>("all");
  const [sort, setSort] = useState<CollectionSortOption>("recently-updated");
  const searchRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshCollections = useCallback(() => {
    setCollections(getCollections());
  }, []);

  // Handle create
  const handleCreate = useCallback(() => {
    setEditingCollection(null);
    setEditorOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((collection: Collection) => {
    setEditingCollection(collection);
    setEditorOpen(true);
  }, []);

  // Handle save from editor
  const handleEditorSave = useCallback(
    (data: {
      name: string;
      description: string;
      coverStyle: Collection["coverStyle"];
    }) => {
      if (editingCollection) {
        updateCollection(editingCollection.id, data);
      } else {
        createCollection(data.name, data.description);
        // Update cover style on newly created collection
        const updated = getCollections();
        const newest = updated[updated.length - 1];
        if (newest && data.coverStyle) {
          updateCollection(newest.id, { coverStyle: data.coverStyle });
        }
      }
      refreshCollections();
      setEditorOpen(false);
      setEditingCollection(null);
    },
    [editingCollection, refreshCollections]
  );

  // Handle delete
  const handleDelete = useCallback(
    (collection: Collection) => {
      deleteCollection(collection.id);
      refreshCollections();
      if (selectedCollection?.id === collection.id) {
        setView("gallery");
        setSelectedCollection(null);
      }
    },
    [selectedCollection, refreshCollections]
  );

  // Handle duplicate
  const handleDuplicate = useCallback(
    (collection: Collection) => {
      duplicateCollection(collection.id);
      refreshCollections();
    },
    [refreshCollections]
  );

  // Handle open
  const handleOpen = useCallback((collection: Collection) => {
    setSelectedCollection(collection);
    setView("detail");
  }, []);

  // Handle open virtual (smart collection)
  const handleOpenVirtual = useCallback((collection: Collection) => {
    setSelectedCollection(collection);
    setView("detail");
  }, []);

  // Handle back from detail
  const handleBack = useCallback(() => {
    setView("gallery");
    setSelectedCollection(null);
    refreshCollections();
  }, [refreshCollections]);

  // Handle refresh detail view
  const handleDetailRefresh = useCallback(() => {
    const updated = getCollections();
    if (selectedCollection) {
      const found = updated.find((c) => c.id === selectedCollection.id);
      if (found) setSelectedCollection(found);
    }
    setCollections(updated);
  }, [selectedCollection]);

  // Handle add recommendation to collection
  const handleAddToCollection = useCallback(
    (item: CollectionItem, collectionId: string) => {
      addItemToCollection(collectionId, item);
      refreshCollections();
    },
    [refreshCollections]
  );

  // Handle search focus
  const handleSearchFocus = useCallback(() => {
    searchRef.current?.querySelector("input")?.focus();
  }, []);

  // Handle import
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data && typeof data.name === "string") {
            const created = createCollection(
              data.name,
              data.description || ""
            );
            // Add items if present
            if (Array.isArray(data.items)) {
              for (const item of data.items) {
                if (item && item.type && item.id && item.name) {
                  addItemToCollection(created.id, {
                    type: item.type,
                    id: item.id,
                    name: item.name,
                    subtitle: item.subtitle || "",
                    artworkUrl: item.artworkUrl,
                  });
                }
              }
            }
            if (data.coverStyle) {
              updateCollection(created.id, { coverStyle: data.coverStyle });
            }
            refreshCollections();
          }
        } catch {
          // Invalid JSON - silently ignore
        }
      };
      reader.readAsText(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [refreshCollections]
  );

  // Filter and sort collections
  const processedCollections = useMemo(() => {
    let result = [...collections];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.items.some(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.subtitle.toLowerCase().includes(q)
          )
      );
    }

    // Filter
    switch (filter) {
      case "largest":
        result.sort((a, b) => b.items.length - a.items.length);
        break;
      case "smallest":
        result.sort((a, b) => a.items.length - b.items.length);
        break;
      case "recently-updated":
        result.sort(
          (a, b) =>
            (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
        );
        break;
      case "recently-created":
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        break;
    }

    // Sort (if filter is "all")
    if (filter === "all") {
      switch (sort) {
        case "recently-updated":
          result.sort(
            (a, b) =>
              (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
          );
          break;
        case "recently-created":
          result.sort((a, b) => b.createdAt - a.createdAt);
          break;
        case "alphabetical":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "item-count":
          result.sort((a, b) => b.items.length - a.items.length);
          break;
      }
    }

    return result;
  }, [collections, searchQuery, filter, sort]);

  // Loading skeleton
  if (!hydrated) {
    return <CollectionsSkeleton />;
  }

  // Detail view
  if (view === "detail" && selectedCollection) {
    return (
      <CollectionDetails
        collection={selectedCollection}
        onBack={handleBack}
        onEdit={handleEdit}
        onRefresh={handleDetailRefresh}
      />
    );
  }

  // Empty state
  if (collections.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <SmartCollections onOpenVirtual={handleOpenVirtual} />
        <EmptyCollections onCreateClick={handleCreate} />
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Gallery view
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <CollectionHero
        collections={collections}
        onCreateClick={handleCreate}
        onSearchFocus={handleSearchFocus}
      />

      {/* Statistics */}
      <CollectionStatistics collections={collections} />

      {/* Smart Collections */}
      <SmartCollections onOpenVirtual={handleOpenVirtual} />

      {/* Search, Filter, Sort bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center" ref={searchRef}>
        <CollectionSearch value={searchQuery} onChange={setSearchQuery} />
        <div className="flex items-center gap-2">
          <CollectionSorting value={sort} onChange={setSort} />
          <button
            type="button"
            onClick={handleImport}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl glass-medium px-3 py-1.5 text-xs font-medium text-foreground transition-premium hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50"
            aria-label="Import collection from JSON"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Import
          </button>
        </div>
      </div>

      {/* Filters */}
      <CollectionFilters active={filter} onChange={setFilter} />

      {/* Gallery */}
      {processedCollections.length > 0 ? (
        <CollectionGallery
          collections={processedCollections}
          onOpen={handleOpen}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl glass-subtle py-12 text-center">
          <p className="text-sm text-muted">
            No collections match your search.
          </p>
        </div>
      )}

      {/* Recommendations */}
      <CollectionRecommendations
        collections={collections}
        onAddToCollection={handleAddToCollection}
      />

      {/* Editor modal */}
      {editorOpen && (
        <CollectionEditor
          collection={editingCollection}
          onSave={handleEditorSave}
          onClose={() => {
            setEditorOpen(false);
            setEditingCollection(null);
          }}
        />
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}

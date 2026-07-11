"use client";

import type { Collection } from "@/lib/collections";
import CollectionCard from "./CollectionCard";

interface CollectionGalleryProps {
  collections: Collection[];
  onOpen: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onDuplicate: (collection: Collection) => void;
}

export default function CollectionGallery({
  collections,
  onOpen,
  onEdit,
  onDelete,
  onDuplicate,
}: CollectionGalleryProps) {
  return (
    <section aria-label="Collection gallery">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>
    </section>
  );
}

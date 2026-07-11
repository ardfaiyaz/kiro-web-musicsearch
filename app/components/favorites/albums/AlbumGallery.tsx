"use client";

import type { ItunesAlbum } from "@/lib/types";
import FavoriteAlbumCard from "./FavoriteAlbumCard";

interface AlbumGalleryProps {
  albums: ItunesAlbum[];
  onRemove: (collectionId: number) => void;
  onShare: (album: ItunesAlbum) => void;
  onClick: (album: ItunesAlbum) => void;
}

export default function AlbumGallery({
  albums,
  onRemove,
  onShare,
  onClick,
}: AlbumGalleryProps) {
  return (
    <section aria-label="Album gallery view">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {albums.map((album) => (
          <FavoriteAlbumCard
            key={album.collectionId}
            album={album}
            onRemove={onRemove}
            onShare={onShare}
            onClick={onClick}
          />
        ))}
      </div>
    </section>
  );
}

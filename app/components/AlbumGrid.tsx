import { ItunesAlbum } from "@/lib/types";
import AlbumCard from "./AlbumCard";

export default function AlbumGrid({ albums }: { albums: ItunesAlbum[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {albums.map((album) => (
        <AlbumCard key={album.collectionId} album={album} />
      ))}
    </div>
  );
}

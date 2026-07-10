import { ItunesArtist } from "@/lib/types";
import ArtistCard from "./ArtistCard";

export default function ArtistGrid({ artists }: { artists: ItunesArtist[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {artists.map((artist) => (
        <ArtistCard key={artist.artistId} artist={artist} />
      ))}
    </div>
  );
}

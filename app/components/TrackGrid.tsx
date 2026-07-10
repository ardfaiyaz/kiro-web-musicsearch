import { ItunesTrack } from "@/lib/types";
import TrackCard from "./TrackCard";

export default function TrackGrid({ tracks }: { tracks: ItunesTrack[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tracks.map((track) => (
        <TrackCard key={track.trackId} track={track} />
      ))}
    </div>
  );
}

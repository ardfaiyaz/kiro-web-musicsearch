"use client";

import { ItunesTrack } from "@/lib/types";
import InfiniteScroll from "./InfiniteScroll";

interface InfiniteScrollResultsProps {
  initialTracks: ItunesTrack[];
  query: string;
  entity?: string;
  genre?: string;
  year?: string;
  explicit?: string;
}

export default function InfiniteScrollResults({
  initialTracks,
  query,
  entity,
  genre,
  year,
  explicit,
}: InfiniteScrollResultsProps) {
  return (
    <InfiniteScroll
      initialTracks={initialTracks}
      query={query}
      entity={entity}
      genre={genre}
      year={year}
      explicit={explicit}
    />
  );
}

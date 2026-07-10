"use client";

import { ItunesTrack } from "@/lib/types";
import InfiniteScroll from "./InfiniteScroll";

interface InfiniteScrollResultsProps {
  initialTracks: ItunesTrack[];
  query: string;
  entity?: string;
}

export default function InfiniteScrollResults({
  initialTracks,
  query,
  entity,
}: InfiniteScrollResultsProps) {
  return (
    <InfiniteScroll
      initialTracks={initialTracks}
      query={query}
      entity={entity}
    />
  );
}

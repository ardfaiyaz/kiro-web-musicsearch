"use client";

import { useEffect, useRef } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";

interface RecentlyViewedTrackerProps {
  type: "artist" | "album";
  id: number;
  name: string;
  artwork: string;
}

export default function RecentlyViewedTracker({
  type,
  id,
  name,
  artwork,
}: RecentlyViewedTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    if (!id || !name) return;
    trackedRef.current = true;
    addRecentlyViewed({ type, id, name, artwork });
  }, [type, id, name, artwork]);

  return null;
}

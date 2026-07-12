"use client";

import StarRating from "./StarRating";
import TagSystem from "./TagSystem";
import ListeningJournal from "./ListeningJournal";

interface TrackOrganizationProps {
  trackId: number;
}

export default function TrackOrganization({ trackId }: TrackOrganizationProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold text-foreground">Your Notes</h3>
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted">Rating</h4>
          <StarRating trackId={trackId} size="lg" />
        </div>
        <TagSystem trackId={trackId} />
        <ListeningJournal trackId={trackId} />
      </div>
    </div>
  );
}

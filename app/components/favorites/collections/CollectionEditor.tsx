"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Collection } from "@/lib/collections";

interface CollectionEditorProps {
  collection?: Collection | null;
  onSave: (data: {
    name: string;
    description: string;
    coverStyle: Collection["coverStyle"];
  }) => void;
  onClose: () => void;
}

const COVER_STYLES: { value: NonNullable<Collection["coverStyle"]>; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "grid2x2", label: "2x2 Grid" },
  { value: "grid3x3", label: "3x3 Mosaic" },
  { value: "gradient", label: "Gradient" },
];

export default function CollectionEditor({
  collection,
  onSave,
  onClose,
}: CollectionEditorProps) {
  const [name, setName] = useState(collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [coverStyle, setCoverStyle] = useState<NonNullable<Collection["coverStyle"]>>(
    collection?.coverStyle || "gradient"
  );
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      onSave({ name: name.trim(), description: description.trim(), coverStyle });
    },
    [name, description, coverStyle, onSave]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={collection ? "Edit collection" : "Create collection"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-3xl glass-ultra p-6 shadow-2xl animate-fade-in">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="mb-6 text-lg font-bold text-foreground">
          {collection ? "Edit Collection" : "Create Collection"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="collection-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              ref={nameInputRef}
              id="collection-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Collection"
              className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="collection-description"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your collection..."
              rows={3}
              className="w-full resize-none rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Cover Style */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Cover Style
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {COVER_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setCoverStyle(style.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs transition-all focus-visible:ring-2 focus-visible:ring-accent/50 ${
                    coverStyle === style.value
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-foreground/10 text-muted hover:border-foreground/20"
                  }`}
                  aria-pressed={coverStyle === style.value}
                >
                  <CoverStyleIcon style={style.value} />
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-foreground/10 px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {collection ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CoverStyleIcon({ style }: { style: NonNullable<Collection["coverStyle"]> }) {
  const baseClass = "h-8 w-8 rounded-md overflow-hidden";
  switch (style) {
    case "single":
      return (
        <div className={`${baseClass} bg-accent/30`} aria-hidden="true" />
      );
    case "grid2x2":
      return (
        <div className={`${baseClass} grid grid-cols-2 grid-rows-2 gap-px bg-foreground/10`} aria-hidden="true">
          <div className="bg-accent/20" />
          <div className="bg-accent/30" />
          <div className="bg-accent/40" />
          <div className="bg-accent/50" />
        </div>
      );
    case "grid3x3":
      return (
        <div className={`${baseClass} grid grid-cols-3 grid-rows-3 gap-px bg-foreground/10`} aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`bg-accent/${20 + i * 5}`} />
          ))}
        </div>
      );
    case "gradient":
      return (
        <div
          className={baseClass}
          style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
          aria-hidden="true"
        />
      );
    default:
      return null;
  }
}

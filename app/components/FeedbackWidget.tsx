"use client";

import { useState, useCallback } from "react";
import { MessageCircle, X, Send, CheckCircle } from "lucide-react";

const STORAGE_KEY = "music-user-feedback";

interface FeedbackEntry {
  id: string;
  type: "bug" | "feature" | "general";
  message: string;
  timestamp: number;
}

function saveFeedback(entry: FeedbackEntry): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: FeedbackEntry[] = stored ? JSON.parse(stored) : [];
    existing.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage errors
  }
}

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState<"bug" | "feature" | "general">("general");
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim()) return;

      const entry: FeedbackEntry = {
        id: crypto.randomUUID?.() ?? Date.now().toString(),
        type,
        message: message.trim(),
        timestamp: Date.now(),
      };
      saveFeedback(entry);
      setSubmitted(true);
      setMessage("");

      setTimeout(() => {
        setSubmitted(false);
        setOpen(false);
      }, 2000);
    },
    [message, type]
  );

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 left-4 z-[45] flex h-12 items-center gap-2 rounded-full border border-border/50 glass-card px-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:bottom-6"
          aria-label="Send Feedback"
        >
          <MessageCircle size={18} className="text-accent" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            Feedback
          </span>
        </button>
      )}

      {/* Feedback modal */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Send feedback"
        >
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border/50 glass-card p-6 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted transition-colors hover:text-foreground"
              aria-label="Close feedback form"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle
                  size={48}
                  className="mb-4 text-green-500"
                  aria-hidden="true"
                />
                <h2 className="text-xl font-bold text-foreground">
                  Thank You!
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Your feedback has been saved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="mb-4 text-xl font-bold text-foreground">
                  Send Feedback
                </h2>

                {/* Type selector */}
                <fieldset className="mb-4">
                  <legend className="mb-2 text-sm font-medium text-foreground">
                    Type
                  </legend>
                  <div className="flex gap-2">
                    {(["general", "bug", "feature"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-premium ${
                          type === t
                            ? "bg-foreground text-background"
                            : "bg-surface text-muted hover:text-foreground"
                        }`}
                        aria-pressed={type === t}
                      >
                        {t === "bug"
                          ? "Bug Report"
                          : t === "feature"
                            ? "Feature Request"
                            : "General"}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Message textarea */}
                <div className="mb-4">
                  <label
                    htmlFor="feedback-message"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you think..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent transition-premium hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} aria-hidden="true" />
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

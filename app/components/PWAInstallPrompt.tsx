"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "music-pwa-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) return;
    } catch {
      return;
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDeferredPrompt(null);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[45] mx-auto max-w-md sm:bottom-6 sm:left-auto sm:right-4"
      role="banner"
      aria-label="Install app"
    >
      <div className="rounded-2xl border border-border/50 glass-card p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <Download size={20} className="text-accent" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Install Music App
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Add to your home screen for a faster, app-like experience with offline support.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="rounded-lg bg-accent/10 px-4 py-2 text-xs font-medium text-accent transition-premium hover:bg-accent/20"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg px-3 py-2 text-xs font-medium text-muted transition-premium hover:text-foreground"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 text-muted transition-colors hover:text-foreground"
            aria-label="Dismiss install prompt"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

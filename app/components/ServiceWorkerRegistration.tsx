"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in production (non-localhost)
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      window.location.hostname === "localhost"
    ) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent failure - service worker registration is non-critical
    });
  }, []);

  return null;
}

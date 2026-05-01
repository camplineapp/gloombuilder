"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerManager() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const version = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
    const registerUrl = `/sw.js?v=${encodeURIComponent(version)}`;

    navigator.serviceWorker.register(registerUrl).then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
        setShowBanner(true);
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowBanner(true);
          }
        });
      });
    });

    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  }, []);

  const handleRefresh = () => {
    if (!waitingWorker) {
      window.location.reload();
      return;
    }
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: "#22c55e",
      color: "#0E0E10",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      fontSize: 14,
      fontWeight: 700,
      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    }}>
      <span>↻ New version available</span>
      <button
        onClick={handleRefresh}
        style={{
          background: "#0E0E10",
          color: "#22c55e",
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Refresh
      </button>
    </div>
  );
}

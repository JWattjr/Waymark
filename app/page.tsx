"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });
const TimelineView = dynamic(() => import("@/components/TimelineView"), { ssr: false });
const PassportView = dynamic(() => import("@/components/PassportView"), { ssr: false });
const WalletConnectButton = dynamic(() => import("@/components/WalletConnectButton"), { ssr: false });

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState<"map" | "timeline" | "passport">("map");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <main className="min-h-screen bg-[var(--color-ocean)]">
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-4 py-4 pointer-events-none md:px-8 md:py-6">
        <div className="text-xl font-bold tracking-tight pointer-events-auto title-shimmer md:text-2xl">Waymark</div>

        <div className="flex items-center gap-2 pointer-events-auto md:gap-4">
          <div className="flex rounded-full border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 p-1 shadow-lg backdrop-blur-md">
            <button
              onClick={() => setView("map")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:px-4 ${view === "map" ? "bg-[var(--color-primary)] text-[var(--color-card)]" : "text-[var(--color-secondary)] hover:text-[var(--color-primary)]"}`}
            >
              Map
            </button>
            <button
              onClick={() => setView("timeline")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:px-4 ${view === "timeline" ? "bg-[var(--color-primary)] text-[var(--color-card)]" : "text-[var(--color-secondary)] hover:text-[var(--color-primary)]"}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setView("passport")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:px-4 ${view === "passport" ? "bg-[var(--color-primary)] text-[var(--color-card)]" : "text-[var(--color-secondary)] hover:text-[var(--color-primary)]"}`}
            >
              Passport
            </button>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 text-[var(--color-primary)] shadow-lg backdrop-blur-md transition-colors hover:bg-[var(--color-card)]"
            title={isDark ? "Use light theme" : "Use dark theme"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <WalletConnectButton />
        </div>
      </nav>

      {view === "map" ? <WorldMap /> : view === "timeline" ? <TimelineView /> : <PassportView />}
    </main>
  );
}

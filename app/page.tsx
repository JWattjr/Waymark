"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BookOpen, Clock3, Map, Moon, Sun } from "lucide-react";

const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });
const TimelineView = dynamic(() => import("@/components/TimelineView"), { ssr: false });
const PassportView = dynamic(() => import("@/components/PassportView"), { ssr: false });
const WalletConnectButton = dynamic(() => import("@/components/WalletConnectButton"), { ssr: false });

const navItems = [
  { id: "map", label: "Map", icon: Map },
  { id: "timeline", label: "Timeline", icon: Clock3 },
  { id: "passport", label: "Passport", icon: BookOpen },
] as const;

type ViewMode = (typeof navItems)[number]["id"];

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState<ViewMode>("map");

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
          <div className="hidden rounded-full border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 p-1 shadow-lg backdrop-blur-md md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${view === item.id ? "bg-[var(--color-primary)] text-[var(--color-card)]" : "text-[var(--color-secondary)] hover:text-[var(--color-primary)]"}`}
              >
                {item.label}
              </button>
            ))}
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

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-[var(--color-border)]/40 bg-[var(--color-card)]/95 p-2 shadow-2xl backdrop-blur-md md:hidden">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition-colors ${isActive ? "bg-[var(--color-primary)] text-[var(--color-card)]" : "text-[var(--color-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {view === "map" ? <WorldMap /> : view === "timeline" ? <TimelineView /> : <PassportView />}
    </main>
  );
}

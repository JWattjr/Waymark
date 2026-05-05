"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false });
const TimelineView = dynamic(() => import('@/components/TimelineView'), { ssr: false });
const WalletConnectButton = dynamic(() => import('@/components/WalletConnectButton'), { ssr: false });

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState<'map' | 'timeline'>('map');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <main className="min-h-screen bg-[var(--color-ocean)]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 pointer-events-none">
        <div className="text-xl md:text-2xl font-bold tracking-tight title-shimmer pointer-events-auto">Waymark</div>
        
        <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
          {/* View Toggle */}
          <div className="hidden md:flex bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 rounded-full p-1 shadow-lg">
            <button 
              onClick={() => setView('map')} 
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${view === 'map' ? 'bg-[var(--color-primary)] text-[var(--color-card)]' : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'}`}
            >
              Map
            </button>
            <button 
              onClick={() => setView('timeline')} 
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${view === 'timeline' ? 'bg-[var(--color-primary)] text-[var(--color-card)]' : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'}`}
            >
              Timeline
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 shadow-lg flex items-center justify-center text-[var(--color-primary)] transition-colors hover:bg-[var(--color-card)]"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Wallet Connect */}
          <WalletConnectButton />
        </div>
      </nav>

      {/* Main View */}
      {view === 'map' ? <WorldMap /> : <TimelineView />}
    </main>
  );
}

"use client";

import Image from "next/image";
import { forwardRef, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Award, BadgeCheck, Camera, Download, Gauge, MapPinned, Play, RotateCcw, Share2, Stamp } from "lucide-react";
import { toPng } from "html-to-image";
import { getShelbyUrl } from "@/lib/shelby";
import {
  compactHash,
  calculateTravelStats,
  flattenExperiences,
  getAptosExplorerUrl,
  getCompletionBadges,
  getSeasonalBadges,
  loadExperiences,
  summarizeCountries,
  type Badge,
  type CountrySummary,
  type MemoryEntry,
} from "@/lib/waymark/data";

export default function PassportView() {
  const [records, setRecords] = useState<Record<string, MemoryEntry[]>>(() => loadExperiences() as Record<string, MemoryEntry[]>);
  const [activeMemoryId, setActiveMemoryId] = useState<string>("");
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStorage = () => {
      setRecords(loadExperiences() as Record<string, MemoryEntry[]>);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const summaries = useMemo(() => summarizeCountries(records), [records]);
  const memories = useMemo(() => flattenExperiences(records), [records]);
  const stats = useMemo(() => calculateTravelStats(summaries, memories), [summaries, memories]);
  const completionBadges = useMemo(() => getCompletionBadges(summaries), [summaries]);
  const seasonalBadges = useMemo(() => getSeasonalBadges(memories), [memories]);
  const activeMemory = useMemo(() => memories.find((memory) => memory.id === activeMemoryId) || memories[memories.length - 1], [activeMemoryId, memories]);
  const activeSummary = useMemo(() => summaries.find((summary) => summary.countryId === activeMemory?.countryId), [activeMemory, summaries]);

  useEffect(() => {
    if (!isReplaying || memories.length === 0) return;

    const timer = window.setInterval(() => {
      setReplayIndex((current) => {
        const next = current + 1;
        if (next >= memories.length) {
          setIsReplaying(false);
          return current;
        }
        setActiveMemoryId(memories[next].id);
        return next;
      });
    }, 1100);

    return () => window.clearInterval(timer);
  }, [isReplaying, memories]);

  const exportShareCard = async () => {
    if (!shareCardRef.current) return;
    const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#faf6f0" });
    const link = document.createElement("a");
    link.download = `${activeSummary?.country || "waymark"}-share-card.png`.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
    link.href = dataUrl;
    link.click();
  };

  const startReplay = () => {
    if (!memories.length) return;
    setReplayIndex(0);
    setActiveMemoryId(memories[0].id);
    setIsReplaying(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-ocean)] paper-texture pt-28 pb-24 px-4 md:px-8 overflow-y-auto">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-visited)]">Waymark Passport</p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)] md:text-5xl">Collected proof, places, and progress</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ScoreTile icon={<Stamp className="h-4 w-4" />} label="Countries" value={stats.countryCount.toString()} />
            <ScoreTile icon={<MapPinned className="h-4 w-4" />} label="Regions" value={stats.regionCount.toString()} />
            <ScoreTile icon={<BadgeCheck className="h-4 w-4" />} label="Proofs" value={stats.proofCount.toString()} />
            <ScoreTile icon={<Gauge className="h-4 w-4" />} label="Score" value={stats.score.toLocaleString()} />
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 p-5 shadow-lg backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-primary)]">Passport Stamps</h2>
                  <p className="text-xs text-[var(--color-secondary)]">{stats.memoryCount} memories across {stats.countryCount} countries</p>
                </div>
                <div className="rounded-full bg-[var(--color-background)] px-3 py-1 text-xs font-bold text-[var(--color-visited)]">
                  {stats.rareCount} rare routes
                </div>
              </div>

              {summaries.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {summaries.map((summary) => (
                    <button
                      key={summary.countryId}
                      onClick={() => {
                        setActiveMemoryId(summary.topMemory?.id || "");
                        setIsReplaying(false);
                      }}
                      className="group flex aspect-[1.25] flex-col justify-between rounded-2xl border border-dashed border-[var(--color-visited)]/40 bg-[var(--color-background)] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-visited)] hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <FlagBadge code={summary.meta.flagCode} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-secondary)]">{summary.memories.length} marks</span>
                      </div>
                      <div>
                        <p className="line-clamp-1 text-sm font-bold text-[var(--color-primary)]">{summary.country}</p>
                        <p className="mt-1 text-[11px] text-[var(--color-secondary)]">{summary.latestDate}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <BadgePanel title="Seasonal Badges" badges={seasonalBadges} />
              <BadgePanel title="Region Completion" badges={completionBadges} />
            </div>

            <JourneyReplay
              memories={memories}
              replayIndex={replayIndex}
              isReplaying={isReplaying}
              onStart={startReplay}
              onReset={() => {
                setIsReplaying(false);
                setReplayIndex(0);
                if (memories[0]) setActiveMemoryId(memories[0].id);
              }}
              onSelect={(memory, index) => {
                setIsReplaying(false);
                setReplayIndex(index);
                setActiveMemoryId(memory.id);
              }}
            />
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 p-5 shadow-lg backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-primary)]">Share Card</h2>
                  <p className="text-xs text-[var(--color-secondary)]">Memory-ready PNG export</p>
                </div>
                <button
                  onClick={exportShareCard}
                  disabled={!activeMemory}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-card)] transition-colors hover:bg-[#2a1c0e] disabled:opacity-40"
                  title="Export share card"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>

              <ShareCard ref={shareCardRef} memory={activeMemory} summary={activeSummary} score={stats.score} />
            </div>

            <div className="rounded-2xl border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 p-5 shadow-lg backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-primary)]">Proof Cards</h2>
                  <p className="text-xs text-[var(--color-secondary)]">Shelby and Aptos references</p>
                </div>
                <Camera className="h-5 w-5 text-[var(--color-visited)]" />
              </div>

              <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1 sidebar-scroll">
                {memories.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[var(--color-secondary)]">No proofs yet.</p>
                ) : (
                  memories.slice().reverse().map((memory) => (
                    <ProofCard key={memory.id} memory={memory} isActive={memory.id === activeMemory?.id} onSelect={() => setActiveMemoryId(memory.id)} />
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function ScoreTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="mb-2 text-[var(--color-visited)]">{icon}</div>
      <div className="text-xl font-bold text-[var(--color-primary)]">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-secondary)]">{label}</div>
    </div>
  );
}

function FlagBadge({ code }: { code: string }) {
  return (
    <span className="inline-flex h-9 min-w-11 items-center justify-center rounded-md border border-[var(--color-visited)]/40 bg-[var(--color-card)] px-2 font-mono text-xs font-black text-[var(--color-visited)] shadow-sm">
      {code}
    </span>
  );
}

function BadgePanel({ title, badges }: { title: string; badges: Badge[] }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 p-5 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-[var(--color-visited)]" />
        <h2 className="text-base font-bold text-[var(--color-primary)]">{title}</h2>
      </div>
      <div className="flex flex-col gap-3">
        {badges.map((badge) => (
          <div key={badge.id} className="rounded-xl border border-[var(--color-border)]/30 bg-[var(--color-background)] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--color-primary)]">{badge.label}</p>
                <p className="text-xs text-[var(--color-secondary)]">{badge.detail}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${badge.earned ? "bg-[var(--color-visited)] text-white" : "bg-[var(--color-border)]/30 text-[var(--color-secondary)]"}`}>
                {badge.earned ? "Earned" : "Open"}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-border)]/30">
              <div className="h-full rounded-full bg-[var(--color-visited)] transition-all" style={{ width: `${Math.max(8, badge.progress * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JourneyReplay({
  memories,
  replayIndex,
  isReplaying,
  onStart,
  onReset,
  onSelect,
}: {
  memories: MemoryEntry[];
  replayIndex: number;
  isReplaying: boolean;
  onStart: () => void;
  onReset: () => void;
  onSelect: (memory: MemoryEntry, index: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)]/40 bg-[var(--color-card)]/90 p-5 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Journey Replay</h2>
          <p className="text-xs text-[var(--color-secondary)]">{memories.length} dated stops</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onStart} disabled={!memories.length || isReplaying} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-card)] transition-colors hover:bg-[#2a1c0e] disabled:opacity-40" title="Play journey">
            <Play className="h-4 w-4" />
          </button>
          <button onClick={onReset} disabled={!memories.length} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)]/50 bg-[var(--color-background)] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-card)] disabled:opacity-40" title="Reset journey">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {memories.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-secondary)]">Archive a memory to start the replay.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 sidebar-scroll">
          {memories.map((memory, index) => (
            <button
              key={memory.id}
              onClick={() => onSelect(memory, index)}
              className={`min-w-[180px] rounded-xl border p-3 text-left transition-all ${index === replayIndex ? "border-[var(--color-visited)] bg-[var(--color-background)] shadow-md" : "border-[var(--color-border)]/30 bg-[var(--color-card)] hover:bg-[var(--color-background)]"}`}
            >
              <p className="text-xs font-mono text-[var(--color-secondary)]">{memory.date}</p>
              <p className="mt-1 line-clamp-1 text-sm font-bold text-[var(--color-primary)]">{memory.country}</p>
              <p className="mt-2 line-clamp-2 text-xs text-[var(--color-secondary)]">{memory.text}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProofCard({ memory, isActive, onSelect }: { memory: MemoryEntry; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition-all ${isActive ? "border-[var(--color-visited)] bg-[var(--color-background)]" : "border-[var(--color-border)]/30 bg-[var(--color-card)] hover:bg-[var(--color-background)]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-primary)]">{memory.country}</p>
          <p className="text-xs text-[var(--color-secondary)]">{memory.date}</p>
        </div>
        <Share2 className="h-4 w-4 text-[var(--color-visited)]" />
      </div>
      <p className="mt-3 truncate font-mono text-[10px] text-[var(--color-secondary)]">CID {memory.imageCid}</p>
      {memory.txHash ? (
        <a href={getAptosExplorerUrl(memory.txHash)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-2 block truncate font-mono text-[10px] font-bold text-[var(--color-visited)]">
          TX {compactHash(memory.txHash)}
        </a>
      ) : (
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-secondary)]">Local proof</p>
      )}
    </button>
  );
}

const ShareCard = forwardRef<HTMLDivElement, {
  memory?: MemoryEntry;
  summary?: CountrySummary;
  score: number;
}>(function ShareCardInner({
    memory,
    summary,
    score,
  }, ref) {
    return (
      <div ref={ref} className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[var(--color-border)]/40 bg-[var(--color-background)] shadow-inner">
        {memory ? (
          <>
            <ImageWithCid cid={memory.imageCid} alt={memory.country} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="mb-4 flex items-center justify-between gap-3">
                <FlagBadge code={summary?.meta.flagCode || "WM"} />
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">{score.toLocaleString()} pts</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/75">Waymark Proof</p>
              <h3 className="mt-2 text-3xl font-bold leading-tight">{summary?.country || memory.country}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/85">{memory.text}</p>
              <div className="mt-5 flex items-center justify-between gap-3 text-xs text-white/75">
                <span>{memory.date}</span>
                <span className="font-mono">{compactHash(memory.txHash || memory.imageCid, 7, 5)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <Stamp className="h-10 w-10 text-[var(--color-visited)]" />
            <p className="mt-4 text-lg font-bold text-[var(--color-primary)]">No share card yet</p>
            <p className="mt-2 text-sm text-[var(--color-secondary)]">Archive a memory to generate one.</p>
          </div>
        )}
      </div>
    );
  });

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)]/50 bg-[var(--color-background)] py-16 text-center">
      <Stamp className="h-10 w-10 text-[var(--color-visited)]" />
      <p className="mt-4 text-sm font-bold text-[var(--color-primary)]">No stamps yet</p>
      <p className="mt-1 text-sm text-[var(--color-secondary)]">Your first archived memory will appear here.</p>
    </div>
  );
}

function ImageWithCid({ cid, alt }: { cid: string; alt: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (cid) getShelbyUrl(cid).then(setUrl);
  }, [cid]);

  if (!url) {
    return <div className="absolute inset-0 animate-pulse bg-[var(--color-border)]/30" />;
  }

  return <Image src={url} alt={alt} fill className="object-cover" unoptimized />;
}

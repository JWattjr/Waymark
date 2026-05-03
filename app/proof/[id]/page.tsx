import Link from 'next/link';
import { MOCK_TRIPS } from '@/lib/mockData';

export default async function ArchiveProof({ params }: { params: { id: string } }) {
  const { id } = await params;
  const trip = MOCK_TRIPS.find(t => t.id === id) || MOCK_TRIPS[0];

  return (
    <main className="min-h-screen bg-[var(--color-primary)] text-white flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <Link href={`/trip/${trip.id}`} className="text-neutral-500 hover:text-white transition-colors text-sm mb-12 inline-block">
          ← Back to Trip
        </Link>
        
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full mb-6 border border-white/10">
            DECENTRALIZED ARCHIVE PROOF
          </div>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-4">Immutable Certificate</h1>
          <p className="text-neutral-400 text-lg">Verified storage on Shelby & Aptos protocols.</p>
        </div>

        <div className="bg-neutral-800 rounded-3xl p-12 relative overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.3)]">
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.02] text-[15rem] pointer-events-none rotate-[-20deg] font-medium">
            Waymark
          </div>

          <div className="relative z-10 space-y-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Capsule Title</label>
                <div className="text-2xl font-medium tracking-tight">{trip.title}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Destination</label>
                <div className="text-2xl font-medium tracking-tight">{trip.destination}</div>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full"></div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Archive Hash (Shelby)</label>
                <div className="font-mono text-white break-all">{trip.archiveHash}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Aptos Transaction</label>
                <div className="font-mono text-neutral-300 break-all">0x9a2b...c3d4e5f6g7h8i9j0</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 pt-8">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[10px] font-bold text-neutral-500 mb-2">STATUS</div>
                <div className="text-green-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  VERIFIED
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[10px] font-bold text-neutral-500 mb-2">TIMESTAMP</div>
                <div className="text-neutral-200">{new Date(trip.timestamp).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[10px] font-bold text-neutral-500 mb-2">OWNER</div>
                <div className="text-neutral-200 font-mono text-xs">{trip.ownerAddress}</div>
              </div>
            </div>

            <div className="pt-12 flex justify-between items-end border-t border-white/5">
              <div className="text-3xl italic text-neutral-700 font-medium">Waymark</div>
              <div className="flex gap-4">
                <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center text-xs text-neutral-600">S1</div>
                <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center text-xs text-neutral-600">A1</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-neutral-500 text-xs">
          This document serves as a cryptographic proof that the contents of the &quot;{trip.title}&quot; travel capsule <br />
          have been successfully archived and anchored to decentralized storage and ledger protocols.
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { MOCK_TRIPS } from '@/lib/mockData';

export default async function TripEditor({ params }: { params: { id: string } }) {
  const { id } = await params;
  const trip = MOCK_TRIPS.find(t => t.id === id) || MOCK_TRIPS[0];

  return (
    <main className="min-h-screen">
      <nav className="w-full h-20 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors">
            <span>←</span>
          </Link>
          <div className="text-xl font-bold tracking-tight">Editing: {trip.title}</div>
        </div>
        <div className="flex gap-4">
          <Link href={`/trip/${trip.id}`} className="btn-secondary py-2 px-4 text-sm">
            Preview Public Page
          </Link>
          {!trip.isSealed && (
            <button className="btn-primary py-2 px-6 text-sm w-auto">
              Seal Capsule
            </button>
          )}
          {trip.isSealed && (
            <div className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full flex items-center gap-2">
              <span>🔒</span> SEALED & ARCHIVED
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-8">
        <div className="soft-card p-8 mb-12 bg-white flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-40 h-40 rounded-3xl overflow-hidden shrink-0">
            <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-medium tracking-tight mb-2">{trip.title}</h2>
            <p className="text-[var(--color-secondary)] mb-4">{trip.description}</p>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-secondary)]">
              <span>📍 {trip.destination}</span>
              <span>📅 {trip.startDate} — {trip.endDate}</span>
              <span>👁️ {trip.visibility}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-medium tracking-tight">Journal Entries</h3>
          {!trip.isSealed && (
            <button className="text-[var(--color-primary)] font-medium hover:underline text-sm">+ Add New Entry</button>
          )}
        </div>

        <div className="space-y-6 relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-neutral-200 z-0"></div>
          
          {trip.entries.map((entry) => (
            <div key={entry.id} className="relative z-10 pl-12">
              <div className="absolute left-3 top-2 w-3 h-3 rounded-full bg-[var(--color-primary)] border-4 border-white shadow-sm"></div>
              <div className="soft-card p-6 bg-white transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[10px] text-[var(--color-secondary)] font-bold uppercase mb-1">{entry.date} • {entry.location.name}</div>
                    <h4 className="text-xl font-medium tracking-tight">{entry.title}</h4>
                  </div>
                  {!trip.isSealed && (
                    <button className="text-neutral-300 hover:text-[var(--color-primary)] transition-colors">✎</button>
                  )}
                </div>
                <p className="text-[var(--color-secondary)] text-sm leading-relaxed mb-6">{entry.content}</p>
                {entry.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {entry.media.map(m => (
                      <div key={m.id} className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-100">
                        <Image src={m.url} alt={m.caption || ''} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {!trip.isSealed && (
            <div className="relative z-10 pl-12 pt-4">
              <div className="absolute left-3 top-6 w-3 h-3 rounded-full bg-neutral-200 border-4 border-white shadow-sm"></div>
              <button className="w-full h-32 rounded-3xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-[var(--color-secondary)] hover:bg-white transition-all group">
                <span className="text-2xl mb-1 group-hover:text-[var(--color-primary)]">+</span>
                <span className="text-xs font-bold uppercase tracking-widest group-hover:text-[var(--color-primary)]">Add entry to the archive</span>
              </button>
            </div>
          )}
        </div>

        {!trip.isSealed && (
          <div className="mt-16 p-12 bg-[var(--color-primary)] rounded-3xl text-center text-white">
            <h3 className="text-3xl font-medium tracking-tight mb-4">Ready to Seal?</h3>
            <p className="text-white/70 max-w-md mx-auto mb-8">
              Sealing your trip capsule freezes all entries and uploads them to the Shelby decentralized archive. This action is permanent and generates a cryptographic proof.
            </p>
            <button className="btn-primary bg-white hover:bg-neutral-100 text-[var(--color-primary)] font-bold px-12 py-4">
              Seal & Archive Forever
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

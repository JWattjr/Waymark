import Link from 'next/link';
import Image from 'next/image';
import { MOCK_TRIPS } from '@/lib/mockData';

export default function Dashboard() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="w-full h-20 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-white border-opacity-20 sticky top-0 z-50">
        <Link href="/" className="text-2xl font-bold tracking-tight">Waymark</Link>
        <div className="flex gap-4 items-center">
          <div className="text-xs text-[var(--color-secondary)] font-mono">0x1234...abcd</div>
          <div className="w-10 h-10 rounded-full bg-[#f8f6f3] flex items-center justify-center text-[var(--color-primary)] font-medium text-sm">
            JD
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-3">My Travel Archive</h1>
            <p className="text-[var(--color-secondary)] text-lg">Collect and preserve your memories.</p>
          </div>
          <Link href="/create" className="btn-primary w-auto px-8 py-4">
            <span>+</span> New Trip Capsule
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_TRIPS.map((trip) => (
            <Link key={trip.id} href={`/trip/${trip.id}/edit`} className="group">
              <div className="soft-card overflow-hidden h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_48px_rgb(0,0,0,0.06)] bg-white rounded-[2rem] p-4 border border-white">
                <div className="relative h-56 w-full rounded-3xl overflow-hidden mb-6">
                  <Image 
                    src={trip.coverImage} 
                    alt={trip.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {trip.isSealed && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md text-black text-[10px] font-bold tracking-widest rounded-full flex items-center gap-1.5">
                      <span>🔒</span> SEALED
                    </div>
                  )}
                </div>
                <div className="px-2 flex-1 flex flex-col">
                  <div className="text-[10px] text-[var(--color-secondary)] font-bold mb-2 uppercase tracking-[0.2em]">{trip.destination}</div>
                  <h3 className="text-2xl font-medium mb-3 group-hover:text-black/70 transition-colors tracking-tight">{trip.title}</h3>
                  <p className="text-[var(--color-secondary)] text-sm line-clamp-2 mb-8 leading-relaxed">
                    {trip.description}
                  </p>
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#f8f6f3]">
                    <span className="text-[11px] text-[var(--color-secondary)] font-medium">{trip.startDate}</span>
                    <div className="text-[11px] text-[var(--color-secondary)] flex gap-2 font-medium">
                      <span>{trip.entries.length} entries</span>
                      <span>•</span>
                      <span className="capitalize">{trip.visibility}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Empty State / Add Card */}
          <Link href="/create" className="group h-full">
            <div className="h-full flex flex-col items-center justify-center p-12 text-center transition-colors hover:bg-white bg-transparent border-2 border-dashed border-neutral-200 rounded-[2rem]">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl text-[var(--color-secondary)] group-hover:text-black transition-colors mb-6">
                +
              </div>
              <div className="text-base font-medium text-[var(--color-secondary)] group-hover:text-black">Create another capsule</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

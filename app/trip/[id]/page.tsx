import Image from 'next/image';
import Link from 'next/link';
import { MOCK_TRIPS } from '@/lib/mockData';

export default async function PublicTripViewer({ params }: { params: { id: string } }) {
  const { id } = await params;
  const trip = MOCK_TRIPS.find(t => t.id === id) || MOCK_TRIPS[0];

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-primary)]">
      {/* Hero Header */}
      <header className="relative h-[80vh] w-full overflow-hidden">
        <Image 
          src={trip.coverImage} 
          alt={trip.title} 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
        <div className="absolute bottom-20 left-0 w-full px-8 md:px-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                Travel Capsule
              </span>
              <span className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                Verified Archive
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl text-white mb-6 leading-none font-medium tracking-tight">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 text-white/80 font-medium">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-60">Destination</span>
                <span className="text-lg">{trip.destination}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-60">Timeline</span>
                <span className="text-lg">{trip.startDate} — {trip.endDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-60">Archive Proof</span>
                <Link href={`/proof/${trip.id}`} className="text-lg hover:text-white transition-colors underline decoration-white/30 underline-offset-4">
                  {trip.archiveHash}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Intro Section */}
      <section className="py-32 px-8 md:px-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-8">
            <h2 className="text-4xl font-medium tracking-tight mb-10 leading-snug">
              {trip.description}
            </h2>
            <div className="w-24 h-px bg-[var(--color-secondary)]/30 mb-10"></div>
          </div>
          <div className="md:col-span-4 space-y-8 sticky top-32">
            <div className="p-6 rounded-3xl bg-white shadow-[0_8px_40px_rgb(0,0,0,0.03)]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-secondary)] mb-4">Ownership Information</div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#f8f6f3] flex items-center justify-center text-xl font-medium">
                  JD
                </div>
                <div>
                  <div className="font-bold">John Doe</div>
                  <div className="text-xs text-[var(--color-secondary)] font-mono">0x1234...abcd</div>
                </div>
              </div>
              <Link href={`/proof/${trip.id}`} className="btn-primary py-3 text-xs uppercase tracking-widest font-bold">
                View On-Chain Proof
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Entries Section */}
      <section className="pb-32 px-8 md:px-20 max-w-7xl mx-auto">
        <div className="space-y-40">
          {trip.entries.map((entry, index) => (
            <div key={entry.id} className={`grid md:grid-cols-12 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-700">
                  <Image 
                    src={entry.media[0].url} 
                    alt={entry.title} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-2xl text-xs font-medium">
                    {entry.media[0].caption}
                  </div>
                </div>
              </div>
              <div className={`md:col-span-5 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="text-[var(--color-secondary)] font-bold text-xs uppercase tracking-[0.3em] mb-4">
                  {entry.date} • {entry.location.name}
                </div>
                <h3 className="text-5xl font-medium tracking-tight mb-8 leading-tight">{entry.title}</h3>
                <p className="text-[var(--color-secondary)] text-lg leading-relaxed mb-10 italic">
                  &quot;{entry.content}&quot;
                </p>
                <div className="flex items-center gap-2 text-neutral-300 text-sm italic">
                  <span className="w-8 h-px bg-neutral-200"></span>
                  Waymark Entry #{index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section Preview */}
      <section className="py-32 bg-[var(--color-primary)] text-white overflow-hidden">
        <div className="px-8 md:px-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <div className="text-[var(--color-secondary)] font-bold text-xs uppercase tracking-[0.3em] mb-4">Interactive Journey</div>
              <h2 className="text-5xl md:text-7xl font-medium tracking-tight">Path Taken</h2>
            </div>
            <div className="text-white/50 max-w-sm text-right">
              Every entry is geo-tagged and anchored to its physical origin, creating a spatial narrative of your travels.
            </div>
          </div>
          
          <div className="relative h-[600px] rounded-3xl overflow-hidden border border-white/10 grayscale contrast-125 brightness-75">
            {/* Mock Map Image */}
            <Image 
              src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1974" 
              alt="Map" 
              fill 
              className="object-cover opacity-40"
            />
            
            {/* Mock Pins */}
            {trip.entries.map((entry, idx) => (
              <div 
                key={entry.id}
                className="absolute w-4 h-4 bg-white rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{
                  top: `${20 + (idx * 15)}%`,
                  left: `${30 + (idx * 12)}%`
                }}
              >
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold">
                  {entry.location.name}
                </div>
              </div>
            ))}
            
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[var(--color-primary)] via-transparent to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-32 px-8 md:px-20 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-medium tracking-tight mb-4">Captured Moments</h2>
          <p className="text-[var(--color-secondary)] italic">A visual summary of the journey.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trip.entries.map((e, idx) => (
            <div key={idx} className={`relative aspect-square rounded-3xl overflow-hidden ${idx % 3 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
              <Image 
                src={e.media[0].url} 
                alt="Gallery" 
                fill 
                className="object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-neutral-100 text-center">
        <div className="text-3xl font-medium tracking-tight mb-8">Waymark</div>
        <div className="text-xs text-[var(--color-secondary)] uppercase tracking-widest mb-12">Decentralized Travel Archive</div>
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 border border-neutral-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--color-secondary)]">Stored on Shelby</div>
          <div className="px-4 py-2 border border-neutral-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--color-secondary)]">Secured by Aptos</div>
        </div>
        <div className="mt-12 text-[10px] text-neutral-300">
          ARCHIVE HASH: {trip.archiveHash}
        </div>
      </footer>
    </main>
  );
}

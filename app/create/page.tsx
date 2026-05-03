import Link from 'next/link';

export default function CreateTrip() {
  return (
    <main className="min-h-screen py-12 px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-[var(--color-secondary)] text-sm hover:text-[var(--color-primary)] flex items-center gap-2 mb-8 transition-colors">
          <span>←</span> Back to Dashboard
        </Link>
        
        <div className="soft-card p-10 bg-white">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Initialize New Capsule</h1>
          <p className="text-[var(--color-secondary)] mb-10">Set the foundation for your travel archive.</p>
          
          <form className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)]">Trip Title</label>
              <input 
                type="text" 
                placeholder="e.g. Summer in Tuscany" 
                className="w-full px-0 py-3 border-b border-neutral-200 focus:border-[var(--color-primary)] outline-none text-xl transition-colors bg-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)]">Destination</label>
              <input 
                type="text" 
                placeholder="Where did you go?" 
                className="w-full px-0 py-3 border-b border-neutral-200 focus:border-[var(--color-primary)] outline-none transition-colors bg-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)]">Start Date</label>
                <input 
                  type="date" 
                  className="w-full px-0 py-3 border-b border-neutral-200 focus:border-[var(--color-primary)] outline-none transition-colors bg-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)]">End Date</label>
                <input 
                  type="date" 
                  className="w-full px-0 py-3 border-b border-neutral-200 focus:border-[var(--color-primary)] outline-none transition-colors bg-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)]">Cover Image URL</label>
              <input 
                type="text" 
                placeholder="https://images.unsplash.com/..." 
                className="w-full px-0 py-3 border-b border-neutral-200 focus:border-[var(--color-primary)] outline-none transition-colors bg-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)]">Description</label>
              <textarea 
                rows={3}
                placeholder="A brief summary of your journey..." 
                className="w-full px-0 py-3 border-b border-neutral-200 focus:border-[var(--color-primary)] outline-none transition-colors resize-none bg-transparent"
              ></textarea>
            </div>

            <div className="pt-8 flex gap-4">
              <Link href="/dashboard" className="btn-secondary flex-1">Cancel</Link>
              <Link href="/trip/new/edit" className="btn-primary flex-1">Create Capsule</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

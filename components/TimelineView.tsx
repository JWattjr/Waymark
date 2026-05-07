"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getShelbyUrl } from "@/lib/shelby";

interface Experience {
  id: string;
  country: string;
  imageCid: string;
  text: string;
  date: string;
}

export default function TimelineView() {
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("waymark_experiences");
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, Experience[]>;
        const all: Experience[] = [];
        for (const country in parsed) {
          all.push(...parsed[country]);
        }
        all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExperiences(all);
      }
    }
  }, []);

  return (
    <div className="w-full min-h-screen pt-28 pb-32 px-4 md:pt-32 md:pb-24 md:px-8 overflow-y-auto bg-[var(--color-ocean)] paper-texture">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">Journey Timeline</h1>
        <p className="text-[var(--color-secondary)] mb-10 md:mb-16 text-base md:text-lg">A chronological archive of your adventures.</p>

        {experiences.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-secondary)]">
            No memories archived yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-[var(--color-border)] ml-4 md:ml-1/2">
            {experiences.map((exp) => (
              <div key={exp.id} className="mb-16 ml-8 relative group">
                <div className="absolute -left-[2.35rem] top-2 w-4 h-4 rounded-full bg-[var(--color-accent)] border-4 border-[var(--color-ocean)] group-hover:scale-125 transition-transform" />
                
                <div className="bg-[var(--color-card)]/90 backdrop-blur-sm border border-[var(--color-border)]/40 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 relative h-48 md:h-auto rounded-2xl overflow-hidden bg-[var(--color-background)]">
                    <ImageWithCid cid={exp.imageCid} alt={exp.country} />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold tracking-widest text-[var(--color-visited)] uppercase">{exp.country}</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-secondary)]"></span>
                      <span className="text-xs text-[var(--color-secondary)] font-mono">{exp.date}</span>
                    </div>
                    <p className="text-[var(--color-primary)] leading-relaxed mt-2 text-sm">
                      {exp.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageWithCid({ cid, alt }: { cid: string; alt: string }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => { if (cid) getShelbyUrl(cid).then(setUrl); }, [cid]);
  if (!url) return <div className="w-full h-full animate-pulse bg-[var(--color-border)]/20 flex items-center justify-center text-xs text-[var(--color-secondary)]">Loading...</div>;
  return <Image src={url} alt={alt} fill className="object-cover" unoptimized />;
}

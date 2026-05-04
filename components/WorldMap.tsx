"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { uploadToShelby, getShelbyUrl } from "@/lib/shelby";
import Image from "next/image";
import { toPng } from "html-to-image";

const geoUrl = "/features.json";
const TOTAL_COUNTRIES = 177; // approx from 110m topology

interface Experience {
  id: string;
  country: string;
  imageCid: string;
  text: string;
  date: string;
  txHash?: string;
}

export default function WorldMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [visitedCountries, setVisitedCountries] = useState<Record<string, Experience[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("waymark_experiences");
      if (saved) return JSON.parse(saved);
    }
    return {};
  });
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [experienceText, setExperienceText] = useState("");
  const [experienceDate, setExperienceDate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 55]);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [latestTx, setLatestTx] = useState<string | null>(null);
  
  useEffect(() => {
    if (latestTx) {
      const timer = setTimeout(() => setLatestTx(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [latestTx]);
  
  // Generate random particles once
  const [particles, setParticles] = useState<{id: number, left: string, top: string, size: number, delay: string, duration: string}[]>([]);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 4 + 4}s`
    })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cursor glow tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const pendingGeoData = useRef<Record<string, unknown>[] | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (pendingGeoData.current) {
      setGeoData(pendingGeoData.current);
      pendingGeoData.current = null;
    }
  });

  const visitedCount = useMemo(() => Object.keys(visitedCountries).filter(k => visitedCountries[k]?.length > 0).length, [visitedCountries]);

  const saveExperience = (newExp: Record<string, Experience[]>) => {
    setVisitedCountries(newExp);
    localStorage.setItem("waymark_experiences", JSON.stringify(newExp));
  };

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (!q.trim() || !geoData.length) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    const results = geoData
      .filter(g => {
        const n = (g.properties.NAME || g.properties.name || "").toLowerCase();
        return n.includes(lower);
      })
      .slice(0, 8)
      .map(g => ({ id: g.id, name: g.properties.NAME || g.properties.name }));
    setSearchResults(results);
  }, [geoData]);

  const jumpToCountry = (id: string, name: string) => {
    const geo = geoData.find(g => g.id === id);
    if (geo) {
      const c = geoCentroid(geo);
      setCenter([c[0], c[1]]);
      setZoom(4);
    }
    setSelectedCountry({ id, name });
    setGalleryIdx(0);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
    setRipples(r => [...r, newRipple]);
    setTimeout(() => {
      setRipples(current => current.filter(r => r.id !== newRipple.id));
    }, 800);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCountryClick = (geo: any) => {
    const { NAME, name } = geo.properties;
    setSelectedCountry({ id: geo.id, name: NAME || name });
    setGalleryIdx(0);
    setExperienceText("");
    setExperienceDate("");
    setSelectedFiles([]);
  };

  const [imageFilter, setImageFilter] = useState("none");
  const FILTERS = [
    { id: "none", name: "Normal", css: "" },
    { id: "vintage", name: "Vintage", css: "sepia(0.6) contrast(1.2)" },
    { id: "bw", name: "B&W", css: "grayscale(1) contrast(1.2)" },
    { id: "polaroid", name: "Polaroid", css: "brightness(1.1) contrast(1.1) saturate(1.3)" }
  ];

  const processImageWithFilter = async (file: File, filterCss: string): Promise<File> => {
    if (!filterCss) return file;
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.filter = filterCss;
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(blob => {
            resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file);
          }, "image/jpeg", 0.9);
        } else resolve(file);
      };
      img.src = url;
    });
  };

  const handleUpload = async () => {
    if (!selectedCountry || selectedFiles.length === 0 || !experienceText) return;
    setUploading(true);
    try {
      const current = visitedCountries[selectedCountry.id] || [];
      const newExps: Experience[] = [];
      const selectedFilterCss = FILTERS.find(f => f.id === imageFilter)?.css || "";
      
      for (const file of selectedFiles) {
        const processedFile = await processImageWithFilter(file, selectedFilterCss);
        const { cid, txHash } = await uploadToShelby(processedFile);
        if (txHash) setLatestTx(txHash);
        newExps.push({
          id: Date.now().toString() + Math.random().toString(),
          country: selectedCountry.name,
          imageCid: cid,
          text: experienceText,
          date: experienceDate || new Date().toISOString().split('T')[0],
          txHash: txHash
        });
      }
      
      saveExperience({ ...visitedCountries, [selectedCountry.id]: [...current, ...newExps] });
      setSelectedFiles([]);
      setExperienceText("");
      setExperienceDate("");
      setImageFilter("none");
      setGalleryIdx(current.length); // jump to new
    } catch (err) {
      console.error(err);
      alert("Upload failed — check console for details");
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    if (!mapRef.current) return;
    try {
      const dataUrl = await toPng(mapRef.current, { cacheBust: true, backgroundColor: "#f5efe6" });
      const link = document.createElement("a");
      link.download = "waymark-map.png";
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error(err); }
  };

  const experiences = selectedCountry ? (visitedCountries[selectedCountry.id] || []) : [];

  return (
    <div className="relative w-full h-screen bg-[var(--color-ocean)] overflow-hidden paper-texture map-container" ref={mapRef} onClick={handleMapClick}>
      {/* Floating Particles */}
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.left, top: p.top, width: p.size, height: p.size, 
          animationDelay: p.delay, animationDuration: p.duration
        }} />
      ))}
      
      {/* Ripples */}
      {ripples.map(r => (
        <div key={r.id} className="map-ripple" style={{ left: r.x, top: r.y, width: 80, height: 80 }} />
      ))}

      {/* Aurora shimmer */}
      <div className="aurora-overlay" style={{ zIndex: 1 }} />
      
      {/* Transaction Toast */}
      {latestTx && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-[var(--color-card)]/95 backdrop-blur-md border border-[var(--color-visited)]/30 rounded-2xl px-6 py-4 shadow-2xl flex flex-col gap-2 animate-slide-in min-w-[320px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-visited)] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-visited)]">Archive Confirmed</span>
            </div>
            <button onClick={() => setLatestTx(null)} className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">&times;</button>
          </div>
          <p className="text-[10px] font-mono text-[var(--color-primary)] break-all bg-[var(--color-background)] p-2 rounded-lg border border-[var(--color-border)]/20">
            {latestTx}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--color-secondary)]">Stored on Shelby Protocol</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-md font-bold">LIVE</span>
          </div>
        </div>
      )}

      {/* Coordinate grid */}
      <div className="grid-overlay" style={{ zIndex: 1 }} />
      {/* Scan line sweep */}
      <div className="scan-line" style={{ zIndex: 1 }} />
      {/* Vignette border */}
      <div className="vignette-overlay" style={{ zIndex: 1 }} />

      {/* Compass rose — small, bottom-right */}
      <div style={{ position: 'absolute', bottom: 100, right: 100, width: 70, height: 70, pointerEvents: 'none', zIndex: 6, opacity: 0.2 }}>
        <svg width="70" height="70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'compassSpin 120s linear infinite' }}>
          <polygon points="50,10 54,45 50,42 46,45" fill="rgba(139,94,60,0.6)" />
          <polygon points="50,90 54,55 50,58 46,55" fill="rgba(139,115,85,0.4)" />
          <polygon points="10,50 45,46 42,50 45,54" fill="rgba(139,115,85,0.4)" />
          <polygon points="90,50 55,46 58,50 55,54" fill="rgba(139,115,85,0.4)" />
          <circle cx="50" cy="50" r="3" fill="rgba(139,94,60,0.6)" />
          <text x="50" y="8" textAnchor="middle" fontSize="9" fill="rgba(139,94,60,0.6)" fontFamily="serif" fontWeight="bold">N</text>
          <text x="50" y="98" textAnchor="middle" fontSize="8" fill="rgba(139,115,85,0.35)" fontFamily="serif">S</text>
          <text x="6" y="53" textAnchor="middle" fontSize="8" fill="rgba(139,94,60,0.35)" fontFamily="serif">W</text>
          <text x="94" y="53" textAnchor="middle" fontSize="8" fill="rgba(139,94,60,0.35)" fontFamily="serif">E</text>
        </svg>
      </div>
      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* Search Bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
        <div className="relative">
          <button onClick={() => setShowSearch(!showSearch)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] z-10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <input
            type="text"
            placeholder="Search countries..."
            value={searchQuery}
            onFocus={() => setShowSearch(true)}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 text-[var(--color-primary)] placeholder-[var(--color-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 shadow-lg"
          />
        </div>
        {showSearch && searchResults.length > 0 && (
          <div className="mt-2 bg-[var(--color-card)] rounded-2xl shadow-xl border border-[var(--color-border)]/30 overflow-hidden animate-fade-in">
            {searchResults.map(r => (
              <button key={r.id} onClick={() => jumpToCountry(r.id, r.name)} className="w-full text-left px-4 py-3 hover:bg-[var(--color-background)] text-sm transition-colors border-b border-[var(--color-border)]/10 last:border-0">
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 left-8 z-30 flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(z * 1.5, 10))} className="w-10 h-10 rounded-xl bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 shadow-lg flex items-center justify-center text-lg font-bold text-[var(--color-primary)] hover:bg-[var(--color-card)] transition-colors">+</button>
        <button onClick={() => setZoom(z => Math.max(z / 1.5, 1))} className="w-10 h-10 rounded-xl bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 shadow-lg flex items-center justify-center text-lg font-bold text-[var(--color-primary)] hover:bg-[var(--color-card)] transition-colors">−</button>
      </div>

      {/* Progress Counter */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 rounded-2xl px-6 py-3 shadow-lg flex items-center gap-3">
        <span className="text-2xl font-bold text-[var(--color-visited)]">{visitedCount}</span>
        <span className="text-[var(--color-secondary)] text-sm">/ {TOTAL_COUNTRIES} countries explored</span>
        <div className="w-24 h-2 bg-[var(--color-border)]/30 rounded-full overflow-hidden ml-2">
          <div className="h-full bg-[var(--color-visited)] rounded-full transition-all duration-700 progress-glow" style={{ width: `${(visitedCount / TOTAL_COUNTRIES) * 100}%` }} />
        </div>
      </div>

      {/* Export Button */}
      <div className="absolute bottom-8 right-8 z-30">
        <button onClick={handleExport} className="bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 rounded-2xl px-5 py-3 shadow-lg text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-card)] transition-colors flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Map
        </button>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="absolute top-20 right-8 z-30 bg-[var(--color-card)]/90 backdrop-blur-md border border-[var(--color-border)]/40 rounded-2xl px-5 py-3 shadow-lg text-sm text-[var(--color-secondary)] animate-fade-in">
          🧭 Scroll to zoom · Drag to pan · Click any country
        </div>
      )}

      {/* Map */}
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 180 }} width={800} height={400} className="w-full h-full">
        <ZoomableGroup zoom={zoom} center={center} onMoveEnd={({ coordinates, zoom: z }: any) => { setCenter(coordinates as [number, number]); setZoom(z); }}>
          <Geographies geography={geoUrl}>
            {({ geographies }: any) => {
              if (geoData.length === 0 && geographies.length > 0) { pendingGeoData.current = geographies; }
              return (
                <>
                  {geographies.map((geo: any) => {
                    const isVisited = !!visitedCountries[geo.id]?.length;
                    const isSelected = selectedCountry?.id === geo.id;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={(e: React.MouseEvent) => {
                          const { NAME, name } = geo.properties;
                          setTooltipContent(NAME || name);
                          setTooltipPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseMove={(e: React.MouseEvent) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setTooltipContent("")}
                        onClick={() => handleCountryClick(geo)}
                        style={{
                          default: {
                            fill: isSelected ? "var(--color-accent)" : isVisited ? "var(--color-visited)" : "var(--color-land)",
                            outline: "none",
                            stroke: "var(--color-border)",
                            strokeWidth: isSelected ? 1.5 : 0.5,
                            transition: "all 0.3s ease"
                          },
                          hover: {
                            fill: isSelected ? "var(--color-accent)" : isVisited ? "#a0714d" : "var(--color-land-hover)",
                            outline: "none",
                            cursor: "pointer",
                            stroke: "var(--color-secondary)",
                            strokeWidth: 1,
                            transition: "all 0.15s ease"
                          },
                          pressed: { fill: "var(--color-accent)", outline: "none", stroke: "var(--color-secondary)", strokeWidth: 1 }
                        }}
                      />
                    );
                  })}
                  {/* Country labels */}
                  {geographies.map((geo: any) => {
                    const centroid = geoCentroid(geo);
                    const { NAME, name } = geo.properties;
                    return (
                      <Marker key={`${geo.rsmKey}-name`} coordinates={centroid}>
                        <text textAnchor="middle" y={1} style={{ fontFamily: "system-ui", fontSize: "1.5px", fill: "#8b7355", pointerEvents: "none", fontWeight: "500" }}>
                          {NAME || name}
                        </text>
                      </Marker>
                    );
                  })}
                  {/* Memory count badges + pulsing beacons */}
                  {geographies.filter((g: any) => (visitedCountries[g.id]?.length || 0) > 0).map((geo: any) => {
                    const centroid = geoCentroid(geo);
                    const count = visitedCountries[geo.id]?.length || 0;
                    return (
                      <Marker key={`${geo.rsmKey}-badge`} coordinates={centroid}>
                        {/* Beacon ring pulse */}
                        <circle r={3} fill="none" stroke="var(--color-accent)" strokeWidth={0.8} opacity={0.6}>
                          <animate attributeName="r" values="3;10;3" dur="3s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <circle r={3} fill="var(--color-accent)" opacity={0.9}>
                          <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <text textAnchor="middle" y={1.2} style={{ fontFamily: "system-ui", fontSize: "2.5px", fill: "#fff", pointerEvents: "none", fontWeight: "700" }}>
                          {count}
                        </text>
                      </Marker>
                    );
                  })}
                </>
              );
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip following cursor */}
      {tooltipContent && (
        <div className="fixed z-50 bg-[var(--color-card)] px-4 py-2 rounded-xl shadow-lg text-sm font-medium pointer-events-none border border-[var(--color-border)]/30" style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}>
          {tooltipContent}
        </div>
      )}

      {/* Sidebar */}
      {selectedCountry && (
        <div className="absolute top-0 right-0 w-[420px] h-full bg-[var(--color-card)] shadow-2xl z-40 flex flex-col animate-slide-in border-l border-[var(--color-border)]/30">
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-border)]/20 flex justify-between items-center bg-[var(--color-background)]">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">{selectedCountry.name}</h2>
              <p className="text-xs text-[var(--color-secondary)] mt-1">{experiences.length} {experiences.length === 1 ? "memory" : "memories"} archived</p>
            </div>
            <button onClick={() => setSelectedCountry(null)} className="w-9 h-9 rounded-xl bg-[var(--color-background)] flex items-center justify-center text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-border)]/30 transition-colors">&times;</button>
          </div>

          <div className="flex-1 overflow-y-auto sidebar-scroll p-6 flex flex-col gap-6">
            {/* Upload Form */}
            <div className="space-y-3 bg-[var(--color-background)] p-5 rounded-2xl border border-[var(--color-border)]/20">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-secondary)]">Add Memory</h3>
              <textarea placeholder="What did you experience here?" value={experienceText} onChange={e => setExperienceText(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 resize-none placeholder-[var(--color-secondary)]/60" rows={3} />
              <input type="date" value={experienceDate} onChange={e => setExperienceDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 text-[var(--color-primary)]" />
              <input type="file" accept="image/*" multiple onChange={e => setSelectedFiles(Array.from(e.target.files || []))}
                className="w-full text-xs text-[var(--color-secondary)] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-border)]/30 file:text-[var(--color-primary)] hover:file:bg-[var(--color-border)]/50" />
              
              {/* Filter Selector */}
              {selectedFiles.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 sidebar-scroll">
                  {FILTERS.map(f => (
                    <button key={f.id} onClick={() => setImageFilter(f.id)} 
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${imageFilter === f.id ? "bg-[var(--color-primary)] text-[var(--color-card)] border-[var(--color-primary)]" : "bg-[var(--color-card)] text-[var(--color-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              )}



              <button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0 || !experienceText}
                className="w-full py-3 rounded-xl bg-[var(--color-visited)] text-white font-medium text-sm disabled:opacity-40 hover:bg-[#7a5234] transition-colors">
                {uploading ? "Uploading to Shelby..." : "Save to Archive"}
              </button>
            </div>

            {/* Gallery */}
            {experiences.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-secondary)]">Memories</h3>
                {/* Carousel */}
                <div className="relative">
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-[var(--color-background)] border border-[var(--color-border)]/20">
                    <ImageWithCid cid={experiences[galleryIdx]?.imageCid} alt={experiences[galleryIdx]?.country || ""} />
                  </div>
                  {experiences.length > 1 && (
                    <>
                      <button onClick={() => setGalleryIdx(i => (i - 1 + experiences.length) % experiences.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm hover:bg-black/60 backdrop-blur-sm">‹</button>
                      <button onClick={() => setGalleryIdx(i => (i + 1) % experiences.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm hover:bg-black/60 backdrop-blur-sm">›</button>
                    </>
                  )}
                  {/* Dots */}
                  {experiences.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                      {experiences.map((_, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === galleryIdx ? "bg-[var(--color-visited)] w-5" : "bg-[var(--color-border)]"}`} />
                      ))}
                    </div>
                  )}
                </div>
                {/* Current entry details */}
                {experiences[galleryIdx] && (
                  <div className="space-y-2 bg-[var(--color-background)] p-4 rounded-2xl border border-[var(--color-border)]/20">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-secondary)]">
                      <span>📅</span>
                      <span>{experiences[galleryIdx].date}</span>
                      <span className="ml-auto text-[10px] font-mono opacity-60">{galleryIdx + 1}/{experiences.length}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-[var(--color-primary)] font-medium leading-relaxed italic border-l-2 border-[var(--color-accent)]/30 pl-3 py-1 bg-[var(--color-background)]/50 rounded-r-lg">
                        &ldquo;{experiences[galleryIdx].text}&rdquo;
                      </p>
                      {experiences[galleryIdx].txHash && (
                        <div className="flex items-center gap-1.5 mt-1 px-2 py-1 bg-[var(--color-visited)]/5 rounded-md border border-[var(--color-visited)]/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-visited)] animate-pulse" />
                          <p className="text-[10px] font-mono text-[var(--color-visited)] opacity-80 truncate">
                            TX: {experiences[galleryIdx].txHash}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {experiences.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3 opacity-40">🗺️</span>
                <p className="text-[var(--color-secondary)] text-sm">No memories yet.<br/>Add your first experience above!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageWithCid({ cid, alt }: { cid: string; alt: string }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => { if (cid) getShelbyUrl(cid).then(setUrl); }, [cid]);
  if (!url) return <div className="w-full h-full animate-pulse bg-[var(--color-border)]/20 flex items-center justify-center text-xs text-[var(--color-secondary)]">Loading...</div>;
  return <Image src={url} alt={alt} fill className="object-cover" unoptimized />;
}

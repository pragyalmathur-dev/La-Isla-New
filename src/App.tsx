import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, ImageOverlay, CircleMarker, Tooltip, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, Layers, Maximize, Navigation, Info, ChevronRight, X, Ruler, Plus, Minus, Move, Menu } from 'lucide-react';

// --- Types ---
interface Villa {
  n: number;
  wd_gf: string;
  wd_ff: string;
  wod_gf: string;
  wod_ff: string;
}

// --- Constants & Config ---
const REPO_BASE = 'https://raw.githubusercontent.com/pragyalmathur-dev/La-Isla/main/';
const ASSET_SITEPLAN = `${REPO_BASE}assets/siteplan.webp`;
const ASSET_VILLAS_JSON = `${REPO_BASE}villas.json`;

// Final Anchor from user calibration
const ANCHOR = { lat: 14.95017, lng: 74.05339 };

// Entry's pixel position in normalized fractions (from original source)
const ENTRY_FRAC = { x: 1660 / 2347, y: 540 / 4044 };
const PLAN_ASPECT = 2347 / 4044;

const metersToLatDeg = (m: number) => m / 111320;
const metersToLngDeg = (m: number, lat: number) => m / (111320 * Math.cos(lat * Math.PI / 180));

const getCenterFromEntry = (entryLat: number, entryLng: number, heightMeters: number, rotDeg: number) => {
  const widthMeters = heightMeters * PLAN_ASPECT;
  const eastOff = (ENTRY_FRAC.x - 0.5) * widthMeters;
  const northOff = (0.5 - ENTRY_FRAC.y) * heightMeters;
  
  const t = rotDeg * Math.PI / 180;
  const cos = Math.cos(t), sin = Math.sin(t);
  const apparentEast = eastOff * cos + northOff * sin;
  const apparentNorth = -eastOff * sin + northOff * cos;
  
  const centerLat = entryLat - apparentNorth / 111320;
  const centerLng = entryLng - apparentEast / (111320 * Math.cos(entryLat * Math.PI / 180));
  
  return { lat: centerLat, lng: centerLng };
};

const getBoundsFromCenter = (centerLat: number, centerLng: number, heightMeters: number) => {
  const halfH = heightMeters / 2;
  const widthMeters = heightMeters * PLAN_ASPECT;
  const halfW = widthMeters / 2;
  const dLat = metersToLatDeg(halfH);
  const dLng = metersToLngDeg(halfW, centerLat);
  return [
    [centerLat - dLat, centerLng - dLng],
    [centerLat + dLat, centerLng + dLng]
  ] as L.LatLngBoundsExpression;
};

export default function App() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [floor, setFloor] = useState<'gf' | 'ff'>('gf');
  const [mode, setMode] = useState<'wd' | 'wod'>('wd');
  const [mapType, setMapType] = useState<'sat' | 'street' | 'hybrid'>('sat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Final Fixed Calibration
  const config = {
    scale: 363.5,
    rotation: -1.95,
    opacity: 0.85,
    anchorLat: ANCHOR.lat,
    anchorLng: ANCHOR.lng
  };

  useEffect(() => {
    fetch(ASSET_VILLAS_JSON)
      .then(r => r.json())
      .then(setVillas)
      .catch(e => console.error("Failed to load villas", e));
  }, []);

  const bounds = useMemo(() => {
    const center = getCenterFromEntry(config.anchorLat, config.anchorLng, config.scale, config.rotation);
    return getBoundsFromCenter(center.lat, center.lng, config.scale);
  }, [config]);

  // Handle image rotation via CSS
  const overlayRef = React.useRef<L.ImageOverlay>(null);
  useEffect(() => {
    if (overlayRef.current) {
      const el = overlayRef.current.getElement();
      if (el) {
        el.style.transformOrigin = 'center center';
        const currentTransform = el.style.transform.split('rotate')[0];
        el.style.transform = `${currentTransform} rotate(${config.rotation}deg)`;
      }
    }
  }, [bounds, config.rotation, mapType]);

  const villaPlanUrl = useMemo(() => {
    if (!selectedVilla) return '';
    const key = `${mode}_${floor}` as keyof Villa;
    const path = selectedVilla[key] as string;
    return path.replace('./', REPO_BASE);
  }, [selectedVilla, floor, mode]);

  return (
    <div className="flex h-screen w-full bg-[#f6f2ea] text-[#2f3a30] font-sans selection:bg-[#6b8e64]/30 overflow-hidden relative">
      {/* Mobile Header */}
      <header className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-[#e3dcce] z-40 flex items-center justify-between px-4">
        <h1 className="text-sm font-serif tracking-[0.2em] text-[#4a6b43] uppercase font-bold">
          LA ISLA <span className="text-[#b48a4f]">·</span> SITE MAP
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-[#e9efe5] rounded-lg transition-colors text-[#4a6b43]"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-[280px] sm:w-[320px] bg-white border-r border-[#e3dcce] shadow-2xl lg:shadow-lg flex flex-col z-[60] transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <header className="p-6 border-b border-[#e3dcce] bg-linear-to-b from-[#fbf8f1] to-white relative">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-1 text-[#8a8676] hover:text-[#4a6b43] transition-colors"
          >
            <X size={20} />
          </button>
          <h1 className="text-xl font-serif tracking-widest text-[#4a6b43] items-center uppercase font-bold hidden lg:flex">
            LA ISLA <span className="mx-2 text-[#b48a4f] font-light">·</span> SITE MAP
          </h1>
          <h1 className="text-lg font-serif tracking-widest text-[#4a6b43] flex lg:hidden items-center uppercase font-bold">
            LA ISLA
          </h1>
          <p className="text-[10px] text-[#8a8676] mt-1 tracking-wider uppercase font-medium">
            Architectural Planning & Floor Plans
          </p>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Map Controls */}
          <section className="p-5 border-b border-[#e3dcce]">
            <h2 className="text-[10px] font-bold text-[#8a8676] uppercase tracking-[0.2em] mb-4">View Controls</h2>
            <div className="flex bg-[#f1ece1] p-1 rounded-lg mb-4">
              {['sat', 'street', 'hybrid'].map((t) => (
                <button
                  key={t}
                  onClick={() => setMapType(t as any)}
                  className={`flex-1 py-2 lg:py-1.5 text-xs font-semibold rounded-md transition-all ${
                    mapType === t ? 'bg-[#6b8e64] text-white shadow-sm' : 'text-[#4a5249] hover:bg-white/50'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#fbf8f1] rounded border border-[#e3dcce]">
                <Navigation size={16} className="text-[#6b8e64]" />
                <div>
                    <p className="text-[9px] text-[#8a8676] uppercase font-bold tracking-widest">Site entry</p>
                    <p className="text-[11px] font-mono text-[#4a5249]">{ANCHOR.lat.toFixed(5)}°N, {ANCHOR.lng.toFixed(5)}°E</p>
                </div>
            </div>
          </section>

          {/* Villa Grid */}
          <section className="p-5">
            <h2 className="text-[10px] font-bold text-[#8a8676] uppercase tracking-[0.2em] mb-4">Select Villa</h2>
            <div className="grid grid-cols-5 xs:grid-cols-6 gap-2">
              {Array.from({ length: 48 }, (_, i) => i + 1).map((n) => {
                const villa = villas.find(v => v.n === n);
                const isMissing = n === 13 || !villa;
                return (
                  <button
                    key={n}
                    disabled={isMissing}
                    onClick={() => {
                      if (villa) {
                        setSelectedVilla(villa);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }
                    }}
                    className={`aspect-square flex items-center justify-center text-[11px] lg:text-[10px] font-mono font-bold rounded border transition-all min-h-[44px] lg:min-h-0 ${
                      isMissing 
                        ? 'opacity-20 cursor-not-allowed bg-[#f1ece1]' 
                        : selectedVilla?.n === n
                          ? 'bg-[#4a6b43] text-white border-[#4a6b43] shadow-md transform scale-105'
                          : 'bg-white border-[#e3dcce] hover:border-[#6b8e64] hover:bg-[#e9efe5] text-[#4a5249]'
                    }`}
                  >
                    {n.toString().padStart(2, '0')}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#8a8676] mt-4 leading-relaxed italic">
              * Select a villa to view technical floor plans, dimensions and artistic perspectives.
            </p>
          </section>
        </div>

        <footer className="p-4 border-t border-[#e3dcce] bg-[#f1ece1] text-[9px] text-[#8a8676] leading-normal uppercase tracking-widest text-center font-medium">
            Project Visualization Layer
        </footer>
      </aside>

      {/* Map Area */}
      <main className="flex-1 relative z-10 pt-16 lg:pt-0">
        <MapContainer 
          center={[ANCHOR.lat, ANCHOR.lng]} 
          zoom={18} 
          className="h-full w-full bg-[#f1ece1]"
          zoomControl={false}
        >
          {mapType === 'sat' && (
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
          )}
          {mapType === 'street' && (
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
          )}
          {mapType === 'hybrid' && (
            <>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" opacity={0.6} />
            </>
          )}

          <ImageOverlay
            ref={overlayRef}
            url={ASSET_SITEPLAN}
            bounds={bounds}
            opacity={config.opacity}
            zIndex={100}
          />

          <CircleMarker 
            center={[config.anchorLat, config.anchorLng]} 
            radius={8} 
            pathOptions={{ fillColor: '#4ec3a5', color: 'white', weight: 2, fillOpacity: 1 }}
          >
            <Tooltip permanent={false}>Site Entry Gate</Tooltip>
          </CircleMarker>

          {/* Compass */}
          <div className="absolute top-6 right-6 w-16 h-16 bg-white/90 backdrop-blur rounded-full border border-[#cdc3b1] shadow-xl z-[1000] flex flex-col items-center justify-center">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#6b8e64] -mt-1 mb-1" />
            <span className="font-serif font-bold text-sm text-[#4a6b43]">N</span>
            <div className="w-0.5 h-2 bg-[#cdc3b1] mt-1" />
          </div>
        </MapContainer>
      </main>

      {/* Villa Modal */}
      <AnimatePresence>
        {selectedVilla && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#2f3a30]/50 lg:backdrop-blur-none backdrop-blur-sm"
            onClick={() => setSelectedVilla(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full lg:h-auto max-h-[95vh] lg:max-h-[90vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[#e3dcce] bg-linear-to-b from-[#fbf8f1] to-white">
                <h3 className="text-xl lg:text-2xl font-serif text-[#4a6b43]">Villa {selectedVilla.n.toString().padStart(2, '0')}</h3>
                <button 
                  onClick={() => setSelectedVilla(null)}
                  className="p-2 hover:bg-[#e9efe5] rounded-full transition-colors text-[#8a8676]"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-[#f1ece1] p-2 lg:p-4 flex flex-col sm:flex-row items-center justify-between gap-2 lg:gap-4 border-b border-[#e3dcce]">
                <div className="flex w-full sm:w-auto gap-1 bg-white p-1 rounded-lg shadow-sm">
                  <button 
                    onClick={() => setFloor('gf')}
                    className={`flex-1 sm:flex-none px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-md transition-all ${floor === 'gf' ? 'bg-[#6b8e64] text-white' : 'text-[#4a5249] hover:bg-[#e9efe5]'}`}
                  >
                    Ground
                  </button>
                  <button 
                    onClick={() => setFloor('ff')}
                    className={`flex-1 sm:flex-none px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-md transition-all ${floor === 'ff' ? 'bg-[#6b8e64] text-white' : 'text-[#4a5249] hover:bg-[#e9efe5]'}`}
                  >
                    1st Floor
                  </button>
                </div>

                <div className="flex w-full sm:w-auto gap-1 bg-white p-1 rounded-lg shadow-sm">
                  <button 
                    onClick={() => setMode('wd')}
                    className={`flex-1 sm:flex-none px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-md transition-all ${mode === 'wd' ? 'bg-[#b48a4f] text-white' : 'text-[#4a5249] hover:bg-[#e9efe5]'}`}
                  >
                    With Dimensions
                  </button>
                  <button 
                    onClick={() => setMode('wod')}
                    className={`flex-1 sm:flex-none px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-md transition-all ${mode === 'wod' ? 'bg-[#b48a4f] text-white' : 'text-[#4a5249] hover:bg-[#e9efe5]'}`}
                  >
                    Without Dimensions
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-[#f1ece1] p-4 lg:p-8 flex items-center justify-center">
                {villaPlanUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={villaPlanUrl} 
                      alt={`Villa ${selectedVilla.n} ${floor} ${mode}`} 
                      className="max-w-full max-h-full w-auto h-auto object-contain bg-white shadow-xl rounded lg:p-4 cursor-zoom-in"
                      onClick={() => window.open(villaPlanUrl, '_blank')}
                    />
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Info className="mx-auto text-[#cdc3b1] mb-2" size={48} />
                    <p className="text-[#8a8676]">Floor plan for this selection is being updated.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-[#e3dcce] flex justify-between text-[10px] text-[#8a8676] font-medium tracking-widest uppercase">
                <span>La Isla / Architectural Planning</span>
                <span>Click image to view in high resolution</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e3dcce; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b8e64; }
        
        .leaflet-container { font-family: inherit !important; }
        .siteplan-img { transition: opacity 0.3s ease; filter: contrast(1.1) brightness(1.05); pointer-events: none; }
      `}} />
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, ImageOverlay, CircleMarker, Tooltip, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, Layers, Maximize, Navigation, Info, ChevronRight, X, Ruler, Plus, Minus, Move, Menu, LogOut } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";

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

const PROJECT_RENDERS: Record<string, string | string[]> = {
  'Aerial View': '/assets/aerial_view.jpg',
  '2 BHK': [
    '/assets/2bhk_balcony.jpg',
    '/assets/2bhk_exterior.jpg',
    '/assets/2bhk_facade.jpg'
  ],
  '3 BHK': [
    '/assets/3bhk_ext_1.jpg',
    '/assets/3bhk_terrace.jpg',
    '/assets/3bhk_ext_2.jpg'
  ],
  '4 BHK': [
    '/assets/4bhk_exterior.jpg',
    '/assets/4bhk_facade.jpg',
    '/assets/4bhk_balcony.jpg',
    '/assets/4bhk_terrace.jpg'
  ]
};

// Final Anchor from user calibration
const ANCHOR = { lat: 14.95017, lng: 74.05339 };

const BEACH_LOC = { lat: 14.961497, lng: 74.048541 };
const XANDREM_BEACH_LOC = { lat: 14.939333, lng: 74.045792 };
const TOLIVIA_BEACH_LOC = { lat: 14.934657, lng: 74.047156 };
const TALPONA_BEACH_LOC = { lat: 14.976814, lng: 74.042358 };
const NIRAKAR_GROUND_LOC = { lat: 14.948755, lng: 74.056363 };
const SCHOOL_LOC = { lat: 14.948146, lng: 74.056558 };
const NIRAKAR_HIGH_SCHOOL_LOC = { lat: 14.960280, lng: 74.055549 };
const CHURCH_LOC = { lat: 14.964358, lng: 74.048235 };
const HAVANA_LOC = { lat: 14.962635, lng: 74.052656 };
const CASA_JAALI_LOC = { lat: 14.999068, lng: 74.028544 };
const COTIGAO_LOC = { lat: 14.965751, lng: 74.195798 };
const MUDAGERI_FALLS_LOC = { lat: 14.904467, lng: 74.132291 };
const ZEST_LOC = { lat: 14.998365, lng: 74.033299 };
const LALIT_LOC = { lat: 14.991451, lng: 74.042100 };
const NH66_LABEL_LOC = { lat: 14.951625, lng: 74.054830 };
const NH66_LABEL_LOC_2 = { lat: 14.993460, lng: 74.043818 };
const NH66_LABEL_LOC_3 = { lat: 14.973003, lng: 74.046446 };
const NH66_LABEL_LOC_4 = { lat: 14.922651, lng: 74.075744 };

const BORDER_PATH: L.LatLngExpression[] = [
  [14.900215, 74.085037],
  [14.902114, 74.087173],
  [14.902897, 74.087784],
  [14.903445, 74.088193],
  [14.903439, 74.090275],
  [14.910986, 74.094491],
  [14.915798, 74.101614],
  [14.912912, 74.104792],
  [14.914191, 74.107340],
  [14.913965, 74.108513]
];

const GOA_LABEL_LOC = { lat: 14.9125, lng: 74.0940 };
const KARNATAKA_LABEL_LOC = { lat: 14.9095, lng: 74.0955 };

// Custom Blue Pin Icon
const beachIcon = L.divIcon({
  className: 'bg-transparent',
  html: `
    <div class="relative flex flex-col items-center">
      <div class="absolute w-8 h-8 bg-[#094f39] rounded-full opacity-30 animate-ping -mt-1"></div>
      <div class="relative w-7 h-7 bg-[#094f39] rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const NH66_PATH: L.LatLngExpression[] = [
  [15.050960, 74.022532],
  [15.048075, 74.024836],
  [15.047873, 74.025682],
  [15.047792, 74.026346],
  [15.047520, 74.026423],
  [15.046730, 74.025494],
  [15.046003, 74.025593],
  [15.045190, 74.025391],
  [15.044726, 74.025841],
  [15.042171, 74.026158],
  [15.036641, 74.030524],
  [15.035473, 74.030332],
  [15.031756, 74.033324],
  [15.026775, 74.033262],
  [15.020331, 74.033406],
  [15.016787, 74.035036],
  [15.012821, 74.037148],
  [15.006891, 74.038025],
  [14.998919, 74.040851],
  [14.999300, 74.040818],
  [14.997130, 74.041197],
  [14.995434, 74.041387],
  [14.994248, 74.042436],
  [14.993460, 74.043818],
  [14.991909, 74.047785],
  [14.991181, 74.048590],
  [14.990344, 74.049161],
  [14.988018, 74.049324],
  [14.984476, 74.049432],
  [14.983475, 74.049084],
  [14.982716, 74.048272],
  [14.981217, 74.046049],
  [14.980799, 74.045478],
  [14.980041, 74.044753],
  [14.979198, 74.044278],
  [14.979055, 74.044277],
  [14.978316, 74.044323],
  [14.976034, 74.045275],
  [14.971480, 74.047073],
  [14.967998, 74.048422],
  [14.964538, 74.049770],
  [14.962011, 74.050822],
  [14.960394, 74.051536],
  [14.958993, 74.052814],
  [14.957011, 74.055316],
  [14.957332, 74.054904],
  [14.956745, 74.055615],
  [14.956420, 74.055996],
  [14.956013, 74.056480],
  [14.955945, 74.056580],
  [14.955730, 74.056806],
  [14.955531, 74.057035],
  [14.955363, 74.057204],
  [14.955115, 74.057284],
  [14.954898, 74.057297],
  [14.954368, 74.057247],
  [14.954115, 74.057120],
  [14.953637, 74.056440],
  [14.953210, 74.055530],
  [14.952898, 74.054928],
  [14.952571, 74.054678],
  [14.952291, 74.054635],
  [14.951996, 74.054666],
  [14.951681, 74.054775],
  [14.951437, 74.054899],
  [14.950878, 74.055345],
  [14.950129, 74.055971],
  [14.949078, 74.056832],
  [14.947464, 74.058170],
  [14.946692, 74.058774],
  [14.946282, 74.058969],
  [14.945855, 74.059145],
  [14.945386, 74.059274],
  [14.944530, 74.059431],
  [14.938599, 74.060378],
  [14.940930, 74.060019],
  [14.930026, 74.061705],
  [14.929269, 74.062505],
  [14.929540, 74.063538],
  [14.931545, 74.065868],
  [14.931653, 74.066491],
  [14.931526, 74.067317],
  [14.931010, 74.067672],
  [14.929081, 74.068105],
  [14.927965, 74.068669],
  [14.927486, 74.069118],
  [14.924226, 74.074348],
  [14.923353, 74.075266],
  [14.919579, 74.077336],
  [14.918254, 74.078087],
  [14.916584, 74.080430]
];

// Road Coordinates (Finetuned based on visual alignment in screenshots)
const ENTRY_ROAD_PATH: L.LatLngExpression[] = [
  [14.950220, 74.053487],
  [14.950326, 74.053734],
  [14.950404, 74.053942],
  [14.950486, 74.054136],
  [14.950596, 74.054340],
  [14.950712, 74.054538],
  [14.950819, 74.054747],
  [14.950895, 74.054915],
  [14.951028, 74.055109]
];

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

import { ALLOWED_EMAILS } from './constants';

export default function App() {
  const [emailInput, setEmailInput] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('vianaar_auth_email'));
  const [accessDenied, setAccessDenied] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalizedEmail = emailInput.toLowerCase().trim();
    if (ALLOWED_EMAILS.includes(normalizedEmail)) {
      setUserEmail(normalizedEmail);
      localStorage.setItem('vianaar_auth_email', normalizedEmail);
      setAccessDenied(false);
    } else {
      setAccessDenied(true);
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem('vianaar_auth_email');
    setEmailInput('');
  };

  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [selectedRender, setSelectedRender] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [floor, setFloor] = useState<'gf' | 'ff'>('gf');
  const [mode, setMode] = useState<'wd' | 'wod'>('wd');
  const [mapType, setMapType] = useState<'sat' | 'street' | 'hybrid'>('sat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  
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

  if (!userEmail) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f1ece1] p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-[#094f39]/10"
        >
          <div className="mb-6 flex justify-center">
             <div className="w-16 h-16 bg-[#094f39]/10 rounded-full flex items-center justify-center">
                <MapIcon className="w-8 h-8 text-[#094f39]" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-[#094f39] mb-2 leading-tight uppercase tracking-widest text-[20px]">Confidential Map</h1>
          <section className="mb-4 p-4 bg-[#f8f9f8] rounded-2xl border border-gray-50">
            <p className="text-gray-600 leading-relaxed text-sm">
              {accessDenied 
                ? "Access denied. Only @vianaar.com email accounts are authorized to view this map."
                : "This is a confidential architectural resource. Please enter your company email to proceed."}
            </p>
          </section>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={`w-full px-5 py-4 rounded-xl border ${accessDenied ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#094f39]/20 transition-all text-gray-800`}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#094f39] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#073d2c] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#094f39]/20 cursor-pointer mb-4"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Vianaar Internal Security
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f6f2ea] text-[#2f3a30] font-mulish font-light selection:bg-[#6b8e64]/30 overflow-hidden relative">
      {/* Mobile Header */}
      <header className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-[#e3dcce] z-40 flex items-center justify-between px-4">
        <h1 className="text-sm font-cardo tracking-[0.2em] text-[#4a6b43] uppercase font-bold">
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
          <h1 className="text-xl font-cardo tracking-widest text-[#4a6b43] items-center uppercase font-bold hidden lg:flex">
            LA ISLA <span className="mx-2 text-[#b48a4f] font-light">·</span> SITE MAP
          </h1>
          <h1 className="text-lg font-cardo tracking-widest text-[#4a6b43] flex lg:hidden items-center uppercase font-bold">
            LA ISLA
          </h1>
          <p className="text-[10px] text-[#8a8676] mt-1 tracking-wider uppercase font-medium">
            Architectural Planning & Floor Plans
          </p>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* To Site Action */}
          <section className="p-5 border-b border-[#e3dcce]">
            <button 
              onClick={() => {
                if (map) {
                  map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
                }
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#6b8e64] text-white rounded-lg shadow-lg hover:bg-[#4a6b43] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Maximize size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">To Site</span>
            </button>
          </section>

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

          {/* Renders Section */}
          <section className="p-5 border-t border-[#e3dcce]">
            <h2 className="text-[10px] font-bold text-[#8a8676] uppercase tracking-[0.2em] mb-4">Project Renders</h2>
            <div className="grid grid-cols-2 gap-2">
              {['Aerial View', '2 BHK', '3 BHK', '4 BHK'].map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedRender(name);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`py-3 px-2 text-[10px] font-bold rounded border transition-all flex items-center justify-between group ${
                    selectedRender === name
                      ? 'bg-[#4a6b43] text-white border-[#4a6b43] shadow-md'
                      : 'bg-white border-[#e3dcce] hover:border-[#6b8e64] hover:bg-[#e9efe5] text-[#4a5249]'
                  }`}
                >
                  <span className="uppercase tracking-wider">{name}</span>
                  <ChevronRight size={14} className={selectedRender === name ? 'text-white/70' : 'text-[#cdc3b1] group-hover:text-[#6b8e64]'} />
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="p-4 border-t border-[#e3dcce] bg-[#f1ece1] text-[9px] text-[#8a8676] leading-normal uppercase tracking-widest text-center font-medium">
            Project Visualization Layer
        </footer>
      </aside>

      {/* Map Area */}
      <main className="flex-1 relative z-10 pt-16 lg:pt-0">
        <MapContainer 
          ref={setMap}
          center={[ANCHOR.lat, ANCHOR.lng]} 
          zoom={18} 
          className="h-full w-full bg-[#f1ece1]"
          zoomControl={false}
          attributionControl={false}
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

          <Polyline 
            positions={NH66_PATH} 
            pathOptions={{ color: '#f4f6fc', weight: 6, opacity: 0.8 }}
          />

          <Marker 
            position={[NH66_LABEL_LOC.lat, NH66_LABEL_LOC.lng]}
            icon={L.divIcon({ className: 'bg-transparent', iconSize: [1, 1] })}
          >
            <Tooltip permanent={true} direction="top" className="custom-tooltip">
              NH66
            </Tooltip>
          </Marker>

          <Marker 
            position={[NH66_LABEL_LOC_2.lat, NH66_LABEL_LOC_2.lng]}
            icon={L.divIcon({ className: 'bg-transparent', iconSize: [1, 1] })}
          >
            <Tooltip permanent={true} direction="top" className="custom-tooltip">
              NH66
            </Tooltip>
          </Marker>

          <Marker 
            position={[NH66_LABEL_LOC_3.lat, NH66_LABEL_LOC_3.lng]}
            icon={L.divIcon({ className: 'bg-transparent', iconSize: [1, 1] })}
          >
            <Tooltip permanent={true} direction="top" className="custom-tooltip">
              NH66
            </Tooltip>
          </Marker>

          <Marker 
            position={[NH66_LABEL_LOC_4.lat, NH66_LABEL_LOC_4.lng]}
            icon={L.divIcon({ className: 'bg-transparent', iconSize: [1, 1] })}
          >
            <Tooltip permanent={true} direction="top" className="custom-tooltip">
              NH66
            </Tooltip>
          </Marker>

          <Polyline 
            positions={ENTRY_ROAD_PATH} 
            pathOptions={{ color: '#f4f6fc', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
          />

          <Marker 
            position={[14.9506, 74.0544]}
            icon={L.divIcon({ className: 'bg-transparent', iconSize: [1, 1] })}
          >
            <Tooltip permanent={true} direction="top" className="custom-tooltip">
              Access Road
            </Tooltip>
          </Marker>

          <Marker 
            position={[BEACH_LOC.lat, BEACH_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Galgibaga Beach</div>
                <div>5 Mins Drive</div>
                <div>3 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[XANDREM_BEACH_LOC.lat, XANDREM_BEACH_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Xandrem Beach</div>
                <div>10 Min Drive</div>
                <div>3.8 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[TOLIVIA_BEACH_LOC.lat, TOLIVIA_BEACH_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Tolivia Beach</div>
                <div>9 Min Drive</div>
                <div>3.7 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[TALPONA_BEACH_LOC.lat, TALPONA_BEACH_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Talpona Beach</div>
                <div>7 Mins Drive</div>
                <div>4 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[LALIT_LOC.lat, LALIT_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>The Lalit Golf & Spa Resort</div>
                <div>11 Mins Drive</div>
                <div>7 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[NIRAKAR_GROUND_LOC.lat, NIRAKAR_GROUND_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Nirakar Cricket Ground</div>
                <div>1 Min Drive</div>
                <div>450 M Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[SCHOOL_LOC.lat, SCHOOL_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>S S Angle Higher Secondary School</div>
                <div>1 Min Drive</div>
                <div>700 M Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[NIRAKAR_HIGH_SCHOOL_LOC.lat, NIRAKAR_HIGH_SCHOOL_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Nirakar High School</div>
                <div>3 Min Drive</div>
                <div>1.8 Km Away</div>
              </div>
            </Tooltip>
          </Marker>
          
          <Marker 
            position={[CHURCH_LOC.lat, CHURCH_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Church of St Anthony of Lisbon</div>
                <div>5 Min Drive</div>
                <div>2.6 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[HAVANA_LOC.lat, HAVANA_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Havana Bar & Restaurant</div>
                <div>4 Mins Drive</div>
                <div>2 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[CASA_JAALI_LOC.lat, CASA_JAALI_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Casa Jaali (Cafe)</div>
                <div>13 Min Drive</div>
                <div>8.5 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <Marker 
            position={[COTIGAO_LOC.lat, COTIGAO_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              Cotigao Wildlife Sanctuary
            </Tooltip>
          </Marker>

          <Marker 
            position={[MUDAGERI_FALLS_LOC.lat, MUDAGERI_FALLS_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              Mudageri Falls
            </Tooltip>
          </Marker>

          <Marker 
            position={[ZEST_LOC.lat, ZEST_LOC.lng]} 
            icon={beachIcon}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -32]} className="custom-tooltip">
              <div className="text-center">
                <div>Zest (Cafe & Bar)</div>
                <div>11 Min Drive</div>
                <div>7.8 Km Away</div>
              </div>
            </Tooltip>
          </Marker>

          <CircleMarker 
            center={[config.anchorLat, config.anchorLng]} 
            radius={8} 
            pathOptions={{ fillColor: '#4ec3a5', color: 'white', weight: 2, fillOpacity: 1 }}
          >
            <Tooltip permanent={false}>Site Entry Gate</Tooltip>
          </CircleMarker>

          {/* Border between Goa and Karnataka */}
          <Polyline 
            positions={BORDER_PATH} 
            pathOptions={{ color: '#ffffff', weight: 6, opacity: 0.8, dashArray: '10, 15' }}
          />

          <Marker 
            position={[GOA_LABEL_LOC.lat, GOA_LABEL_LOC.lng]}
            icon={L.divIcon({ 
              className: 'bg-transparent', 
              html: '<div class="text-white font-cardo text-[10px] font-bold tracking-[0.4em] opacity-70 select-none pointer-events-none">GOA</div>',
              iconSize: [100, 20],
              iconAnchor: [50, 10]
            })}
          />

          <Marker 
            position={[KARNATAKA_LABEL_LOC.lat, KARNATAKA_LABEL_LOC.lng]}
            icon={L.divIcon({ 
              className: 'bg-transparent', 
              html: '<div class="text-white font-cardo text-[10px] font-bold tracking-[0.4em] opacity-70 select-none pointer-events-none">KARNATAKA</div>',
              iconSize: [200, 20],
              iconAnchor: [100, 10]
            })}
          />

        </MapContainer>

        {/* Map Interaction Hint */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-[#e3dcce] shadow-2xl max-w-[220px] pointer-events-none sm:pointer-events-auto">
          <div className="flex gap-3 items-start">
            <div className="p-1.5 bg-[#e9efe5] rounded-full text-[#4a6b43] mt-0.5">
              <Info size={14} />
            </div>
            <p className="text-[10px] text-[#4a5249] leading-relaxed font-semibold">
              To view the location names, hover over them with your cursor. On mobile, simply tap the location.
            </p>
          </div>
        </div>
      </main>

        {/* Villa Modal */}
        <AnimatePresence>
          {selectedVilla && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2f3a30]/50 lg:backdrop-blur-none backdrop-blur-sm"
              onClick={() => setSelectedVilla(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex-none flex items-center justify-between p-4 lg:p-6 border-b border-[#e3dcce] bg-linear-to-b from-[#fbf8f1] to-white">
                  <h3 className="text-xl lg:text-2xl font-cardo text-[#4a6b43]">Villa {selectedVilla.n.toString().padStart(2, '0')}</h3>
                  <button 
                    onClick={() => setSelectedVilla(null)}
                    className="p-2 hover:bg-[#e9efe5] rounded-full transition-colors text-[#8a8676]"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-none bg-[#f1ece1] p-2 lg:p-4 border-b border-[#e3dcce]">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4">
                    <div className="flex w-full sm:w-auto gap-1 bg-white p-1 rounded-lg shadow-sm">
                      <button 
                        onClick={() => setFloor('gf')}
                        className={`flex-1 sm:flex-none px-4 lg:px-6 py-2 text-[10px] lg:text-xs font-bold rounded-md transition-all ${floor === 'gf' ? 'bg-[#6b8e64] text-white' : 'text-[#4a5249] hover:bg-[#e9efe5]'}`}
                      >
                        Ground Floor
                      </button>
                      <button 
                        onClick={() => setFloor('ff')}
                        className={`flex-1 sm:flex-none px-4 lg:px-6 py-2 text-[10px] lg:text-xs font-bold rounded-md transition-all ${floor === 'ff' ? 'bg-[#6b8e64] text-white' : 'text-[#4a5249] hover:bg-[#e9efe5]'}`}
                      >
                        First Floor
                      </button>
                    </div>

                    <div className="flex w-full sm:w-auto gap-1 bg-white p-1 rounded-lg shadow-sm">
                      <button 
                        onClick={() => setMode('wd')}
                        className={`flex-1 sm:flex-none px-4 lg:px-6 py-2 text-[10px] lg:text-xs font-bold rounded-md transition-all ${mode === 'wd' ? 'bg-[#b48a4f] text-white' : 'text-[#4a5249] hover:bg-[#e9efe5]'}`}
                      >
                        With Dimensions
                      </button>
                      <button 
                        onClick={() => setMode('wod')}
                        className={`flex-1 sm:flex-none px-4 lg:px-6 py-2 text-[10px] lg:text-xs font-bold rounded-md transition-all ${mode === 'wod' ? 'bg-[#b48a4f] text-white' : 'text-[#4a5249] hover:bg-[#e9efe5]'}`}
                      >
                        Without Dimensions
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0 bg-[#f1ece1] relative overflow-hidden flex items-center justify-center p-4 lg:p-8">
                  {villaPlanUrl ? (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <img 
                        src={villaPlanUrl} 
                        alt={`Villa ${selectedVilla.n} ${floor} ${mode}`} 
                        className="max-w-[95%] max-h-[95%] object-contain bg-white shadow-2xl rounded lg:p-4 cursor-zoom-in transition-all duration-300"
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

                <div className="flex-none p-4 bg-white border-t border-[#e3dcce] flex justify-between text-[10px] text-[#8a8676] font-medium tracking-widest uppercase">
                  <span>La Isla / Architectural Planning</span>
                  <span>Click image to view in high resolution</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Modal */}
        <AnimatePresence>
          {selectedRender && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2f3a30]/50 lg:backdrop-blur-none backdrop-blur-sm"
              onClick={() => setSelectedRender(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex-none flex items-center justify-between p-4 lg:p-6 border-b border-[#e3dcce] bg-linear-to-b from-[#fbf8f1] to-white">
                  <div className="flex flex-col">
                    <h3 className="text-xl lg:text-2xl font-cardo text-[#4a6b43]">{selectedRender}</h3>
                    {Array.isArray(PROJECT_RENDERS[selectedRender]) && (
                      <p className="text-[10px] text-[#8a8676] uppercase tracking-widest font-bold mt-1">
                        Perspective {activeImageIndex + 1} of {(PROJECT_RENDERS[selectedRender] as string[]).length}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedRender(null);
                      setActiveImageIndex(0);
                    }}
                    className="p-2 hover:bg-[#e9efe5] rounded-full transition-colors text-[#8a8676]"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 min-h-0 bg-[#f1ece1] relative overflow-hidden flex items-center justify-center p-4 lg:p-8">
                  {PROJECT_RENDERS[selectedRender] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <div className="flex-1 w-full min-h-0 flex items-center justify-center relative group">
                        {Array.isArray(PROJECT_RENDERS[selectedRender]) ? (
                          <>
                            <img 
                              key={activeImageIndex}
                              src={(PROJECT_RENDERS[selectedRender] as string[])[activeImageIndex]} 
                              alt={`${selectedRender} - ${activeImageIndex + 1}`} 
                              className="max-w-[95%] max-h-[95%] object-contain bg-white shadow-2xl rounded p-1 lg:p-2 cursor-zoom-in transition-all duration-300"
                              onClick={() => window.open((PROJECT_RENDERS[selectedRender] as string[])[activeImageIndex], '_blank')}
                            />
                            
                            {(PROJECT_RENDERS[selectedRender] as string[]).length > 1 && (
                              <>
                                <button 
                                  onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : (PROJECT_RENDERS[selectedRender] as string[]).length - 1))}
                                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-xl text-[#4a6b43] transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
                                >
                                  <ChevronRight size={24} className="rotate-180" />
                                </button>
                                <button 
                                  onClick={() => setActiveImageIndex(prev => (prev < (PROJECT_RENDERS[selectedRender] as string[]).length - 1 ? prev + 1 : 0))}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-xl text-[#4a6b43] transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
                                >
                                  <ChevronRight size={24} />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <img 
                            src={PROJECT_RENDERS[selectedRender] as string} 
                            alt={selectedRender} 
                            className="max-w-[95%] max-h-[95%] object-contain bg-white shadow-2xl rounded p-1 lg:p-2 cursor-zoom-in transition-all duration-300"
                            onClick={() => window.open(PROJECT_RENDERS[selectedRender] as string, '_blank')}
                          />
                        )}
                      </div>

                      {Array.isArray(PROJECT_RENDERS[selectedRender]) && (PROJECT_RENDERS[selectedRender] as string[]).length > 1 && (
                        <div className="flex-none flex gap-3 overflow-x-auto pb-4 max-w-full px-4 scroll-smooth">
                          {(PROJECT_RENDERS[selectedRender] as string[]).map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`flex-none w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                                activeImageIndex === idx ? 'border-[#4a6b43] scale-105 shadow-lg' : 'border-white hover:border-[#cdc3b1] opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4">
                      <div className="relative group cursor-zoom-in w-full flex justify-center">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors rounded"></div>
                        {/* Placeholder until user uploads actual renders */}
                        <div className="w-full max-w-4xl aspect-video bg-white shadow-2xl rounded flex flex-col items-center justify-center border-2 border-dashed border-[#cdc3b1] p-6 lg:p-12 text-center mx-4">
                          <div className="w-12 h-12 lg:w-20 lg:h-20 bg-[#e9efe5] rounded-full flex items-center justify-center mb-4 lg:mb-6 text-[#4a6b43]">
                            <Maximize size={40} className="w-8 h-8 lg:w-10 lg:h-10" />
                          </div>
                          <h4 className="text-2xl font-cardo text-[#4a6b43] mb-4">{selectedRender} Perspective</h4>
                          <p className="max-w-md text-[#8a8676] leading-relaxed mb-8">
                            The artistic visualization for <span className="font-bold">{selectedRender}</span> is currently being prepared for the high-resolution viewer.
                          </p>
                          <div className="flex gap-4">
                            <div className="px-5 py-2 bg-[#f6f2ea] rounded-full text-[10px] font-bold text-[#8a8676] uppercase tracking-widest border border-[#e3dcce]">
                              Pending Assets
                            </div>
                            <div className="px-5 py-2 bg-[#6b8e64] rounded-full text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
                              Ready for Upload
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-none p-4 bg-white border-t border-[#e3dcce] flex justify-between text-[10px] text-[#8a8676] font-medium tracking-widest uppercase">
                  <span>La Isla / Project Visualization</span>
                  <span>Artist's Impression</span>
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
        
        .leaflet-container { font-family: "Mulish", sans-serif !important; font-weight: 300; }
        .siteplan-img { transition: opacity 0.3s ease; filter: contrast(1.1) brightness(1.05); pointer-events: none; }
        
        .custom-tooltip {
          background-color: white !important;
          border: 1px solid #094f39 !important;
          color: #094f39 !important;
          font-family: "Mulish", sans-serif !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          font-size: 10px !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        }
        .custom-tooltip::before { border-top-color: #094f39 !important; }
      `}} />
      <Analytics />
      <SpeedInsights />
      
      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="fixed top-4 right-4 z-[2000] bg-white p-3 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
        title="Logout"
      >
        <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
      </button>
    </div>
  );
}

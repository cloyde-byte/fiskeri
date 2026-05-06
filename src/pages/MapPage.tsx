import { useState, useRef, useEffect } from 'react';
import { Map, Overlay, GeoJson } from 'pigeon-maps';
import { Wind, Thermometer, Droplets, Navigation, Star, MapPin, Fish, AlertTriangle, Plus, Minus, Search, X } from 'lucide-react';
import { fishingSpots, protectedZones } from '../data/spots';
import { getFishById } from '../data/fish';
import { useAuth } from '../context/AuthContext';
import type { FishingSpot, WeatherData } from '../types';

const MOCK_WEATHER: WeatherData = {
  location: 'Sjælland',
  temp: 13,
  windSpeed: 4.2,
  windDir: 'SV',
  waterTemp: 9,
  waveHeight: 0.4,
  condition: 'Let skyet',
  icon: '⛅',
  humidity: 72,
  pressure: 1018,
};

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function spotColor(waterType: string) {
  if (waterType === 'salt') return '#0284c7';
  if (waterType === 'fresh') return '#16a34a';
  return '#7c3aed';
}

// Convert our [lat, lng] zone coords to GeoJSON [lng, lat] Polygon feature
function zoneToGeoJson(coords: [number, number][]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[...coords.map(([lat, lng]) => [lng, lat] as [number, number]),
                     [coords[0][1], coords[0][0]] as [number, number]]],
    },
  };
}

type FilterType = 'all' | 'salt' | 'fresh' | 'brackish';

export default function MapPage() {
  const { user, toggleFavoriteSpot } = useAuth();
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showZones, setShowZones] = useState(true);
  const [weather] = useState<WeatherData>(MOCK_WEATHER);

  // Controlled map state
  const [center, setCenter] = useState<[number, number]>([56.26, 9.5]);
  const [zoom, setZoom] = useState(7);

  // Measure wrapper so pigeon-maps gets explicit pixel dimensions
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const [mapDims, setMapDims] = useState({ width: 0, height: 0 });

  // Search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredSpots = filter === 'all' ? fishingSpots : fishingSpots.filter(s => s.waterType === filter);
  const isFav = (id: string) => user?.favoriteSpots.includes(id) ?? false;

  const filterLabels: { key: FilterType; label: string; color: string }[] = [
    { key: 'all', label: 'Alle', color: 'bg-slate-700 text-white' },
    { key: 'salt', label: '🌊 Hav', color: 'bg-blue-500 text-white' },
    { key: 'fresh', label: '🏞️ Fersk', color: 'bg-green-500 text-white' },
    { key: 'brackish', label: '🌀 Brakvand', color: 'bg-purple-500 text-white' },
  ];

  const doSearch = async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=dk&format=json&limit=5`,
        { headers: { 'Accept-Language': 'da' } }
      );
      setResults(await res.json());
    } catch { setResults([]); }
    finally { setSearching(false); }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(v), 350);
  };

  const handleSelect = (r: NominatimResult) => {
    const name = r.display_name.split(',')[0];
    setQuery(name);
    setResults([]);
    setSearchOpen(false);
    setCenter([parseFloat(r.lat), parseFloat(r.lon)]);
    setZoom(13);
  };

  const handleClear = () => { setQuery(''); setResults([]); setSearchOpen(false); inputRef.current?.focus(); };

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setCenter([pos.coords.latitude, pos.coords.longitude]);
      setZoom(12);
    });
  };

  useEffect(() => {
    const el = mapWrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setMapDims({ width: Math.round(width), height: Math.round(height) });
    });
    ro.observe(el);
    setMapDims({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-search]')) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative w-full flex-1 min-h-0 flex flex-col">
      {/* Weather bar */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-500 text-white px-4 py-2 flex items-center gap-4 text-sm overflow-x-auto shrink-0">
        <span className="text-lg">{weather.icon}</span>
        <span className="font-medium whitespace-nowrap">{weather.condition}</span>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Thermometer className="w-3.5 h-3.5" /><span>{weather.temp}°C</span>
        </div>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Wind className="w-3.5 h-3.5" /><span>{weather.windSpeed} m/s {weather.windDir}</span>
        </div>
        {weather.waterTemp && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Droplets className="w-3.5 h-3.5" /><span>Vand: {weather.waterTemp}°C</span>
          </div>
        )}
        <span className="ml-auto text-xs opacity-75 whitespace-nowrap">DMI live</span>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
        {filterLabels.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === f.key ? f.color : 'bg-slate-100 text-slate-600'}`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setShowZones(!showZones)}
          className={`ml-auto px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 ${showZones ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}
        >
          <AlertTriangle className="w-3 h-3" />
          Fredningszoner
        </button>
      </div>

      {/* Map area */}
      <div ref={mapWrapperRef} className="flex-1 relative min-h-0" style={{ overflow: 'hidden' }}>
        {mapDims.height > 0 && (
        <Map
          center={center}
          zoom={zoom}
          width={mapDims.width}
          height={mapDims.height}
          onBoundsChanged={({ center: c, zoom: z }) => { setCenter(c); setZoom(z); }}
          attribution={false}
          animate
        >
          {/* Protected zones */}
          {showZones && protectedZones.map(zone => (
            <GeoJson
              key={zone.id}
              data={zoneToGeoJson(zone.coordinates)}
              svgAttributes={{
                fill: '#ef4444',
                fillOpacity: 0.15,
                stroke: '#ef4444',
                strokeWidth: 2,
                strokeDasharray: '6 4',
              }}
            />
          ))}

          {/* Fishing spot markers */}
          {filteredSpots.map(spot => (
            <Overlay
              key={spot.id}
              anchor={[spot.lat, spot.lng]}
              offset={[18, 18]}
            >
              <button
                onClick={() => setSelectedSpot(spot)}
                style={{
                  background: 'white',
                  border: `3px solid ${spotColor(spot.waterType)}`,
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                {isFav(spot.id) ? '⭐' : '🎣'}
              </button>
            </Overlay>
          ))}
        </Map>
        )}

        {/* Search bar */}
        <div className="absolute top-3 left-4 right-4 z-50" data-search>
          <div className="relative">
            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => setSearchOpen(true)}
                placeholder="Søg adresse eller by..."
                className="flex-1 px-3 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              {searching && <div className="w-4 h-4 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin mr-3" />}
              {query && !searching && (
                <button onClick={handleClear} className="p-2 mr-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchOpen && results.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                {results.map((r, i) => {
                  const parts = r.display_name.split(', ');
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(r)}
                      className="w-full text-left px-4 py-3 hover:bg-ocean-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-ocean-500 shrink-0" />
                        {parts[0]}
                      </div>
                      {parts[1] && <div className="text-xs text-slate-400 mt-0.5 ml-5">{parts.slice(1, 3).join(', ')}</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Zoom + Location controls */}
        <div className="absolute bottom-48 right-4 z-50 flex flex-col gap-1">
          <button
            onClick={() => setZoom(z => Math.min(z + 1, 19))}
            className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-ocean-600 hover:bg-ocean-50 transition-colors active:scale-95"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 1, 1))}
            className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-ocean-600 hover:bg-ocean-50 transition-colors active:scale-95"
          >
            <Minus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
        <button
          onClick={locate}
          className="absolute bottom-36 right-4 z-50 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-ocean-600 hover:bg-ocean-50 transition-colors active:scale-95"
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Spot detail panel */}
        {selectedSpot && (
          <div className="absolute bottom-4 left-4 right-4 z-50 bg-white rounded-3xl shadow-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-base">{selectedSpot.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">
                    {selectedSpot.difficulty === 'let' ? '🟢 Let' : selectedSpot.difficulty === 'middel' ? '🟡 Middel' : '🔴 Svær'}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-yellow-500 text-xs">{'⭐'.repeat(Math.floor(selectedSpot.rating))} {selectedSpot.rating}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {user && (
                  <button
                    onClick={() => toggleFavoriteSpot(selectedSpot.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isFav(selectedSpot.id) ? 'bg-yellow-100 text-yellow-500' : 'bg-slate-100 text-slate-400'}`}
                  >
                    <Star className="w-4 h-4" fill={isFav(selectedSpot.id) ? 'currentColor' : 'none'} />
                  </button>
                )}
                <button onClick={() => setSelectedSpot(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">✕</button>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-2">{selectedSpot.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedSpot.fish.map(fId => {
                const fish = getFishById(fId);
                return fish ? (
                  <span key={fId} className="flex items-center gap-1 px-2 py-1 bg-ocean-50 text-ocean-700 rounded-full text-xs font-medium">
                    <Fish className="w-3 h-3" /> {fish.name}
                  </span>
                ) : null;
              })}
            </div>

            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {selectedSpot.amenities.join(' · ')}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {selectedSpot.footwear.map(fw => (
                <span key={fw} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                  {fw === 'vaders' ? '🦺 Vaders' : fw === 'gummistøvler' ? '🥾 Gummistøvler' : '👟 Sko'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

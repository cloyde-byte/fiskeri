import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Wind, Thermometer, Droplets, Navigation, Star, MapPin, Fish, AlertTriangle, Plus, Minus, Search, X } from 'lucide-react';
import { fishingSpots, protectedZones } from '../data/spots';
import { getFishById } from '../data/fish';
import { useAuth } from '../context/AuthContext';
import type { FishingSpot, WeatherData } from '../types';

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createSpotIcon = (waterType: string, isFav: boolean) => {
  const colors: Record<string, string> = {
    salt: '#0284c7',
    fresh: '#16a34a',
    brackish: '#7c3aed',
  };
  const color = colors[waterType] || '#0284c7';
  const star = isFav ? '⭐' : '';
  return L.divIcon({
    className: '',
    html: `<div style="
      background: white;
      border: 3px solid ${color};
      border-radius: 50%;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      position: relative;
    ">🎣${star}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

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
  name: string;
}

// Zoom controls component
function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-48 right-4 z-[1000] flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-ocean-600 hover:bg-ocean-50 transition-colors active:scale-95"
        aria-label="Zoom ind"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-ocean-600 hover:bg-ocean-50 transition-colors active:scale-95"
        aria-label="Zoom ud"
      >
        <Minus className="w-6 h-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// Location button
function LocationButton() {
  const map = useMap();
  const [located, setLocated] = useState(false);

  const locate = () => {
    map.locate({ setView: true, maxZoom: 12 });
    setLocated(true);
    setTimeout(() => setLocated(false), 2000);
  };

  return (
    <button
      onClick={locate}
      className={`absolute bottom-36 right-4 z-[1000] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${located ? 'bg-ocean-500 text-white' : 'bg-white text-ocean-600'}`}
    >
      <Navigation className="w-5 h-5" />
    </button>
  );
}

// Fly-to controller – lives inside MapContainer so it has map access
function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 13, { duration: 1.2 });
  }, [target, map]);
  return null;
}

// Address search bar (rendered outside MapContainer as an overlay)
function SearchBar({ onResult }: { onResult: (lat: number, lng: number, name: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=dk&format=json&limit=5&addressdetails=0`,
        { headers: { 'Accept-Language': 'da' } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (r: NominatimResult) => {
    const name = r.display_name.split(',')[0];
    setQuery(name);
    setResults([]);
    setOpen(false);
    onResult(parseFloat(r.lat), parseFloat(r.lon), name);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="absolute top-3 left-4 right-4 z-[1000]">
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            placeholder="Søg adresse eller by..."
            className="flex-1 px-3 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin mr-3" />
          )}
          {query && !loading && (
            <button onClick={handleClear} className="p-2 mr-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {results.map((r, i) => {
              const parts = r.display_name.split(', ');
              const primary = parts[0];
              const secondary = parts.slice(1, 3).join(', ');
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-3 hover:bg-ocean-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-ocean-500 shrink-0" />
                    {primary}
                  </div>
                  {secondary && (
                    <div className="text-xs text-slate-400 mt-0.5 ml-5">{secondary}</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

type FilterType = 'all' | 'salt' | 'fresh' | 'brackish';

export default function MapPage() {
  const { user, toggleFavoriteSpot } = useAuth();
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showZones, setShowZones] = useState(true);
  const [weather] = useState<WeatherData>(MOCK_WEATHER);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  const filteredSpots = filter === 'all' ? fishingSpots : fishingSpots.filter(s => s.waterType === filter);

  const filterLabels: { key: FilterType; label: string; color: string }[] = [
    { key: 'all', label: 'Alle', color: 'bg-slate-700 text-white' },
    { key: 'salt', label: '🌊 Hav', color: 'bg-blue-500 text-white' },
    { key: 'fresh', label: '🏞️ Fersk', color: 'bg-green-500 text-white' },
    { key: 'brackish', label: '🌀 Brakvand', color: 'bg-purple-500 text-white' },
  ];

  const isFav = (spotId: string) => user?.favoriteSpots.includes(spotId) ?? false;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Weather bar */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-500 text-white px-4 py-2 flex items-center gap-4 text-sm overflow-x-auto shrink-0">
        <span className="text-lg">{weather.icon}</span>
        <span className="font-medium whitespace-nowrap">{weather.condition}</span>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Thermometer className="w-3.5 h-3.5" />
          <span>{weather.temp}°C</span>
        </div>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Wind className="w-3.5 h-3.5" />
          <span>{weather.windSpeed} m/s {weather.windDir}</span>
        </div>
        {weather.waterTemp && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Droplets className="w-3.5 h-3.5" />
            <span>Vand: {weather.waterTemp}°C</span>
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

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[56.26, 9.5]}
          zoom={7}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FlyTo target={flyTarget} />
          <ZoomControls />
          <LocationButton />

          {/* Protected zones */}
          {showZones && protectedZones.map(zone => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '6 4',
              }}
            >
              <Popup>
                <div className="p-1">
                  <div className="font-semibold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {zone.name}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{zone.description}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">{zone.type}</span>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Fishing spots */}
          {filteredSpots.map(spot => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={createSpotIcon(spot.waterType, isFav(spot.id))}
              eventHandlers={{ click: () => setSelectedSpot(spot) }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="font-semibold text-slate-800">{spot.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {'⭐'.repeat(Math.floor(spot.rating))}
                    <span className="text-xs text-slate-500">{spot.rating}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{spot.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {spot.fish.slice(0, 3).map(fId => (
                      <span key={fId} className="px-1.5 py-0.5 bg-ocean-100 text-ocean-700 rounded text-xs">
                        {getFishById(fId)?.emoji} {getFishById(fId)?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Search bar overlay */}
        <SearchBar onResult={(lat, lng) => setFlyTarget({ lat, lng })} />

        {/* Spot detail panel */}
        {selectedSpot && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white rounded-3xl shadow-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-base">{selectedSpot.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">{selectedSpot.difficulty === 'let' ? '🟢 Let' : selectedSpot.difficulty === 'middel' ? '🟡 Middel' : '🔴 Svær'}</span>
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

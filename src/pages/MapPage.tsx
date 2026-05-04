import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Wind, Thermometer, Droplets, Navigation, Star, MapPin, Fish, AlertTriangle } from 'lucide-react';
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

type FilterType = 'all' | 'salt' | 'fresh' | 'brackish';

export default function MapPage() {
  const { user, toggleFavoriteSpot } = useAuth();
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showZones, setShowZones] = useState(true);
  const [weather] = useState<WeatherData>(MOCK_WEATHER);

  useEffect(() => {
    // In a real app, fetch DMI weather API here
    // fetch(`https://dmigw.govcloud.dk/v2/metObs/collections/observation/items?...`)
  }, []);

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
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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

          <LocationButton />
        </MapContainer>

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

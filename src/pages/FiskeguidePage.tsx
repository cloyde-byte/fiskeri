import { useState } from 'react';
import { Fish, Calendar, Package, ChevronDown, ChevronUp, Ruler, Clock } from 'lucide-react';
import { fishSpecies, getFishByMonth } from '../data/fish';
import type { FishSpecies } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
const SEASON_COLORS: Record<string, string> = {
  forår: 'bg-green-100 text-green-700',
  sommer: 'bg-yellow-100 text-yellow-700',
  efterår: 'bg-orange-100 text-orange-700',
  vinter: 'bg-blue-100 text-blue-700',
};

const WATER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  salt: { bg: 'bg-blue-100', text: 'text-blue-700', label: '🌊 Hav' },
  fresh: { bg: 'bg-green-100', text: 'text-green-700', label: '🏞️ Fersk' },
  brackish: { bg: 'bg-purple-100', text: 'text-purple-700', label: '🌀 Brakvand' },
};

function FishCard({ fish }: { fish: FishSpecies }) {
  const [expanded, setExpanded] = useState(false);
  const wc = WATER_COLORS[fish.waterType];
  const currentMonth = new Date().getMonth() + 1;
  const isGoodNow = fish.bestMonths.includes(currentMonth);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover">
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center text-2xl shrink-0">
            {fish.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800">{fish.name}</h3>
              {isGoodNow && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Nu i sæson ✓</span>
              )}
            </div>
            <p className="text-xs text-slate-400 italic">{fish.latinName}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${wc.bg} ${wc.text}`}>{wc.label}</span>
              {fish.minSize > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Ruler className="w-3 h-3" />Min {fish.minSize}cm
                </span>
              )}
              {fish.isFredede && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">⚠️ Fredningstid</span>
              )}
            </div>
          </div>
          <div className="text-slate-400 shrink-0">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Month bars */}
        <div className="flex gap-0.5 mt-3">
          {MONTHS.map((m, i) => {
            const isActive = fish.bestMonths.includes(i + 1);
            const isCurrent = i + 1 === currentMonth;
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-0.5">
                <div className={`h-2 w-full rounded-full ${isActive ? 'bg-ocean-400' : 'bg-slate-200'} ${isCurrent ? 'ring-2 ring-ocean-600 ring-offset-1' : ''}`} />
                {isCurrent && <div className="w-1 h-1 rounded-full bg-ocean-600" />}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-xs text-slate-400">Jan</span>
          <span className="text-xs text-slate-400">Dec</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50">
          <p className="text-sm text-slate-600">{fish.description}</p>

          <div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-1">
              <Fish className="w-4 h-4 text-ocean-500" /> Habitat
            </div>
            <p className="text-sm text-slate-600">{fish.habitat}</p>
          </div>

          {fish.isFredede && fish.fredetPeriod && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-1 text-sm font-semibold text-red-700 mb-1">
                <Clock className="w-4 h-4" /> Fredningstid
              </div>
              <p className="text-sm text-red-600">{fish.fredetPeriod}</p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
              <Calendar className="w-4 h-4 text-ocean-500" /> Bedste sæsoner
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fish.seasons.map(s => (
                <span key={s} className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${SEASON_COLORS[s]}`}>{s}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
              <Package className="w-4 h-4 text-ocean-500" /> Anbefalet udstyr
            </div>
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-medium text-slate-600">Stang:</span>
                <span className="text-slate-500 ml-1">{fish.recommendedGear.rod}</span>
              </div>
              <div className="text-xs">
                <span className="font-medium text-slate-600">Line:</span>
                <span className="text-slate-500 ml-1">{fish.recommendedGear.line}</span>
              </div>
              {fish.recommendedGear.bait.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-slate-600">Agn:</span>
                  <span className="text-slate-500 ml-1">{fish.recommendedGear.bait.join(', ')}</span>
                </div>
              )}
              {fish.recommendedGear.lures.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-slate-600">Kunstig agn:</span>
                  <span className="text-slate-500 ml-1">{fish.recommendedGear.lures.join(', ')}</span>
                </div>
              )}
              <div className="text-xs">
                <span className="font-medium text-slate-600">Fodtøj:</span>
                <span className="text-slate-500 ml-1">
                  {fish.recommendedGear.footwear.map(fw =>
                    fw === 'vaders' ? '🦺 Vaders' : fw === 'gummistøvler' ? '🥾 Gummistøvler' : '👟 Sko'
                  ).join(', ')}
                </span>
              </div>
            </div>
            <div className="mt-3 bg-ocean-50 border border-ocean-100 rounded-xl p-3">
              <p className="text-xs text-ocean-700">💡 <strong>Tip:</strong> {fish.recommendedGear.tips}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type TabType = 'guide' | 'kalender';
type WaterFilter = 'all' | 'salt' | 'fresh' | 'brackish';

export default function FiskeguidePage() {
  const [tab, setTab] = useState<TabType>('guide');
  const [waterFilter, setWaterFilter] = useState<WaterFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const filteredFish = waterFilter === 'all' ? fishSpecies : fishSpecies.filter(f => f.waterType === waterFilter);
  const monthFish = getFishByMonth(selectedMonth);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-0">
        <h1 className="text-xl font-bold text-slate-800 mb-3">🐟 Fiskeguide</h1>
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
          <button
            onClick={() => setTab('guide')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'guide' ? 'bg-white text-ocean-600 shadow' : 'text-slate-500'}`}
          >
            Fiskearter
          </button>
          <button
            onClick={() => setTab('kalender')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'kalender' ? 'bg-white text-ocean-600 shadow' : 'text-slate-500'}`}
          >
            Fiskekalender
          </button>
        </div>
      </div>

      {tab === 'guide' && (
        <>
          <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-white border-b border-slate-100 shrink-0">
            {[
              { key: 'all', label: 'Alle', active: 'bg-slate-700 text-white' },
              { key: 'salt', label: '🌊 Hav', active: 'bg-blue-500 text-white' },
              { key: 'fresh', label: '🏞️ Fersk', active: 'bg-green-500 text-white' },
              { key: 'brackish', label: '🌀 Brakvand', active: 'bg-purple-500 text-white' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setWaterFilter(f.key as WaterFilter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${waterFilter === f.key ? f.active : 'bg-slate-100 text-slate-600'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredFish.map(fish => <FishCard key={fish.id} fish={fish} />)}
          </div>
        </>
      )}

      {tab === 'kalender' && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Month selector */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-600 mb-3">Vælg måned</h2>
            <div className="grid grid-cols-6 gap-1.5">
              {MONTHS.map((m, i) => {
                const isNow = i + 1 === new Date().getMonth() + 1;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(i + 1)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedMonth === i + 1
                        ? 'bg-ocean-500 text-white shadow'
                        : isNow
                        ? 'bg-ocean-100 text-ocean-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold text-slate-800">
              Fisk i sæson – {MONTHS[selectedMonth - 1]}
            </h2>
            <span className="px-2 py-0.5 bg-ocean-100 text-ocean-700 rounded-full text-xs">{monthFish.length} arter</span>
          </div>

          <div className="space-y-3">
            {monthFish.map(fish => (
              <div key={fish.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center text-2xl shrink-0">
                  {fish.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                    {fish.name}
                    {fish.isFredede && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">⚠️ Tjek regler</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{fish.habitat}</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {fish.recommendedGear.lures.slice(0, 2).map(l => (
                      <span key={l} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">{l}</span>
                    ))}
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${WATER_COLORS[fish.waterType].bg} ${WATER_COLORS[fish.waterType].text}`}>
                  {fish.waterType === 'salt' ? '🌊' : fish.waterType === 'fresh' ? '🏞️' : '🌀'}
                </div>
              </div>
            ))}
          </div>

          {/* Footwear guide */}
          <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <h3 className="font-bold text-amber-800 mb-3">🥾 Fodtøjsguide</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3">
                <div className="font-semibold text-slate-700 text-sm">🦺 Waders / Vaders</div>
                <p className="text-xs text-slate-500 mt-1">Til laksefiskeri i åer og dybere vandgang. Giver adgang til ellers utilgængelige spots. Anbefales til Skjern Å og Gudenå.</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <div className="font-semibold text-slate-700 text-sm">🥾 Gummistøvler</div>
                <p className="text-xs text-slate-500 mt-1">Perfekt til kystfiskeri, strandbredder og mudrede bredder. Alsidig og praktisk til de fleste situationer.</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <div className="font-semibold text-slate-700 text-sm">👟 Almindelige sko</div>
                <p className="text-xs text-slate-500 mt-1">Til havne, broer og tørre skrænter. Velegnet til makrel- og hornfiskfiskeri fra land.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

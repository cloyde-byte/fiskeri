import { useState } from 'react';
import { Plus, Fish, MapPin, Scale, Ruler, X, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fishSpecies } from '../data/fish';
import LoginModal from '../components/LoginModal';
import type { CatchLog } from '../types';

function AddCatchModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: Omit<CatchLog, 'id' | 'userId'>) => void }) {
  const [fishId, setFishId] = useState('');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [spotName, setSpotName] = useState('');
  const [notes, setNotes] = useState('');
  const [released, setReleased] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fishId || !length || !spotName) return;
    const fish = fishSpecies.find(f => f.id === fishId);
    onAdd({
      fishId,
      fishName: fish?.name ?? fishId,
      length: parseFloat(length),
      weight: weight ? parseFloat(weight) : undefined,
      spotName,
      notes,
      released,
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Tilføj fangst</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fiskeart *</label>
            <select
              value={fishId}
              onChange={e => setFishId(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white"
            >
              <option value="">Vælg fisk...</option>
              {fishSpecies.map(f => (
                <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Længde (cm) *</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  placeholder="54"
                  required
                  min="1"
                  className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Vægt (kg)</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="2.4"
                  step="0.1"
                  min="0"
                  className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sted *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={spotName}
                onChange={e => setSpotName(e.target.value)}
                placeholder="Fx. Køge Bugt, Arresø..."
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notater</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Hvilken agn? Vejr? Tidspunkt?"
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setReleased(!released)}
            className={`w-full py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${released ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-slate-100 text-slate-600 border-2 border-transparent'}`}
          >
            <Heart className="w-4 h-4" fill={released ? 'currentColor' : 'none'} />
            {released ? 'Sat ud igen (C&R) ✓' : 'Beholdt'}
          </button>

          <button
            type="submit"
            className="w-full py-3 bg-ocean-500 text-white rounded-2xl font-semibold hover:bg-ocean-600 transition-colors"
          >
            Gem fangst
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FangstlogPage() {
  const { user, catches, addCatch } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const totalWeight = catches.reduce((sum, c) => sum + (c.weight ?? 0), 0);
  const biggestCatch = catches.reduce((best, c) => (!best || c.length > best.length) ? c : best, catches[0]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-slate-50">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Din fangstlog</h2>
        <p className="text-slate-500 text-sm mb-6">Log dine fangster, se statistik og hold styr på dine bedste fisk.</p>
        <button
          onClick={() => setShowLogin(true)}
          className="px-6 py-3 bg-ocean-500 text-white rounded-2xl font-semibold hover:bg-ocean-600 transition-colors"
        >
          Log ind for at starte
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-slate-800">🎣 Min fangstlog</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 bg-ocean-500 text-white rounded-full flex items-center justify-center shadow hover:bg-ocean-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-ocean-50 rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold text-ocean-600">{catches.length}</div>
            <div className="text-xs text-slate-500">Fangster</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{totalWeight.toFixed(1)}</div>
            <div className="text-xs text-slate-500">kg i alt</div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{biggestCatch?.length ?? 0}</div>
            <div className="text-xs text-slate-500">cm bedste</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {catches.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Fish className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Ingen fangster endnu</p>
            <p className="text-sm mt-1">Tryk + for at tilføje din første fangst</p>
          </div>
        ) : (
          catches.map(c => {
            const fish = fishSpecies.find(f => f.id === c.fishId);
            return (
              <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center text-2xl shrink-0">
                    {fish?.emoji ?? '🐟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">{c.fishName}</h3>
                      {c.released && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Heart className="w-3 h-3" fill="currentColor" /> C&R
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{c.length}cm</span>
                      {c.weight && <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{c.weight}kg</span>}
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.spotName}</span>
                    </div>
                    {c.notes && <p className="text-xs text-slate-400 mt-1 italic">"{c.notes}"</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(c.date).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAdd && (
        <AddCatchModal
          onClose={() => setShowAdd(false)}
          onAdd={(data) => { addCatch(data); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

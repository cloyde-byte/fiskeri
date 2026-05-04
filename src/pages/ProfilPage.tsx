import { useState } from 'react';
import { LogOut, Star, Fish, Award, Calendar, CheckCircle, XCircle, ExternalLink, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fishingSpots } from '../data/spots';
import LoginModal from '../components/LoginModal';

function RuleCard({ title, rules }: { title: string; rules: string[] }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <h3 className="font-semibold text-slate-800 mb-2 text-sm">{title}</h3>
      <ul className="space-y-1.5">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="w-5 h-5 rounded-full bg-ocean-100 text-ocean-700 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">{i + 1}</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

type TabType = 'profil' | 'regler';

export default function ProfilPage() {
  const { user, catches, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [tab, setTab] = useState<TabType>('profil');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-slate-50">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Din profil</h2>
        <p className="text-slate-500 text-sm mb-6">Log ind for at se dine fangster, favorit-spots og fisketegn status.</p>
        <button
          onClick={() => setShowLogin(true)}
          className="px-6 py-3 bg-ocean-500 text-white rounded-2xl font-semibold hover:bg-ocean-600 transition-colors"
        >
          Log ind / Opret konto
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    );
  }

  const favSpots = fishingSpots.filter(s => user.favoriteSpots.includes(s.id));
  const catchesByFish = catches.reduce<Record<string, number>>((acc, c) => {
    acc[c.fishName] = (acc[c.fishName] ?? 0) + 1;
    return acc;
  }, {});
  const topFish = Object.entries(catchesByFish).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const memberDays = Math.floor((Date.now() - new Date(user.joinedDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-ocean-500 to-ocean-700 px-4 pt-6 pb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              {user.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-ocean-200 text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold">{catches.length}</div>
            <div className="text-xs text-ocean-200">Fangster</div>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold">{user.favoriteSpots.length}</div>
            <div className="text-xs text-ocean-200">Favoritter</div>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold">{memberDays}</div>
            <div className="text-xs text-ocean-200">Dage aktiv</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4 py-2">
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
          <button
            onClick={() => setTab('profil')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'profil' ? 'bg-white text-ocean-600 shadow' : 'text-slate-500'}`}
          >
            Min profil
          </button>
          <button
            onClick={() => setTab('regler')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'regler' ? 'bg-white text-ocean-600 shadow' : 'text-slate-500'}`}
          >
            Regler & Fisketegn
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === 'profil' && (
          <>
            {/* Fisketegn status */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${user.hasFisketegn ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {user.hasFisketegn ? (
                <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500 shrink-0" />
              )}
              <div className="flex-1">
                <div className={`font-semibold text-sm ${user.hasFisketegn ? 'text-green-800' : 'text-red-800'}`}>
                  Fisketegn {user.hasFisketegn ? '✓ Gyldigt' : '✗ Mangler'}
                </div>
                {user.hasFisketegn && user.fisketegnExpiry && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Udløber: {new Date(user.fisketegnExpiry).toLocaleDateString('da-DK')}
                  </p>
                )}
                {!user.hasFisketegn && (
                  <a href="https://fisketegn.dk" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-red-600 font-medium mt-0.5 flex items-center gap-1">
                    Køb fisketegn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Top fish */}
            {topFish.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-slate-700 text-sm">Mest fangede fisk</h3>
                </div>
                <div className="space-y-2">
                  {topFish.map(([name, count], i) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {name}</span>
                      <span className="text-sm font-bold text-ocean-600">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite spots */}
            {favSpots.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-semibold text-slate-700 text-sm">Favorit-spots</h3>
                </div>
                <div className="space-y-2">
                  {favSpots.map(spot => (
                    <div key={spot.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-slate-700">{spot.name}</div>
                        <div className="text-xs text-slate-400">
                          {spot.fish.length} fiskearter · {'⭐'.repeat(Math.floor(spot.rating))} {spot.rating}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent catches */}
            {catches.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Fish className="w-4 h-4 text-ocean-500" />
                  <h3 className="font-semibold text-slate-700 text-sm">Seneste fangster</h3>
                </div>
                <div className="space-y-2">
                  {catches.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <div>
                        <span className="text-sm font-medium text-slate-700">{c.fishName}</span>
                        <span className="text-xs text-slate-400 ml-2">· {c.length}cm</span>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(c.date).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member since */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-500">Medlem siden</div>
                <div className="font-medium text-slate-700">
                  {new Date(user.joinedDate).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'regler' && (
          <>
            <div className="bg-ocean-50 rounded-2xl p-4 border border-ocean-100">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-ocean-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-ocean-800 mb-1">Fisketegn i Danmark</h3>
                  <p className="text-sm text-slate-600">
                    Det er lovpligtigt at have gyldigt fisketegn, hvis du er 18 år eller ældre og fisker i søer, åer og havet i Danmark. I saltvand er aldersgrænsen 16 år.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-xl p-2 text-center">
                      <div className="font-bold text-ocean-700">130 kr.</div>
                      <div className="text-slate-500">Års-tegn</div>
                    </div>
                    <div className="bg-white rounded-xl p-2 text-center">
                      <div className="font-bold text-ocean-700">30 kr.</div>
                      <div className="text-slate-500">Ugetegn</div>
                    </div>
                  </div>
                  <a
                    href="https://fisketegn.dk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-ocean-500 text-white rounded-xl text-sm font-medium"
                  >
                    Køb fisketegn <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <RuleCard
              title="🎣 Generelle fiskeregler"
              rules={[
                'Brug altid gyldigt fisketegn (18+ år; 16+ i saltvand)',
                'Overhold mindstemål for alle fiskearter',
                'Respekter fredningstider – både for fisk og fugle',
                'Fisk aldrig i fredningszoner markeret på kortet',
                'Lad fanget fisk leve hvis du ikke har brug for den (C&R)',
              ]}
            />

            <RuleCard
              title="🌊 Saltvandsfiskeri"
              rules={[
                'Torsk: Mindstemål 30 cm',
                'Havørred: Mindstemål 40 cm',
                'Rødspætte: Mindstemål 27 cm',
                'Hornfisk: Mindstemål 45 cm',
                'Makrel: Mindstemål 20 cm – ingen kvote for sportsfiskere',
              ]}
            />

            <RuleCard
              title="🏞️ Ferskvandsfiskeri"
              rules={[
                'Gedde: Mindstemål 60 cm – fredningstid varierer per vand',
                'Sandart: Mindstemål 45 cm',
                'Laks: Tjek specifikke regler for den konkrete å',
                'Ål: Max 3 stk. pr. dag pr. fisker i ferskvand',
                'Private vande kræver tilladelse fra ejer/fiskeretshaver',
              ]}
            />

            <RuleCard
              title="🦅 Miljø og natur"
              rules={[
                'Tag dit skrald med hjem – også andres!',
                'Brug ikke bly-lodder i ferskvand (forbudt)',
                'Forstyr ikke ynglende fugle langs bredder',
                'Respekter naturfredede områder og strandplantager',
                'Brug kun naturlig agn der er tilladt i det pågældende vand',
              ]}
            />

            <div className="bg-slate-100 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500">
                Reglerne kan ændres. Tjek altid de nyeste regler på{' '}
                <a href="https://fiskepleje.dk" target="_blank" rel="noopener noreferrer" className="text-ocean-600 font-medium">
                  fiskepleje.dk
                </a>{' '}
                inden du fisker.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

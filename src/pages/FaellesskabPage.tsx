import { useState } from 'react';
import { Heart, MapPin, Scale, Ruler, MessageCircle } from 'lucide-react';
import { communityReports } from '../data/community';
import type { CommunityReport } from '../types';

export default function FaellesskabPage() {
  const [reports, setReports] = useState<CommunityReport[]>(communityReports);

  const toggleLike = (id: string) => {
    setReports(prev => prev.map(r =>
      r.id === id
        ? { ...r, likes: r.liked ? r.likes - 1 : r.likes + 1, liked: !r.liked }
        : r
    ));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'I dag';
    if (diffDays === 1) return 'I går';
    return `${diffDays} dage siden`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-4">
        <h1 className="text-xl font-bold text-slate-800">🌊 Fællesskab</h1>
        <p className="text-sm text-slate-500 mt-1">Seneste fangstrapporter fra fiskere i Danmark</p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-ocean-50 rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold text-ocean-600">{reports.length}</div>
            <div className="text-xs text-slate-500">Rapporter i dag</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {reports.reduce((sum, r) => sum + r.likes, 0)}
            </div>
            <div className="text-xs text-slate-500">Samlede likes</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {reports.map(report => (
          <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-200 to-ocean-400 flex items-center justify-center text-xl shrink-0">
                  {report.userAvatar}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 text-sm">{report.userName}</div>
                  <div className="text-xs text-slate-400">{formatDate(report.date)}</div>
                </div>
                <div className="text-2xl">{report.fishEmoji}</div>
              </div>
            </div>

            {/* Fish info banner */}
            <div className="mx-4 mb-3 bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-2xl p-3 text-white">
              <div className="font-bold text-lg">{report.fishName}</div>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className="flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  {report.length} cm
                </span>
                {report.weight && (
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    {report.weight} kg
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {report.location}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="px-4 pb-3">
              <p className="text-sm text-slate-600">{report.notes}</p>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center gap-4 border-t border-slate-50 pt-3">
              <button
                onClick={() => toggleLike(report.id)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${report.liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
              >
                <Heart className="w-4 h-4" fill={report.liked ? 'currentColor' : 'none'} />
                {report.likes}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-ocean-500 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Kommenter
              </button>
              <div className="ml-auto">
                <span className="text-xs text-slate-300">{new Date(report.date).toLocaleDateString('da-DK')}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Tips section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <h3 className="font-bold text-amber-800 mb-3">💡 Fiske-tips fra erfarne fiskere</h3>
          <div className="space-y-2">
            {[
              { tip: 'Fisk tidligt morgen og sent aften – fiskene er mest aktive i dæmringen.', author: 'Erik J.' },
              { tip: 'Hold øje med fugle der dykker – de viser, hvor stimerne er!', author: 'Birgit K.' },
              { tip: 'Vandtemperaturen er nøglen. Havørred jager aktivt ved 6-12°C.', author: 'Ole P.' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-3">
                <p className="text-sm text-slate-600 italic">"{t.tip}"</p>
                <p className="text-xs text-amber-600 mt-1 font-medium">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fishing license reminder */}
        <div className="bg-gradient-to-br from-blue-50 to-ocean-50 rounded-2xl p-4 border border-ocean-100">
          <h3 className="font-bold text-ocean-800 mb-2">🪪 Husk dit fisketegn!</h3>
          <p className="text-sm text-slate-600 mb-3">
            Alle der fisker i Danmark over 18 år (dog 16 år i saltvand) skal have gyldigt fisketegn. Det koster kun 130 kr. om året.
          </p>
          <a
            href="https://fisketegn.dk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-ocean-500 text-white rounded-xl text-sm font-medium hover:bg-ocean-600 transition-colors"
          >
            Køb fisketegn →
          </a>
        </div>
      </div>
    </div>
  );
}

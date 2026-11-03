import React, { useState } from 'react';
import { ShieldAlert, Filter, CheckCircle2, Clock, Building2, Sparkles } from 'lucide-react';
import { WardData, Language, RecommendationItem } from '../types';
import { getTranslation } from '../services/i18n';
import { getWardRecommendations } from '../services/recommendationEngine';

interface RecommendationsViewProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language
}) => {
  const t = getTranslation(language);
  const [selectedCategory, setSelectedCategory] = useState<
    'greening' | 'centers' | 'roofs' | 'traffic' | 'healthcare'
  >('greening');
  const [hasExpandedRecs, setHasExpandedRecs] = useState<boolean>(false);
  const [selectedWardOnly, setSelectedWardOnly] = useState<boolean>(false);

  // Compile all recommendations across wards
  let allRecs: { ward: WardData; rec: RecommendationItem }[] = [];
  const targetWards = selectedWardOnly ? (selectedWard ? [selectedWard] : wards) : wards;

  targetWards.forEach(w => {
    if (!w) return;
    const recs = getWardRecommendations(w);
    recs.forEach(r => {
      allRecs.push({ ward: w, rec: r });
    });
  });

  // Filter based on active category
  const domainMap: Record<string, string> = {
    greening: 'VEGETATION',
    roofs: 'COOL SURFACES',
    healthcare: 'HEALTHCARE',
    traffic: 'LABOR',
    centers: 'SETTLEMENT'
  };

  const filteredRecs = allRecs.filter(item =>
    item.rec.domain.includes(domainMap[selectedCategory] || '')
  );

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Actionable Heat Risk Mitigation Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.navRecommendations}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Factor-grounded policy, structural, and public health interventions tailored to ward vulnerability drivers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedWardOnly}
                onChange={e => setSelectedWardOnly(e.target.checked)}
                className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Show {selectedWard?.ward_name || 'Selected Area'} Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Category Selection Buttons & View Trigger */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Select Recommendation Category:
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              id="btn-rec-greening"
              onClick={() => {
                setSelectedCategory('greening');
                setHasExpandedRecs(false);
              }}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                selectedCategory === 'greening'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              Urban Greening
            </button>

            <button
              id="btn-rec-centers"
              onClick={() => {
                setSelectedCategory('centers');
                setHasExpandedRecs(false);
              }}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                selectedCategory === 'centers'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              Cooling Centres
            </button>

            <button
              id="btn-rec-roofs"
              onClick={() => {
                setSelectedCategory('roofs');
                setHasExpandedRecs(false);
              }}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                selectedCategory === 'roofs'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              Cool Roofs
            </button>

            <button
              id="btn-rec-traffic"
              onClick={() => {
                setSelectedCategory('traffic');
                setHasExpandedRecs(false);
              }}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                selectedCategory === 'traffic'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              Traffic & Heat Regulations
            </button>

            <button
              id="btn-rec-healthcare"
              onClick={() => {
                setSelectedCategory('healthcare');
                setHasExpandedRecs(false);
              }}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                selectedCategory === 'healthcare'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              Healthcare Preparedness
            </button>
          </div>

          <button
            id="btn-view-recs"
            onClick={() => setHasExpandedRecs(true)}
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Sparkles className="w-4 h-4" />
            View Recommendations
          </button>
        </div>
      </div>

      {/* Recommendations Output Grid (Conditioned on hasExpandedRecs) */}
      {hasExpandedRecs ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {(filteredRecs.length > 0 ? filteredRecs : allRecs.slice(0, 6)).map(({ ward, rec }, idx) => (
            <div
              key={`${ward.ward_id}-${rec.id}-${idx}`}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => onSelectWard(ward)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        {ward.ward_name} ({ward.ward_id})
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {rec.domain}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {rec.title_en}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      rec.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {rec.priority} PRIORITY
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mt-2">
                  {rec.action_en}
                </p>

                {language === 'te' && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-xs text-amber-900 font-sans leading-relaxed">
                      {rec.action_te}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Feasibility: <strong>{rec.feasibility_months} Months</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Agency: <strong className="text-slate-700">{rec.responsible_agency}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-2xs">
          <ShieldAlert className="w-8 h-8 text-blue-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Targeted Interventions Engine</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose an intervention category above and click <strong>View Recommendations</strong> to expand custom, factor-grounded heat mitigation action directives for affected wards.
          </p>
        </div>
      )}
    </div>
  );
};

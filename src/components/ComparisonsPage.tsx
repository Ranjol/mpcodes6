import React, { useState } from 'react';
import { GitCompare, Layers, Building2, ArrowRight } from 'lucide-react';
import { WardData, Language, CityConfig } from '../types';
import { WardComparisonView } from './WardComparisonView';
import { ZoneComparisonView } from './ZoneComparisonView';

interface ComparisonsPageProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  selectedCity: CityConfig;
  initialMode?: 'ward' | 'zone';
}

export const ComparisonsPage: React.FC<ComparisonsPageProps> = ({
  wards,
  selectedWard,
  language,
  selectedCity,
  initialMode = 'ward'
}) => {
  const [activeMode, setActiveMode] = useState<'ward' | 'zone'>(initialMode);

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4 text-blue-600" />
              Comparative Spatial Intelligence
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Spatial Comparisons &amp; Benchmarking
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Compare heat-risk parameters, surface temperatures, and socio-demographic indicators across {selectedCity.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold">
              {wards.length} Wards Benchmarked
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold">
              {selectedCity.name}
            </span>
          </div>
        </div>

        {/* The Two Main Selection Cards / Buttons (Ward Comparison & Zone Comparison) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
          {/* Card 1: Ward Comparison */}
          <button
            id="btn-select-ward-comp"
            onClick={() => setActiveMode('ward')}
            className={`p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group flex items-start justify-between ${
              activeMode === 'ward'
                ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/30 shadow-sm'
                : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeMode === 'ward'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Ward Comparison
                  </h3>
                  {activeMode === 'ward' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Compare heat-risk metrics across individual wards.
                </p>
              </div>
            </div>
            <ArrowRight
              className={`w-4 h-4 mt-1 transition-transform ${
                activeMode === 'ward'
                  ? 'text-blue-600 translate-x-0.5'
                  : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600'
              }`}
            />
          </button>

          {/* Card 2: Zone Comparison */}
          <button
            id="btn-select-zone-comp"
            onClick={() => setActiveMode('zone')}
            className={`p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group flex items-start justify-between ${
              activeMode === 'zone'
                ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/30 shadow-sm'
                : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeMode === 'zone'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Zone Comparison
                  </h3>
                  {activeMode === 'zone' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Compare heat-risk metrics across different zones.
                </p>
              </div>
            </div>
            <ArrowRight
              className={`w-4 h-4 mt-1 transition-transform ${
                activeMode === 'zone'
                  ? 'text-emerald-600 translate-x-0.5'
                  : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content Area: Opens the Selected Comparison View */}
      {activeMode === 'ward' && (
        <WardComparisonView
          wards={wards}
          selectedWard={selectedWard}
          language={language}
        />
      )}

      {activeMode === 'zone' && (
        <ZoneComparisonView
          wards={wards}
          selectedCity={selectedCity}
          language={language}
        />
      )}
    </div>
  );
};

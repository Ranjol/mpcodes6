import React, { useState } from 'react';
import {
  MapPin,
  PieChart,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  Flame
} from 'lucide-react';
import { WardData, Language, NavTab, CityConfig } from '../types';
import { RiskDistributionDonutChart, ZoneComparisonBarChart } from './PlotlyCharts';

interface DashboardViewProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  onNavigateToTab: (tab: NavTab) => void;
  selectedCity: CityConfig;
  onOpenPipelineModal?: () => void;
  onMapClick?: (lat: number, lon: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  wards,
  onNavigateToTab,
  selectedCity
}) => {
  const [activeAnalysis, setActiveAnalysis] = useState<'risk' | 'zone' | null>(null);

  // Compute city-wide risk statistics
  const lowRiskWards = wards.filter(w => (w.normalized_hvi ?? 5.0) < 4.0);
  const modRiskWards = wards.filter(w => {
    const hvi = w.normalized_hvi ?? 5.0;
    return (hvi >= 4.0 && hvi < 7.0) || w.risk_category === 'MODERATE';
  });
  const highRiskWards = wards.filter(w => (w.normalized_hvi ?? 5.0) >= 7.0 || w.risk_category === 'HIGH');

  // Compute average HVI by zone
  const zoneMap: { [key: string]: { totalHvi: number; count: number } } = {};
  wards.forEach(w => {
    const z = w.zone_name;
    const hvi = w.normalized_hvi ?? 5.0;
    if (!zoneMap[z]) {
      zoneMap[z] = { totalHvi: 0, count: 0 };
    }
    zoneMap[z].totalHvi += hvi;
    zoneMap[z].count += 1;
  });

  const zoneComparisonData = Object.keys(zoneMap).map(zone => ({
    zone: zone,
    avgHvi: Math.round((zoneMap[zone].totalHvi / zoneMap[zone].count) * 100) / 100,
    count: zoneMap[zone].count
  }));

  return (
    <div className="px-3 sm:px-6 py-2 sm:py-3.5 max-w-[1400px] mx-auto space-y-3 sm:space-y-4 select-none min-h-0">
      {/* 1. Centered Header: Logo → Project Title → Subtitle */}
      <div className="flex flex-col items-center justify-center text-center pt-0 pb-0.5 max-w-4xl mx-auto space-y-1.5 sm:space-y-2">
        {/* Logo: Horizontal center directly above title, moved upward with compact footprint */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md border border-blue-400/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-radial from-cyan-400/40 via-transparent to-transparent pointer-events-none" />
          <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-amber-400 drop-shadow-sm relative z-10" />
        </div>

        {/* Project Title: EXACT title directly below logo */}
        <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 tracking-tight leading-snug text-center">
          Urban Geospatial Heat Intelligent System
        </h1>

        {/* Subtitle: EXACT subtitle directly below title */}
        <p className="text-xs sm:text-sm font-semibold text-slate-500 text-center max-w-2xl leading-normal">
          Ward-Wise Climate Intelligence &amp; Risk Analytics
        </p>

        {/* Scannable Status Badges */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs pt-0.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-2xs text-[11px] sm:text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Low Risk: {lowRiskWards.length}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold shadow-2xs text-[11px] sm:text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Moderate: {modRiskWards.length}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold shadow-2xs text-[11px] sm:text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>High Risk: {highRiskWards.length}</span>
          </div>
        </div>
      </div>

      {/* 2. THE THREE MAIN BUTTONS / CARDS (Compact, All on One Screen, Soft Blue Background & Visible Borders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-[1300px] mx-auto">
        {/* BUTTON / CARD 1: Interactive Map */}
        <button
          id="btn-dash-interactive-map"
          onClick={() => onNavigateToTab('map')}
          className="bg-[#E5EEFF] hover:bg-[#D5E4FF] border border-[#B7D0FF] hover:border-[#93B8FF] p-3 sm:p-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all duration-200 text-left group cursor-pointer flex flex-col justify-between min-h-[120px]"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl bg-white text-blue-600 border border-[#B7D0FF] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-blue-800 border border-[#B7D0FF]">
                Open
              </span>
            </div>
            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
              Interactive Map
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
              Explore heat-risk patterns across wards and geographic areas.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#B7D0FF] flex items-center justify-between text-[11px] sm:text-xs font-bold text-blue-700 group-hover:text-blue-800 group-hover:translate-x-0.5 transition-all">
            <span>Open Map Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* BUTTON / CARD 2: Risk Distribution */}
        <button
          id="btn-dash-risk-dist"
          onClick={() => setActiveAnalysis(prev => prev === 'risk' ? null : 'risk')}
          className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 text-left group cursor-pointer flex flex-col justify-between min-h-[120px] ${
            activeAnalysis === 'risk'
              ? 'bg-[#D5E4FF] border-[#7EA8FC] ring-2 ring-blue-300 shadow-sm'
              : 'bg-[#E5EEFF] hover:bg-[#D5E4FF] border-[#B7D0FF] hover:border-[#93B8FF] shadow-2xs hover:shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl bg-white text-blue-600 border border-[#B7D0FF] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <PieChart className="w-4 h-4 text-blue-600" />
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  activeAnalysis === 'risk'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white/80 text-blue-800 border border-[#B7D0FF]'
                }`}
              >
                {activeAnalysis === 'risk' ? 'Active' : 'Click to View'}
              </span>
            </div>
            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
              Risk Distribution
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
              View the distribution of heat-risk levels across different areas.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#B7D0FF] flex items-center justify-between text-[11px] sm:text-xs font-bold text-blue-700 group-hover:text-blue-800 transition-all">
            <span>{activeAnalysis === 'risk' ? 'Hide Analytics Graph' : 'View Analytics Graph'}</span>
            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${activeAnalysis === 'risk' ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
          </div>
        </button>

        {/* BUTTON / CARD 3: Zone Distribution */}
        <button
          id="btn-dash-zone-dist"
          onClick={() => setActiveAnalysis(prev => prev === 'zone' ? null : 'zone')}
          className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 text-left group cursor-pointer flex flex-col justify-between min-h-[120px] ${
            activeAnalysis === 'zone'
              ? 'bg-[#D5E4FF] border-[#7EA8FC] ring-2 ring-blue-300 shadow-sm'
              : 'bg-[#E5EEFF] hover:bg-[#D5E4FF] border-[#B7D0FF] hover:border-[#93B8FF] shadow-2xs hover:shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl bg-white text-blue-600 border border-[#B7D0FF] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  activeAnalysis === 'zone'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white/80 text-blue-800 border border-[#B7D0FF]'
                }`}
              >
                {activeAnalysis === 'zone' ? 'Active' : 'Click to View'}
              </span>
            </div>
            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
              Zone Distribution
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
              Compare heat-risk patterns across different zones.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#B7D0FF] flex items-center justify-between text-[11px] sm:text-xs font-bold text-blue-700 group-hover:text-blue-800 transition-all">
            <span>{activeAnalysis === 'zone' ? 'Hide Analytics Graph' : 'View Analytics Graph'}</span>
            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${activeAnalysis === 'zone' ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* 3. VISUALIZATION DISPLAY AREA (Opens when clicking Risk or Zone Distribution) */}
      {activeAnalysis === 'risk' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-in fade-in duration-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Risk Distribution Analytics
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                City-Wide Heat Vulnerability Index (HVI) Distribution
              </h3>
            </div>
            <button
              onClick={() => setActiveAnalysis(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Close Risk Distribution View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-semibold text-emerald-700 uppercase">Low Risk Category</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{lowRiskWards.length} Wards</div>
              <div className="text-xs text-emerald-600 mt-0.5">HVI &lt; 4.0 ({((lowRiskWards.length / wards.length) * 100).toFixed(0)}%)</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-xs font-semibold text-amber-700 uppercase">Moderate Risk Category</div>
              <div className="text-2xl font-black text-amber-800 mt-1">{modRiskWards.length} Wards</div>
              <div className="text-xs text-amber-600 mt-0.5">HVI 4.0 – 6.9 ({((modRiskWards.length / wards.length) * 100).toFixed(0)}%)</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <div className="text-xs font-semibold text-rose-700 uppercase">High Risk Category</div>
              <div className="text-2xl font-black text-rose-800 mt-1">{highRiskWards.length} Wards</div>
              <div className="text-xs text-rose-600 mt-0.5">HVI &ge; 7.0 ({((highRiskWards.length / wards.length) * 100).toFixed(0)}%)</div>
            </div>
          </div>

          <div className="max-w-xl mx-auto py-2">
            <RiskDistributionDonutChart
              lowCount={lowRiskWards.length}
              modCount={modRiskWards.length}
              highCount={highRiskWards.length}
              totalWards={wards.length}
            />
          </div>
        </div>
      )}

      {activeAnalysis === 'zone' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-in fade-in duration-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Zone Distribution Analytics
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                Mean Thermal Vulnerability Index Across Municipal Zones
              </h3>
            </div>
            <button
              onClick={() => setActiveAnalysis(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Close Zone Distribution View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            <ZoneComparisonBarChart zoneData={zoneComparisonData} />
          </div>
        </div>
      )}
    </div>
  );
};

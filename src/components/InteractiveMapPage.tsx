import React, { useState } from 'react';
import {
  MapPin,
  Search,
  X,
  RotateCcw,
  Building,
  Info,
  Thermometer,
  Trees,
  Droplets,
  Users,
  Hospital,
  Compass,
  ArrowRight,
  Layers,
  Map as MapIcon,
  BarChart3,
  FileText,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Sun,
  Lightbulb,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { WardData, Language, NavTab, CityConfig } from '../types';
import { LeafletMap, MapRiskFilter } from './LeafletMap';

interface InteractiveMapPageProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  onNavigateToTab: (tab: NavTab) => void;
  selectedCity: CityConfig;
  onOpenPipelineModal?: () => void;
  onMapClick?: (lat: number, lon: number) => void;
}

export const InteractiveMapPage: React.FC<InteractiveMapPageProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language,
  onNavigateToTab,
  selectedCity,
  onOpenPipelineModal,
  onMapClick
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'overview' | 'details'>('map');
  const [filterZone, setFilterZone] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<MapRiskFilter>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Real statistics derived from actual wards
  const totalCount = wards.length || 1;
  const avgLst = (wards.reduce((acc, w) => acc + (w.lst_celsius || 0), 0) / totalCount).toFixed(1);
  const avgHvi = (wards.reduce((acc, w) => acc + (w.normalized_hvi || 0), 0) / totalCount).toFixed(1);

  const veryHighWards = wards.filter(w => {
    const hvi = w.normalized_hvi ?? 5.0;
    return hvi >= 7.5 || (w.risk_category === 'HIGH' && hvi >= 7.0);
  });
  const highWards = wards.filter(w => {
    const hvi = w.normalized_hvi ?? 5.0;
    const isVeryHigh = hvi >= 7.5 || (w.risk_category === 'HIGH' && hvi >= 7.0);
    return !isVeryHigh && (hvi >= 6.0 || w.risk_category === 'HIGH');
  });
  const modWards = wards.filter(w => {
    const hvi = w.normalized_hvi ?? 5.0;
    const isVeryHigh = hvi >= 7.5 || (w.risk_category === 'HIGH' && hvi >= 7.0);
    const isHigh = !isVeryHigh && (hvi >= 6.0 || w.risk_category === 'HIGH');
    return !isVeryHigh && !isHigh && ((hvi >= 4.0 && hvi < 6.0) || w.risk_category === 'MODERATE');
  });
  const lowWards = wards.filter(w => {
    const hvi = w.normalized_hvi ?? 5.0;
    const isVeryHigh = hvi >= 7.5 || (w.risk_category === 'HIGH' && hvi >= 7.0);
    const isHigh = !isVeryHigh && (hvi >= 6.0 || w.risk_category === 'HIGH');
    const isMod = !isVeryHigh && !isHigh && ((hvi >= 4.0 && hvi < 6.0) || w.risk_category === 'MODERATE');
    return !isVeryHigh && !isHigh && !isMod && ((hvi >= 2.5 && hvi < 4.0) || w.risk_category === 'LOW');
  });
  const veryLowWards = wards.filter(w => {
    const hvi = w.normalized_hvi ?? 5.0;
    const isVeryHigh = hvi >= 7.5 || (w.risk_category === 'HIGH' && hvi >= 7.0);
    const isHigh = !isVeryHigh && (hvi >= 6.0 || w.risk_category === 'HIGH');
    const isMod = !isVeryHigh && !isHigh && ((hvi >= 4.0 && hvi < 6.0) || w.risk_category === 'MODERATE');
    const isLow = !isVeryHigh && !isHigh && !isMod && ((hvi >= 2.5 && hvi < 4.0) || w.risk_category === 'LOW');
    return !isVeryHigh && !isHigh && !isMod && !isLow;
  });

  const criticalCount = veryHighWards.length + highWards.length;
  const hottestWard = [...wards].sort((a, b) => (b.lst_celsius || 0) - (a.lst_celsius || 0))[0];

  // Filter wards by zone and optional search query
  const filteredWards = wards.filter(w => {
    const matchZone = filterZone === 'ALL' || w.zone_name === filterZone;
    const matchQuery =
      !searchQuery.trim() ||
      w.ward_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.ward_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.zone_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchZone && matchQuery;
  });

  const handleReset = () => {
    setFilterZone('ALL');
    setRiskFilter(null);
    setSearchQuery('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-4 select-none">
      {/* MAIN INTERACTIVE MAP CONTAINER CARD (Matches Screenshot 2 Structure) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        {/* 1. TOP HEADER BAR: TABS & SEARCH INPUT */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Mode Tabs: Map View, Heat Risk Overview, Ward Details */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 w-fit">
            <button
              id="tab-map-view"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>

            <button
              id="tab-heat-risk-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Heat Risk Overview</span>
            </button>

            <button
              id="tab-ward-details"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ward Details</span>
            </button>
          </div>

          {/* Right Side: Search & Zone Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative min-w-[220px] sm:min-w-[280px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-search-map-page"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ward name, ID, or area..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 transition focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Zone Selector */}
            <select
              value={filterZone}
              onChange={e => setFilterZone(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Zones ({selectedCity.name})</option>
              {selectedCity.zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>

            {/* Reset */}
            <button
              onClick={handleReset}
              title="Reset Map Filters"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* 2. HEAT RISK LEGEND (Above the map, exactly like Screenshot 2) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Heat Risk Level:</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <button
              onClick={() => setRiskFilter(riskFilter === 'VERY_LOW' ? null : 'VERY_LOW')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer ${
                riskFilter === 'VERY_LOW' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>Very Low</span>
            </button>

            <button
              onClick={() => setRiskFilter(riskFilter === 'LOW' ? null : 'LOW')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer ${
                riskFilter === 'LOW' ? 'bg-lime-100 text-lime-900 font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
              <span>Low</span>
            </button>

            <button
              onClick={() => setRiskFilter(riskFilter === 'MODERATE' ? null : 'MODERATE')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer ${
                riskFilter === 'MODERATE' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
              <span>Moderate</span>
            </button>

            <button
              onClick={() => setRiskFilter(riskFilter === 'HIGH' ? null : 'HIGH')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer ${
                riskFilter === 'HIGH' ? 'bg-orange-100 text-orange-900 font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
              <span>High</span>
            </button>

            <button
              onClick={() => setRiskFilter(riskFilter === 'VERY_HIGH' ? null : 'VERY_HIGH')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer ${
                riskFilter === 'VERY_HIGH' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span>Very High</span>
            </button>

            {riskFilter && (
              <button
                onClick={() => setRiskFilter(null)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer border-l border-slate-300 pl-2"
              >
                Show All
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            <span>Showing {filteredWards.length} Wards</span>
          </div>
        </div>

        {/* 3. MAIN SECTION CONTENT */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Primary Large Interactive Map Canvas */}
            <div className="lg:col-span-8 xl:col-span-9 rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs">
              <LeafletMap
                wards={filteredWards}
                selectedWard={selectedWard}
                onSelectWard={onSelectWard}
                language={language}
                heightClass="h-[600px] sm:h-[660px] lg:h-[720px]"
                selectedCity={selectedCity}
                onOpenPipelineModal={onOpenPipelineModal}
                onMapClick={onMapClick}
                riskFilter={riskFilter}
                onRiskFilterChange={setRiskFilter}
              />
            </div>

            {/* Right-Side Information Cards (Exact Match to Reference Screenshot) */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-3.5">
              {/* Card 1: Project Overview (2x2 KPI grid) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Project Overview</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {selectedCity.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Total Wards */}
                  <div className="bg-blue-50/50 p-2.5 sm:p-3 rounded-xl border border-blue-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 leading-tight">{wards.length}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Total Wards</div>
                    </div>
                  </div>

                  {/* High Risk Wards */}
                  <div className="bg-rose-50/50 p-2.5 sm:p-3 rounded-xl border border-rose-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4 fill-rose-500" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-rose-700 leading-tight">{criticalCount}</div>
                      <div className="text-[10px] text-rose-600 font-medium">High Risk Wards</div>
                    </div>
                  </div>

                  {/* Moderate Risk Wards */}
                  <div className="bg-amber-50/50 p-2.5 sm:p-3 rounded-xl border border-amber-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Trees className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-amber-800 leading-tight">{modWards.length}</div>
                      <div className="text-[10px] text-amber-600 font-medium">Moderate Risk</div>
                    </div>
                  </div>

                  {/* Low Risk Wards */}
                  <div className="bg-emerald-50/50 p-2.5 sm:p-3 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-emerald-800 leading-tight">{lowWards.length + veryLowWards.length}</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Low Risk Wards</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Heat Risk Distribution with Donut Ring Chart */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="text-sm font-bold text-slate-900">
                  Heat Risk Distribution
                </div>

                {(() => {
                  const r = 36;
                  const c = 2 * Math.PI * r;
                  const pVeryHigh = (veryHighWards.length / totalCount);
                  const pHigh = (highWards.length / totalCount);
                  const pMod = (modWards.length / totalCount);
                  const pLow = (lowWards.length / totalCount);
                  const pVeryLow = Math.max(0, 1 - (pVeryHigh + pHigh + pMod + pLow));

                  const lVeryHigh = pVeryHigh * c;
                  const lHigh = pHigh * c;
                  const lMod = pMod * c;
                  const lLow = pLow * c;
                  const lVeryLow = pVeryLow * c;

                  const oVeryHigh = 0;
                  const oHigh = -lVeryHigh;
                  const oMod = -(lVeryHigh + lHigh);
                  const oLow = -(lVeryHigh + lHigh + lMod);
                  const oVeryLow = -(lVeryHigh + lHigh + lMod + lLow);

                  return (
                    <div className="flex items-center gap-4">
                      {/* Donut Chart */}
                      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#ef4444" strokeWidth="12"
                            strokeDasharray={`${lVeryHigh} ${c}`} strokeDashoffset={oVeryHigh} />
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#f97316" strokeWidth="12"
                            strokeDasharray={`${lHigh} ${c}`} strokeDashoffset={oHigh} />
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#eab308" strokeWidth="12"
                            strokeDasharray={`${lMod} ${c}`} strokeDashoffset={oMod} />
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#84cc16" strokeWidth="12"
                            strokeDasharray={`${lLow} ${c}`} strokeDashoffset={oLow} />
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#10b981" strokeWidth="12"
                            strokeDasharray={`${lVeryLow} ${c}`} strokeDashoffset={oVeryLow} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-base font-black text-slate-900 leading-none">{wards.length}</span>
                          <span className="text-[9px] text-slate-500 font-semibold mt-0.5">Wards</span>
                        </div>
                      </div>

                      {/* Legend List */}
                      <div className="space-y-1.5 text-xs flex-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                            <span>Very High</span>
                          </span>
                          <span className="font-bold text-slate-900 font-mono">{Math.round(pVeryHigh * 100)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                            <span>High</span>
                          </span>
                          <span className="font-bold text-slate-900 font-mono">{Math.round(pHigh * 100)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                            <span>Moderate</span>
                          </span>
                          <span className="font-bold text-slate-900 font-mono">{Math.round(pMod * 100)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#84cc16]" />
                            <span>Low</span>
                          </span>
                          <span className="font-bold text-slate-900 font-mono">{Math.round(pLow * 100)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                            <span>Very Low</span>
                          </span>
                          <span className="font-bold text-slate-900 font-mono">{Math.round(pVeryLow * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Card 3: Insight / Selected Ward Profile */}
              {selectedWard ? (
                <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Selected Ward
                      </div>
                      <h4 className="text-sm font-black text-slate-900 truncate">{selectedWard.ward_name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        selectedWard.risk_category === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : selectedWard.risk_category === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      HVI {selectedWard.normalized_hvi}/10
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Surface Temp (LST):</span>
                      <span className="font-bold text-slate-900">{selectedWard.lst_celsius}&deg;C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Vegetation (NDVI):</span>
                      <span className="font-bold text-slate-900">{selectedWard.ndvi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Water Index (NDWI):</span>
                      <span className="font-bold text-slate-900">{selectedWard.ndwi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Population:</span>
                      <span className="font-bold text-slate-900">{selectedWard.population.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Nearest Health Centre:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[130px]">{selectedWard.uhc_distance_km} km</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToTab('profile')}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <span>View Complete Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50/40 rounded-2xl border border-amber-200/80 p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <Lightbulb className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Insight</div>
                      <div className="text-xs text-slate-700 font-medium leading-snug">
                        High risk wards are concentrated in central and western zones of {selectedCity.name}.
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. TAB CONTENT: HEAT RISK OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>High &amp; Very High Risk Wards</span>
                </div>
                <div className="text-2xl font-black text-rose-900 mt-1">{criticalCount} Wards</div>
                <p className="text-xs text-rose-700 mt-1">
                  Urgent priority for mobile hydration stations, shaded corridors, and hospital emergency preparedness.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Moderate Risk Wards</span>
                </div>
                <div className="text-2xl font-black text-amber-900 mt-1">{modWards.length} Wards</div>
                <p className="text-xs text-amber-700 mt-1">
                  Recommended for urban greening, tree canopy preservation, and cool roof painting initiatives.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                  <Trees className="w-4 h-4 text-emerald-600" />
                  <span>Low &amp; Very Low Risk Wards</span>
                </div>
                <div className="text-2xl font-black text-emerald-900 mt-1">{lowWards.length + veryLowWards.length} Wards</div>
                <p className="text-xs text-emerald-700 mt-1">
                  Benefiting from extensive tree cover, water bodies, or lower building density.
                </p>
              </div>
            </div>

            {/* Comprehensive Table of Current City Wards */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>{selectedCity.name} Ward Heat Vulnerability Ranking</span>
                <span className="text-slate-500 font-normal">Sorted by Heat Vulnerability Index (HVI)</span>
              </div>
              <div className="max-h-[380px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="px-4 py-2">Ward</th>
                      <th className="px-4 py-2">Zone</th>
                      <th className="px-4 py-2">Surface Temp (LST)</th>
                      <th className="px-4 py-2">NDVI (Vegetation)</th>
                      <th className="px-4 py-2">Population</th>
                      <th className="px-4 py-2">HVI Score</th>
                      <th className="px-4 py-2">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...filteredWards]
                      .sort((a, b) => (b.normalized_hvi || 0) - (a.normalized_hvi || 0))
                      .map(w => (
                        <tr
                          key={w.ward_id}
                          onClick={() => {
                            onSelectWard(w);
                            setActiveTab('map');
                          }}
                          className="hover:bg-blue-50/60 cursor-pointer transition"
                        >
                          <td className="px-4 py-2 font-bold text-slate-900">{w.ward_name} ({w.ward_id})</td>
                          <td className="px-4 py-2 text-slate-600">{w.zone_name}</td>
                          <td className="px-4 py-2 font-mono">{w.lst_celsius}&deg;C</td>
                          <td className="px-4 py-2 font-mono">{w.ndvi}</td>
                          <td className="px-4 py-2 font-mono">{w.population.toLocaleString()}</td>
                          <td className="px-4 py-2 font-bold font-mono">{w.normalized_hvi}/10</td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                w.risk_category === 'HIGH'
                                  ? 'bg-rose-100 text-rose-800'
                                  : w.risk_category === 'MODERATE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {w.risk_category}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB CONTENT: WARD DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {selectedWard ? (
              <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Selected Ward Telemetry Profile
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {selectedWard.ward_name} ({selectedWard.ward_id})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Zone: <strong className="text-slate-700">{selectedWard.zone_name}</strong> • City: <strong className="text-slate-700">{selectedCity.name}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('profile')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs w-fit"
                  >
                    <span>Open Comprehensive Ward Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Surface Temp (LST)</span>
                    <div className="text-lg font-black text-slate-900 mt-1">{selectedWard.lst_celsius}&deg;C</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Normalized HVI</span>
                    <div className="text-lg font-black text-slate-900 mt-1">{selectedWard.normalized_hvi}/10</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Vegetation (NDVI)</span>
                    <div className="text-lg font-black text-slate-900 mt-1">{selectedWard.ndvi}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Water Index (NDWI)</span>
                    <div className="text-lg font-black text-slate-900 mt-1">{selectedWard.ndwi}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Population</span>
                    <div className="text-lg font-black text-slate-900 mt-1">{selectedWard.population.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Population Density</span>
                    <div className="text-lg font-black text-slate-900 mt-1">{selectedWard.population_density.toLocaleString()}/km&sup2;</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Nearest Health Centre</span>
                    <div className="text-sm font-bold text-slate-900 mt-1 truncate">{selectedWard.uhc_name}</div>
                    <div className="text-[11px] text-slate-500">{selectedWard.uhc_distance_km} km away</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Key Landmarks</span>
                    <div className="text-sm font-semibold text-slate-700 mt-1 truncate">{selectedWard.landmarks?.join(', ')}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center space-y-2">
                <MapPin className="w-8 h-8 text-blue-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No Ward Selected</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click any ward polygon on the map or search in the top search bar to view detailed telemetry metrics.
                </p>
                <button
                  onClick={() => setActiveTab('map')}
                  className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Return to Map View
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

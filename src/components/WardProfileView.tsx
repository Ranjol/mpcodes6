import React, { useState } from 'react';
import {
  Building,
  Compass,
  FileDown,
  Flame,
  X,
  Thermometer,
  Users,
  BrainCircuit,
  ChevronRight,
  Activity,
  Building2
} from 'lucide-react';
import { WardData, Language } from '../types';
import { getTranslation } from '../services/i18n';
import { calculateWardSHAP } from '../services/shapEngine';
import { evaluateWardAlerts } from '../services/alertEngine';
import { DomainRadarChart, SHAPFeatureChart } from './PlotlyCharts';

interface WardProfileViewProps {
  ward?: WardData;
  wards?: WardData[];
  onSelectWard?: (ward: WardData) => void;
  language: Language;
  onOpenPdfReport: () => void;
  onOpenScenarioWithWard: (ward: WardData) => void;
}

type ProfileSection = 'hvi' | 'three_domain' | 'indicators' | 'shap';

export const WardProfileView: React.FC<WardProfileViewProps> = ({
  ward,
  wards = [],
  onSelectWard,
  language,
  onOpenPdfReport,
  onOpenScenarioWithWard
}) => {
  const t = getTranslation(language);
  const [activeSection, setActiveSection] = useState<ProfileSection | null>(null);

  // If no ward is selected, use the first ward from the dataset as default
  const activeWard = ward || (wards.length > 0 ? wards[0] : null);

  if (!activeWard) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
        <Building className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Select an Area</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Select an area on the map or search bar to view detailed heat-risk telemetry.
        </p>
      </div>
    );
  }

  const shap = calculateWardSHAP(activeWard);
  const alerts = evaluateWardAlerts(activeWard);

  const riskBadge =
    activeWard.risk_category === 'HIGH'
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : activeWard.risk_category === 'MODERATE'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const sections: {
    id: ProfileSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'hvi', label: t.profHviBtn || 'HVI Overview', icon: Activity },
    { id: 'three_domain', label: t.profDomainBtn || 'Three-Domain Assessment', icon: Thermometer },
    { id: 'indicators', label: t.profIndicatorsBtn || 'Vulnerability Indicators', icon: Users },
    { id: 'shap', label: t.profShapBtn || 'SHAP / Feature Explanation', icon: BrainCircuit }
  ];

  return (
    <div className="space-y-5">
      {/* Header Banner: Ward Identity & Core Index Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest">
                {activeWard.ward_id} &bull; {activeWard.zone_name}
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${riskBadge}`}>
                {activeWard.risk_category} HEAT RISK
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeWard.ward_name}
              </h2>

              {/* Optional Ward Selector Dropdown if wards array provided */}
              {wards.length > 0 && onSelectWard && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={activeWard.ward_id}
                    onChange={e => {
                      const target = wards.find(w => w.ward_id === e.target.value);
                      if (target) onSelectWard(target);
                    }}
                    className="px-2 py-0.5 rounded bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:border-blue-500 focus:ring-0 cursor-pointer shadow-2xs"
                  >
                    {wards.map(w => (
                      <option key={w.ward_id} value={w.ward_id}>
                        {w.ward_name} ({w.ward_id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>PIN: <strong className="text-slate-800">{activeWard.pin_codes.join(', ')}</strong></span>
              <span>Landmarks: <strong className="text-slate-800">{activeWard.landmarks.join(', ')}</strong></span>
              <span>Area: <strong className="text-slate-800">{activeWard.area_sq_km} sq.km</strong></span>
            </div>
          </div>

          {/* Quick Actions & HVI Score Metric */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">HVI Score</div>
              <div className="text-2xl font-black text-rose-600 font-mono">{activeWard.normalized_hvi}</div>
              <div className="text-[10px] text-slate-500">Scale 1.0 – 10.0</div>
            </div>

            <button
              onClick={() => onOpenScenarioWithWard(activeWard)}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              Simulate
            </button>

            <button
              onClick={onOpenPdfReport}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              {t.downloadPdf}
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT WARD PROFILE POINTS (No long sentences, many small short points/labels) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Ward Profile &bull; Core Data Points
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            {activeWard.ward_name} ({activeWard.ward_id})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Ward</span>
            <span className="font-extrabold text-slate-900 block truncate">{activeWard.ward_name}</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Risk Level</span>
            <span className={`font-extrabold block ${activeWard.risk_category === 'HIGH' ? 'text-rose-600' : activeWard.risk_category === 'MODERATE' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {activeWard.risk_category}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• HVI</span>
            <span className="font-extrabold text-rose-600 font-mono block">{activeWard.normalized_hvi} / 10</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• LST</span>
            <span className="font-extrabold text-rose-600 font-mono block">{activeWard.lst_celsius}°C</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• NDVI</span>
            <span className="font-extrabold text-emerald-600 font-mono block">{activeWard.ndvi}</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Population</span>
            <span className="font-extrabold text-slate-900 font-mono block">{activeWard.population.toLocaleString()}</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Density</span>
            <span className="font-extrabold text-slate-900 font-mono block">{activeWard.population_density.toLocaleString()}/km²</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Built-up Area</span>
            <span className="font-extrabold text-slate-900 font-mono block">{activeWard.building_density_pct}%</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Vegetation</span>
            <span className="font-extrabold text-emerald-700 block">
              {activeWard.ndvi >= 0.25 ? 'High' : activeWard.ndvi >= 0.15 ? 'Moderate' : 'Low'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Land Use</span>
            <span className="font-extrabold text-slate-900 block truncate">{activeWard.lulc_class}</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Weather</span>
            <span className="font-extrabold text-slate-900 font-mono block">{activeWard.current_temp_celsius}°C, {activeWard.current_humidity_pct}%</span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">• Exposure</span>
            <span className="font-extrabold text-amber-700 font-mono block">{activeWard.exposure_score} / 10</span>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner if applicable (Short structured points) */}
      {alerts.length > 0 && alerts[0].level === 'RED' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs">
          <Flame className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1 text-xs">
            <div className="font-bold text-rose-900 uppercase tracking-wide">
              {alerts[0].headline_en}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-rose-800">
              <span>• Priority: CRITICAL</span>
              <span>• Trigger: {alerts[0].trigger_metric}</span>
              <span>• Status: Active Advisory</span>
            </div>
          </div>
        </div>
      )}

      {/* Section Navigation Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Select Area Profile Section:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sections.map(sec => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                id={`btn-prof-sec-${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`px-4 py-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-between shadow-2xs border ${
                  isActive
                    ? 'bg-[#2563EB] text-white border-blue-700 ring-2 ring-blue-400/50'
                    : 'bg-[#2563EB] hover:bg-blue-700 text-white border-blue-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-blue-100 shrink-0" />
                  <span className="truncate">{sec.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-200 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Section Information Panel (No running paragraphs; short points & metrics) */}
      {activeSection && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5 animate-in fade-in duration-200">
          {/* Header & Close Button */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Area Profile Section
              </span>
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2 mt-0.5">
                {activeSection === 'hvi' && 'HVI OVERVIEW'}
                {activeSection === 'three_domain' && 'THREE-DOMAIN ASSESSMENT'}
                {activeSection === 'indicators' && 'VULNERABILITY INDICATORS'}
                {activeSection === 'shap' && 'SHAP / FEATURE EXPLANATION'}
              </h3>
            </div>

            <button
              id="btn-close-prof-detail"
              onClick={() => setActiveSection(null)}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>

          {/* Section 1: HVI Overview Detail (Short Points) */}
          {activeSection === 'hvi' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 mb-2.5">
                  Heat Vulnerability Summary ({activeWard.ward_name}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Ward:</span> <strong className="text-slate-900">{activeWard.ward_name} ({activeWard.ward_id})</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Risk Category:</span> <strong className={activeWard.risk_category === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}>{activeWard.risk_category} RISK</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• HVI Composite:</span> <strong className="text-rose-600 font-mono">{activeWard.normalized_hvi} / 10</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Land Surface Temp:</span> <strong className="text-rose-600 font-mono">{activeWard.lst_celsius}°C</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Vegetation (NDVI):</span> <strong className="text-emerald-600 font-mono">{activeWard.ndvi}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Population:</span> <strong className="text-slate-900 font-mono">{activeWard.population.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Density:</span> <strong className="text-slate-900 font-mono">{activeWard.population_density.toLocaleString()}/km²</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Built-up Concrete:</span> <strong className="text-slate-900 font-mono">{activeWard.building_density_pct}%</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Intervention:</span> <strong className="text-blue-700">Targeted Urban Cooling</strong>
                  </div>
                </div>
              </div>

              {/* Supporting Quantitative Values */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500">HVI Composite</div>
                  <div className="text-2xl font-black text-rose-600 font-mono mt-1">{activeWard.normalized_hvi}</div>
                  <div className="text-[10px] text-slate-400">Scale 1.0 – 10.0</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Risk Category</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-1 uppercase">
                    {activeWard.risk_category}
                  </div>
                  <div className="text-[10px] text-slate-400">Municipal Priority</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Land Surface Temp</div>
                  <div className="text-2xl font-black text-rose-600 font-mono mt-1">{activeWard.lst_celsius}°C</div>
                  <div className="text-[10px] text-slate-400">Satellite Radiance</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Population Density</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-1">
                    {activeWard.population_density.toLocaleString()} /km²
                  </div>
                  <div className="text-[10px] text-slate-400">Total: {activeWard.population.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Three-Domain Assessment Detail (Short Points) */}
          {activeSection === 'three_domain' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700">
                  Three-Domain Assessment Points ({activeWard.ward_name}):
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-rose-700">• Exposure Score ({activeWard.exposure_score}/10):</span>{' '}
                    <span className="text-slate-700">Surface LST {activeWard.lst_celsius}°C &bull; Built-up density {activeWard.building_density_pct}%</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-amber-700">• Sensitivity Score ({activeWard.sensitivity_score}/10):</span>{' '}
                    <span className="text-slate-700">Elderly {activeWard.elderly_60_plus_pct}% &bull; Children {activeWard.children_0_6_pct}% &bull; Slum {activeWard.low_income_slum_pct}%</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-emerald-700">• Adaptive Capacity ({activeWard.adaptive_capacity_score}/10):</span>{' '}
                    <span className="text-slate-700">NDVI {activeWard.ndvi} &bull; NDWI {activeWard.ndwi} &bull; UHC {activeWard.uhc_distance_km} km ({activeWard.uhc_name})</span>
                  </div>
                </div>
              </div>

              {/* Supporting Domain Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                  <div className="text-[10px] font-bold uppercase text-rose-800">1. Exposure Domain</div>
                  <div className="text-2xl font-black text-rose-600 font-mono mt-1">{activeWard.exposure_score} / 10</div>
                  <div className="text-[10px] text-rose-700 mt-1">Satellite Thermal Load</div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <div className="text-[10px] font-bold uppercase text-amber-800">2. Sensitivity Domain</div>
                  <div className="text-2xl font-black text-amber-600 font-mono mt-1">{activeWard.sensitivity_score} / 10</div>
                  <div className="text-[10px] text-amber-700 mt-1">Demographic Susceptibility</div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <div className="text-[10px] font-bold uppercase text-emerald-800">3. Adaptive Capacity</div>
                  <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{activeWard.adaptive_capacity_score} / 10</div>
                  <div className="text-[10px] text-emerald-700 mt-1">Green / Health Infrastructure</div>
                </div>
              </div>

              {/* Domain Radar Chart */}
              <div className="pt-2">
                <DomainRadarChart ward={activeWard} />
              </div>
            </div>
          )}

          {/* Section 3: Vulnerability Indicators Detail (Short Points) */}
          {activeSection === 'indicators' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 mb-2.5">
                  Indicator Telemetry Points ({activeWard.ward_name}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Surface Temp (LST):</span> <strong className="text-rose-600 font-mono">{activeWard.lst_celsius}°C</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Built-up Coverage:</span> <strong className="text-slate-900 font-mono">{activeWard.building_density_pct}%</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Tree Canopy (NDVI):</span> <strong className="text-emerald-600 font-mono">{activeWard.ndvi}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Water Index (NDWI):</span> <strong className="text-sky-600 font-mono">{activeWard.ndwi}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Population:</span> <strong className="text-slate-900 font-mono">{activeWard.population.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Density:</span> <strong className="text-slate-900 font-mono">{activeWard.population_density.toLocaleString()}/km²</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Elderly (60+):</span> <strong className="text-slate-900 font-mono">{activeWard.elderly_60_plus_pct}%</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Children (0–6):</span> <strong className="text-slate-900 font-mono">{activeWard.children_0_6_pct}%</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Low-Income / Slum:</span> <strong className="text-slate-900 font-mono">{activeWard.low_income_slum_pct}%</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Outdoor Laborers:</span> <strong className="text-slate-900 font-mono">{activeWard.outdoor_workers_count.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Nearest Health Center:</span> <strong className="text-slate-900">{activeWard.uhc_name}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">• Health Center Distance:</span> <strong className="text-slate-900 font-mono">{activeWard.uhc_distance_km} km</strong>
                  </div>
                </div>
              </div>

              {/* Supporting Indicator Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">LST Temp</span>
                  <span className="text-sm font-bold text-rose-600 font-mono mt-0.5 block">{activeWard.lst_celsius}°C</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">NDVI Canopy</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono mt-0.5 block">{activeWard.ndvi}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Built-Up %</span>
                  <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">{activeWard.building_density_pct}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Low Income %</span>
                  <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">{activeWard.low_income_slum_pct}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Outdoor Labor</span>
                  <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">{activeWard.outdoor_workers_count.toLocaleString()}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">UHC Distance</span>
                  <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">{activeWard.uhc_distance_km} km</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: SHAP / Feature Explanation Detail (Short Points) */}
          {activeSection === 'shap' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 mb-2.5">
                  SHAP Explainable AI Attribution Points ({activeWard.ward_name}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500">• Top Risk Driver:</span>{' '}
                    <strong className="text-rose-600 font-mono">
                      {shap.top_positive_risk_drivers[0]?.feature || 'LST Thermal Loading'} (+{shap.top_positive_risk_drivers[0]?.shap_value.toFixed(2) || '0.50'})
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500">• Secondary Driver:</span>{' '}
                    <strong className="text-amber-600 font-mono">
                      {shap.top_positive_risk_drivers[1]?.feature || 'Built-up Concrete Coverage'} (+{shap.top_positive_risk_drivers[1]?.shap_value.toFixed(2) || '0.35'})
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500">• Protective Offset:</span>{' '}
                    <strong className="text-emerald-600 font-mono">
                      {shap.top_mitigating_drivers[0]?.feature || 'Vegetation Canopy'} ({shap.top_mitigating_drivers[0]?.shap_value.toFixed(2) || '-0.15'})
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500">• Baseline Comparison:</span>{' '}
                    <strong className="text-slate-900 font-mono">
                      HVI {activeWard.normalized_hvi} vs City Mean
                    </strong>
                  </div>
                </div>
              </div>

              {/* Supporting SHAP Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <SHAPFeatureChart drivers={shap.features} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ThermometerSun,
  Trees,
  Droplets,
  Users,
  Building,
  HeartPulse,
  Wind,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';
import { WardData, Language, NavTab, CityConfig } from '../types';
import { calculateWardSHAP } from '../services/shapEngine';
import { getTranslation } from '../services/i18n';

interface WardInfoPanelProps {
  ward?: WardData;
  language: Language;
  onNavigateToTab: (tab: NavTab) => void;
  selectedCity?: CityConfig;
}

export const WardInfoPanel: React.FC<WardInfoPanelProps> = ({
  ward,
  language,
  onNavigateToTab,
  selectedCity
}) => {
  const t = getTranslation(language);
  const [activeSubTab, setActiveSubTab] = useState<
    'indicators' | 'demographics' | 'environmental' | 'weather' | 'recommendations' | 'social'
  >('indicators');

  if (!ward) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-3 shadow-2xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
          <Building className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Select an Area</h3>
        <p className="text-xs text-slate-600 max-w-xs mx-auto">
          Select an area on the map or search dropdown to view detailed heat-risk telemetry.
        </p>
      </div>
    );
  }

  const shapData = calculateWardSHAP(ward);
  const sortedDrivers = shapData.ranked_drivers || shapData.features;

  const riskBadge =
    ward.risk_category === 'HIGH'
      ? { label: 'High Risk', bg: 'bg-rose-100 text-rose-700 border-rose-200' }
      : ward.risk_category === 'MODERATE'
      ? { label: 'Moderate Risk', bg: 'bg-amber-100 text-amber-700 border-amber-200' }
      : { label: 'Low Risk', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };

  return (
    <div className="space-y-4">
      {/* 1. Primary Ward Information Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        {/* Ward Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {ward.zone_name} • PIN {ward.pin_codes[0]}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {ward.ward_name}{' '}
              <span className="text-xs font-medium text-slate-500">({ward.ward_id})</span>
            </h2>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full border ${riskBadge.bg}`}
          >
            {riskBadge.label}
          </span>
        </div>

        {/* 4 Core KPI Mini-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">HVI Score</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {ward.normalized_hvi ?? '5.0'}
              <span className="text-[10px] text-slate-400 font-normal">/10</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Exposure</div>
            <div className="text-base font-extrabold text-rose-600 mt-0.5">
              {ward.exposure_score ? ward.exposure_score.toFixed(1) : '5.2'}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Sensitivity</div>
            <div className="text-base font-extrabold text-amber-600 mt-0.5">
              {ward.sensitivity_score ? ward.sensitivity_score.toFixed(1) : '6.1'}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Adaptive Cap.</div>
            <div className="text-base font-extrabold text-emerald-600 mt-0.5">
              {ward.adaptive_capacity_score
                ? ward.adaptive_capacity_score.toFixed(1)
                : '4.8'}
            </div>
          </div>
        </div>

        {/* Action Link: View Full Profile */}
        <button
          id="btn-view-full-profile"
          onClick={() => onNavigateToTab('profile')}
          className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <span>View Full Area Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Ward Indicator Details via Compact Interactive Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Select Indicator for Detailed Analysis</span>
          <span className="text-[10px] text-slate-500 font-normal">Click to view</span>
        </div>

        {/* 6 Compact Clickable Cards/Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          <button
            id="btn-ind-hvi"
            onClick={() => setActiveSubTab('indicators')}
            className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'indicators'
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">HVI</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold mt-1">{ward.normalized_hvi ?? '5.0'}/10</div>
          </button>

          <button
            id="btn-ind-lst"
            onClick={() => setActiveSubTab('environmental')}
            className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'environmental'
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">LST Temp</span>
              <ThermometerSun className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold mt-1">{ward.lst_celsius}°C</div>
          </button>

          <button
            id="btn-ind-ndvi"
            onClick={() => setActiveSubTab('recommendations')}
            className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'recommendations'
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">NDVI Canopy</span>
              <Trees className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold mt-1">{ward.ndvi}</div>
          </button>

          <button
            id="btn-ind-pop"
            onClick={() => setActiveSubTab('demographics')}
            className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'demographics'
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pop Density</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold mt-1">{ward.population_density.toLocaleString()}/km²</div>
          </button>

          <button
            id="btn-ind-social"
            onClick={() => setActiveSubTab('social')}
            className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'social'
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Social Vuln.</span>
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold mt-1">{ward.low_income_slum_pct}% Slum</div>
          </button>

          <button
            id="btn-ind-weather"
            onClick={() => setActiveSubTab('weather')}
            className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeSubTab === 'weather'
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Weather</span>
              <Wind className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold mt-1">{ward.current_temp_celsius}°C / {ward.current_humidity_pct}%</div>
          </button>
        </div>

        {/* Selected Indicator Detail Container (Only active indicator content shown) */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
          {activeSubTab === 'indicators' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Heat Vulnerability Index (HVI) Breakdown</span>
                <span className="text-blue-600 font-mono font-bold">{ward.normalized_hvi ?? '5.0'} / 10</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Exposure</div>
                  <div className="font-extrabold text-rose-600 text-xs">{ward.exposure_score?.toFixed(1) || '5.2'}</div>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Sensitivity</div>
                  <div className="font-extrabold text-amber-600 text-xs">{ward.sensitivity_score?.toFixed(1) || '6.1'}</div>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Adaptive Cap.</div>
                  <div className="font-extrabold text-emerald-600 text-xs">{ward.adaptive_capacity_score?.toFixed(1) || '4.8'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                  <span className="text-slate-500">Thermal Loading:</span>
                  <span className="font-bold text-rose-600">{ward.lst_celsius}°C</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                  <span className="text-slate-500">Canopy Deficit:</span>
                  <span className="font-bold text-slate-800">{ward.ndvi < 0.18 ? 'High' : 'Low'}</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                  <span className="text-slate-500">Slum Population:</span>
                  <span className="font-bold text-slate-800">{ward.low_income_slum_pct}%</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                  <span className="text-slate-500">Healthcare Gap:</span>
                  <span className="font-bold text-slate-800">{ward.uhc_distance_km} km</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'environmental' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Land Surface Temperature (LST) & Satellite Thermal Data</span>
                <span className="text-rose-600 font-mono font-bold">{ward.lst_celsius}°C</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">NDVI Green Canopy Index:</span>
                  <span className="font-bold text-slate-900">{ward.ndvi}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">NDWI Surface Moisture Index:</span>
                  <span className="font-bold text-slate-900">{ward.ndwi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Land Use / Cover Class:</span>
                  <span className="font-bold text-slate-900">{ward.lulc_class}</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'recommendations' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>NDVI Vegetation & Canopy Analysis</span>
                <span className="text-emerald-600 font-mono font-bold">{ward.ndvi}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                  <span className="text-slate-500">Canopy Score:</span>
                  <span className="font-bold text-emerald-600">{ward.ndvi}</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-slate-800">{ward.ndvi >= 0.25 ? 'Lush' : ward.ndvi >= 0.18 ? 'Moderate' : 'Low Cover'}</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200 col-span-2">
                  <span className="text-slate-500">Target Action:</span>
                  <span className="font-bold text-slate-800">{ward.ndvi < 0.18 ? 'Targeted Afforestation' : 'Preserve Green Canopy'}</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'demographics' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Population & Density Demographics</span>
                <span className="text-purple-600 font-mono font-bold">{ward.population_density.toLocaleString()} / km²</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">Total Resident Population:</span>
                  <span className="font-bold text-slate-900">{ward.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">Land Area:</span>
                  <span className="font-bold text-slate-900">{ward.area_sq_km} sq km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Built-Up Density:</span>
                  <span className="font-bold text-slate-900">{ward.building_density_pct}%</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'social' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Social Vulnerability Indicators</span>
                <span className="text-amber-600 font-mono font-bold">{ward.low_income_slum_pct}% Vulnerable</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">Children (0-6 years):</span>
                  <span className="font-bold text-slate-900">{ward.children_0_6_pct}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">Elderly Population (60+):</span>
                  <span className="font-bold text-slate-900">{ward.elderly_60_plus_pct}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">Outdoor Daily Wage Workers:</span>
                  <span className="font-bold text-slate-900">{ward.outdoor_workers_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Dist. to Health Centre:</span>
                  <span className="font-bold text-slate-900">{ward.uhc_distance_km} km ({ward.uhc_name})</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'weather' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Real-Time Meteorological Telemetry</span>
                <span className="text-amber-600 font-mono font-bold">{ward.current_temp_celsius}°C</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">Relative Humidity:</span>
                  <span className="font-bold text-slate-900">{ward.current_humidity_pct}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-600">Apparent Heat Index ("Feels Like"):</span>
                  <span className="font-bold text-slate-900">{(ward.current_temp_celsius + (ward.current_humidity_pct / 100) * 5.2).toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Station Source:</span>
                  <span className="font-bold text-slate-900">{selectedCity?.weather?.station_name || 'IMD Regional Station'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. SHAP Feature Attribution Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top Contributing Factors (SHAP)
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('profile')}
            className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 font-medium">
          <span>Baseline: {selectedCity?.name || 'Municipal'} Average</span>
          <span className="text-blue-600 font-mono font-bold">+Risk / -Mitigation</span>
        </div>

        {/* Contribution Bars */}
        <div className="space-y-2">
          {sortedDrivers.slice(0, 5).map(driver => {
            const isPositive = driver.shap_value >= 0;
            const widthPct = Math.min(100, Math.abs(driver.shap_value) * 35);

            return (
              <div key={driver.feature_key} className="text-xs">
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-medium text-slate-700 truncate max-w-[190px]">
                    {driver.feature}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isPositive ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isPositive ? `+${driver.shap_value}` : `${driver.shap_value}`}
                  </span>
                </div>
                {/* Horizontal Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(8, widthPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Structured Heat Risk Points (Replaces running paragraph text) */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              {language === 'te' ? 'విశ్లేషణ సారాంశం' : 'Key Heat Telemetry Points'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Model Attribution</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500">Heat Risk</div>
              <div className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    ward.risk_category === 'HIGH'
                      ? 'bg-rose-500'
                      : ward.risk_category === 'MODERATE'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>{riskBadge.label}</span>
              </div>
            </div>

            <div className="p-2 rounded bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500">Average HVI</div>
              <div className="font-extrabold text-blue-600 mt-0.5">
                {ward.normalized_hvi ?? '5.0'} <span className="text-[10px] text-slate-400 font-normal">/ 10</span>
              </div>
            </div>

            <div className="p-2 rounded bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500">Temperature</div>
              <div className="font-extrabold text-rose-600 mt-0.5">{ward.lst_celsius}°C</div>
            </div>

            <div className="p-2 rounded bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500">Vegetation</div>
              <div className="font-extrabold text-emerald-600 mt-0.5">
                {ward.ndvi >= 0.25 ? 'High' : ward.ndvi >= 0.16 ? 'Moderate' : 'Low'}{' '}
                <span className="text-[10px] text-slate-500 font-mono font-normal">({ward.ndvi})</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-600">Population Exposure:</span>
            <span className="font-extrabold text-slate-900 text-xs">
              {ward.population_density >= 16000 ? 'High' : ward.population_density >= 9000 ? 'Moderate' : 'Low'}{' '}
              <span className="text-[10px] text-slate-500 font-mono font-normal">({ward.population_density.toLocaleString()}/km²)</span>
            </span>
          </div>

          <div className="p-2 rounded bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-600">Primary Risk Driver:</span>
            <span className="font-bold text-rose-600 text-xs truncate max-w-[170px]">
              {sortedDrivers[0]?.feature || 'Surface Thermal Load'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { GitCompare, Plus, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { WardData, Language } from '../types';
import { getTranslation } from '../services/i18n';
import { WardComparisonChart } from './PlotlyCharts';

interface WardComparisonViewProps {
  wards: WardData[];
  selectedWard?: WardData;
  language: Language;
}

export const WardComparisonView: React.FC<WardComparisonViewProps> = ({
  wards,
  selectedWard,
  language
}) => {
  const t = getTranslation(language);

  const [activeMetric, setActiveMetric] = useState<
    'hvi' | 'lst' | 'ndvi' | 'pop' | 'health'
  >('hvi');

  // Initialize with selected ward + high risk ward + low risk ward from active city
  const [selectedWardIds, setSelectedWardIds] = useState<string[]>(() => {
    if (!selectedWard || wards.length === 0) return [];
    return [
      selectedWard.ward_id,
      wards.find(w => w.ward_id !== selectedWard.ward_id && w.risk_category === 'HIGH')?.ward_id || wards.find(w => w.ward_id !== selectedWard.ward_id)?.ward_id,
      wards.find(w => w.ward_id !== selectedWard.ward_id && w.risk_category === 'LOW')?.ward_id || wards[1]?.ward_id
    ].filter((v, i, a) => v && a.indexOf(v) === i) as string[];
  });

  // Sync selected ward IDs when wards or selectedWard changes
  useEffect(() => {
    if (!wards || wards.length === 0) {
      setSelectedWardIds([]);
      return;
    }

    const primaryId = selectedWard?.ward_id || wards[0].ward_id;
    
    // Keep valid wards from current city's wards array
    const validOthers = selectedWardIds.filter(id => id !== primaryId && wards.some(w => w.ward_id === id));

    if (validOthers.length >= 1) {
      setSelectedWardIds([primaryId, ...validOthers].slice(0, 4));
    } else {
      const highRiskOther = wards.find(w => w.ward_id !== primaryId && w.risk_category === 'HIGH')?.ward_id;
      const secondId = highRiskOther || wards.find(w => w.ward_id !== primaryId)?.ward_id;
      const thirdId = wards.find(w => w.ward_id !== primaryId && w.ward_id !== secondId)?.ward_id;

      const newIds = [primaryId, secondId, thirdId].filter((v, i, a) => v && a.indexOf(v) === i) as string[];
      setSelectedWardIds(newIds);
    }
  }, [wards, selectedWard?.ward_id]);

  if (!selectedWard || wards.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
        <GitCompare className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Wards Available for Comparison</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select a city with complete municipal ward boundaries or ingest a GeoJSON layer to compare ward metrics.
        </p>
      </div>
    );
  }

  const activeWards = wards.filter(w => selectedWardIds.includes(w.ward_id));

  const handleAddWard = (wardId: string) => {
    if (!selectedWardIds.includes(wardId) && selectedWardIds.length < 4) {
      setSelectedWardIds([...selectedWardIds, wardId]);
    }
  };

  const handleRemoveWard = (wardId: string) => {
    if (selectedWardIds.length > 2) {
      setSelectedWardIds(selectedWardIds.filter(id => id !== wardId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Selector Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4 text-amber-600" />
              Comparative Geospatial Analytics Matrix
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.navComparison}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Side-by-side indicator benchmarking across GHMC wards for equitable resource allocation
            </p>
          </div>

          {/* Add Ward Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 whitespace-nowrap">Add Ward (Max 4):</span>
            <select
              onChange={e => {
                if (e.target.value) {
                  handleAddWard(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:ring-0 cursor-pointer shadow-2xs"
              defaultValue=""
            >
              <option value="" disabled>Select a ward to compare...</option>
              {wards
                .filter(w => !selectedWardIds.includes(w.ward_id))
                .map(w => (
                  <option key={w.ward_id} value={w.ward_id}>
                    + {w.ward_name} ({w.ward_id})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Selector Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Select Metric for Cross-Ward Comparison Chart:
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            id="btn-comp-hvi"
            onClick={() => setActiveMetric('hvi')}
            className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeMetric === 'hvi'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            HVI Comparison
          </button>

          <button
            id="btn-comp-lst"
            onClick={() => setActiveMetric('lst')}
            className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeMetric === 'lst'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            LST Comparison
          </button>

          <button
            id="btn-comp-ndvi"
            onClick={() => setActiveMetric('ndvi')}
            className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeMetric === 'ndvi'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            Tree Canopy / NDVI
          </button>

          <button
            id="btn-comp-pop"
            onClick={() => setActiveMetric('pop')}
            className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeMetric === 'pop'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            Population Density
          </button>

          <button
            id="btn-comp-health"
            onClick={() => setActiveMetric('health')}
            className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeMetric === 'health'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            Health Infrastructure Gap
          </button>
        </div>
      </div>

      {/* Plotly Multi-Bar Comparative Chart (Narrow, compact & centered) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col items-center">
        <div className="w-full max-w-[480px] text-center mb-3">
          <h3 className="text-sm font-bold text-slate-900 capitalize">
            Active Comparison: {activeMetric.toUpperCase()} Cross-Ward Analysis
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Benchmarking {activeWards.length} selected wards
          </span>
        </div>
        <div className="w-full max-w-[480px] mx-auto bg-slate-50/70 rounded-xl border border-slate-200 p-2 sm:p-4 shadow-2xs flex justify-center">
          <WardComparisonChart wards={activeWards} metric={activeMetric} language={language} />
        </div>
      </div>

      {/* Side-by-Side Comprehensive Indicator Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Granular Demographic & Geospatial Indicators
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {activeWards.length} Wards Benchmarked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-1/4">Indicator / Metric</th>
                {activeWards.map(w => (
                  <th key={w.ward_id} className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-slate-900 font-bold">{w.ward_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{w.ward_id}</div>
                      </div>
                      {activeWards.length > 2 && (
                        <button
                          onClick={() => handleRemoveWard(w.ward_id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1: HVI */}
              <tr className="bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900">Heat Vulnerability Index (HVI)</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono font-bold text-base">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        w.risk_category === 'HIGH'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : w.risk_category === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {w.normalized_hvi} / 10 ({w.risk_category})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 2: LST */}
              <tr>
                <td className="py-3 px-4 text-slate-600">Land Surface Temp (LST)</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono font-bold text-amber-700">
                    {w.lst_celsius}°C
                  </td>
                ))}
              </tr>

              {/* Row 3: NDVI */}
              <tr>
                <td className="py-3 px-4 text-slate-600">Vegetation Canopy (NDVI)</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono font-bold text-emerald-600">
                    {w.ndvi}
                  </td>
                ))}
              </tr>

              {/* Row 4: Population Density */}
              <tr>
                <td className="py-3 px-4 text-slate-600">Population Density</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono text-slate-700">
                    {w.population_density.toLocaleString()} /km²
                  </td>
                ))}
              </tr>

              {/* Row 5: Built-up Density */}
              <tr>
                <td className="py-3 px-4 text-slate-600">Built-Up Density</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono text-slate-700">
                    {w.building_density_pct}%
                  </td>
                ))}
              </tr>

              {/* Row 6: Nearest UHC Distance */}
              <tr>
                <td className="py-3 px-4 text-slate-600">Distance to UHC</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono text-slate-700">
                    {w.uhc_distance_km} km
                  </td>
                ))}
              </tr>

              {/* Row 7: Children 0-6 */}
              <tr>
                <td className="py-3 px-4 text-slate-600">Children Aged 0–6</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono text-slate-700">
                    {w.children_0_6_pct}%
                  </td>
                ))}
              </tr>

              {/* Row 8: Outdoor Workers */}
              <tr>
                <td className="py-3 px-4 text-slate-600">Outdoor Laborers</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono font-bold text-slate-900">
                    {w.outdoor_workers_count.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Row 9: Slum Population % */}
              <tr>
                <td className="py-3 px-4 text-slate-600">Slum Settlements %</td>
                {activeWards.map(w => (
                  <td key={w.ward_id} className="py-3 px-4 font-mono text-slate-700">
                    {w.low_income_slum_pct}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

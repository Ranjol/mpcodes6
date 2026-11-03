import React from 'react';
import {
  Layers,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  ThermometerSun
} from 'lucide-react';
import { WardData, Language, CityConfig } from '../types';
import { ZoneComparisonBarChart } from './PlotlyCharts';

interface ZoneComparisonViewProps {
  wards: WardData[];
  selectedCity: CityConfig;
  language: Language;
}

export const ZoneComparisonView: React.FC<ZoneComparisonViewProps> = ({
  wards,
  selectedCity
}) => {
  // Aggregate zone metrics dynamically from real ward data
  const zoneMap: {
    [key: string]: {
      totalHvi: number;
      totalLst: number;
      totalPop: number;
      highRiskCount: number;
      count: number;
    };
  } = {};

  wards.forEach(w => {
    const z = w.zone_name;
    const hvi = w.normalized_hvi ?? 5.0;
    if (!zoneMap[z]) {
      zoneMap[z] = { totalHvi: 0, totalLst: 0, totalPop: 0, highRiskCount: 0, count: 0 };
    }
    zoneMap[z].totalHvi += hvi;
    zoneMap[z].totalLst += w.lst_celsius;
    zoneMap[z].totalPop += w.population;
    if (hvi >= 7.0 || w.risk_category === 'HIGH') {
      zoneMap[z].highRiskCount += 1;
    }
    zoneMap[z].count += 1;
  });

  const zoneData = Object.keys(zoneMap).map(zone => {
    const count = zoneMap[zone].count;
    const avgHvi = Math.round((zoneMap[zone].totalHvi / count) * 100) / 100;
    const avgLst = Math.round((zoneMap[zone].totalLst / count) * 10) / 10;
    const riskCat = avgHvi >= 7.0 ? 'HIGH' : avgHvi >= 4.0 ? 'MODERATE' : 'LOW';

    return {
      zone,
      avgHvi,
      avgLst,
      totalPop: zoneMap[zone].totalPop,
      highRiskCount: zoneMap[zone].highRiskCount,
      count,
      riskCat
    };
  });

  const sortedByRisk = [...zoneData].sort((a, b) => b.avgHvi - a.avgHvi);
  const highestRiskZone = sortedByRisk[0];
  const lowestRiskZone = sortedByRisk[sortedByRisk.length - 1];

  const cityMeanHvi =
    wards.length > 0
      ? (wards.reduce((acc, w) => acc + (w.normalized_hvi ?? 5.0), 0) / wards.length).toFixed(2)
      : '5.00';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Context Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-emerald-600" />
              Administrative Zone Benchmarking
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Zone Comparison Analytics
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Comparative heat vulnerability across all {zoneData.length} administrative zones in {selectedCity.name}.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Top Risk: {highestRiskZone?.zone} ({highestRiskZone?.avgHvi}/10)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold">
              City Mean HVI: {cityMeanHvi}/10
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Zones</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{zoneData.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">{selectedCity.name} Jurisdiction</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Highest Risk Zone</div>
            <div className="text-lg font-extrabold text-rose-600 mt-0.5 truncate max-w-[140px]">
              {highestRiskZone?.zone}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Avg HVI: {highestRiskZone?.avgHvi}/10</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lowest Risk Zone</div>
            <div className="text-lg font-extrabold text-emerald-600 mt-0.5 truncate max-w-[140px]">
              {lowestRiskZone?.zone}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Avg HVI: {lowestRiskZone?.avgHvi}/10</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wards Monitored</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{wards.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Active Census Wards</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Zone Comparison Bar Graph (Centered, Clear & Responsive) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Zone-wise Average Heat Vulnerability Index (HVI)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct comparative bar chart ranking zones from highest to lowest heat vulnerability
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              High (≥7.0)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Moderate (4.0–6.9)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Low (&lt;4.0)
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-50/70 rounded-xl border border-slate-200 p-3 sm:p-5 shadow-2xs">
          <ZoneComparisonBarChart zoneData={zoneData} />
        </div>
      </div>

      {/* Zone Benchmarking Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Administrative Zone Comparative Matrix
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {zoneData.length} Zones Benchmarked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Zone Name</th>
                <th className="py-3 px-4">Total Wards</th>
                <th className="py-3 px-4">Average HVI</th>
                <th className="py-3 px-4">Risk Category</th>
                <th className="py-3 px-4">Mean Surface Temp (LST)</th>
                <th className="py-3 px-4">Estimated Population</th>
                <th className="py-3 px-4">High Risk Wards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedByRisk.map(z => (
                <tr key={z.zone} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{z.zone}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">{z.count} Wards</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{z.avgHvi} / 10</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                        z.riskCat === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : z.riskCat === 'MODERATE'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {z.riskCat}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{z.avgLst}°C</td>
                  <td className="py-3 px-4 font-mono">{z.totalPop.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className={z.highRiskCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                      {z.highRiskCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

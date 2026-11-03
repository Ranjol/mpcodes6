import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Trees,
  Building,
  SunMedium,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { WardData, Language } from '../types';
import { getTranslation } from '../services/i18n';
import { simulateScenario } from '../services/scenarioEngine';
import { ScenarioDeltaChart } from './PlotlyCharts';

interface ScenarioViewProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language
}) => {
  const t = getTranslation(language);

  const [activeScenarioType, setActiveScenarioType] = useState<
    'green' | 'urban' | 'landuse'
  >('green');
  const [hasRunSimulation, setHasRunSimulation] = useState<boolean>(false);

  const [deltaGreen, setDeltaGreen] = useState<number>(20); // +20% green cover
  const [deltaUrban, setDeltaUrban] = useState<number>(0); // 0% urban expansion
  const [deltaCoolRoof, setDeltaCoolRoof] = useState<number>(15); // +15% cool roofs

  if (!selectedWard) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
        <Sliders className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No Ward Selected for Simulation</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Please select an administrative ward on the map or search bar to test climate intervention scenarios like urban afforestation and cool roofs.
        </p>
      </div>
    );
  }

  const simulation = simulateScenario(selectedWard, deltaGreen, deltaUrban, deltaCoolRoof);

  const handleReset = () => {
    setDeltaGreen(0);
    setDeltaUrban(0);
    setDeltaCoolRoof(0);
  };

  const handlePresetGreening = () => {
    setDeltaGreen(35);
    setDeltaUrban(0);
    setDeltaCoolRoof(25);
  };

  const handlePresetUncontrolledUrban = () => {
    setDeltaGreen(0);
    setDeltaUrban(30);
    setDeltaCoolRoof(0);
  };

  return (
    <div className="space-y-6">
      {/* Title & Ward Selection Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-amber-600" />
                What-If Urban Planning Simulator
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold tracking-wide">
                Scenario / Model Simulation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.scenarioTitle}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.scenarioSubtitle} &bull; <em className="text-slate-500 font-normal">Model simulation for decision support (not a guaranteed prediction).</em>
            </p>
          </div>

          {/* Unified Target Area Indicator & Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Target Area:</span>
              <span className="text-xs font-bold text-slate-900">{selectedWard.ward_name}</span>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                HVI: {selectedWard.normalized_hvi}/10
              </span>
            </div>

            {/* Change Area Selector */}
            <select
              value={selectedWard.ward_id}
              onChange={e => {
                const target = wards.find(w => w.ward_id === e.target.value);
                if (target) onSelectWard(target);
              }}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:ring-0 cursor-pointer shadow-2xs"
            >
              {wards.map(w => (
                <option key={w.ward_id} value={w.ward_id}>
                  Switch Area: {w.ward_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scenario Selection Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex justify-between items-center">
          <span>Select Scenario Type</span>
          <span className="text-[10px] text-slate-500 font-normal">Choose scenario, configure parameters, then click Run Scenario</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            id="btn-scen-green"
            onClick={() => {
              setActiveScenarioType('green');
              setDeltaGreen(25);
              setDeltaUrban(0);
              setDeltaCoolRoof(15);
              setHasRunSimulation(false);
            }}
            className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeScenarioType === 'green'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            Green Cover Scenario
          </button>

          <button
            id="btn-scen-urban"
            onClick={() => {
              setActiveScenarioType('urban');
              setDeltaGreen(0);
              setDeltaUrban(25);
              setDeltaCoolRoof(0);
              setHasRunSimulation(false);
            }}
            className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeScenarioType === 'urban'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            Urban Expansion Scenario
          </button>

          <button
            id="btn-scen-landuse"
            onClick={() => {
              setActiveScenarioType('landuse');
              setDeltaGreen(15);
              setDeltaUrban(10);
              setDeltaCoolRoof(20);
              setHasRunSimulation(false);
            }}
            className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeScenarioType === 'landuse'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            Land-use Change Scenario
          </button>
        </div>
      </div>

      {/* Interactive Controls & Run Scenario Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Column */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Scenario Parameters ({activeScenarioType.toUpperCase()})
            </span>
            <button
              onClick={handleReset}
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-normal"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </h3>

          {/* Slider 1: Green Canopy Cover */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-800 font-semibold flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-emerald-600" />
                {t.paramGreenCover}
              </label>
              <span className="font-mono font-bold text-emerald-700 text-sm">+{deltaGreen}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={deltaGreen}
              onChange={e => {
                setDeltaGreen(Number(e.target.value));
                setHasRunSimulation(false);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Slider 2: Urban Expansion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-800 font-semibold flex items-center gap-1.5">
                <Building className="w-4 h-4 text-rose-600" />
                {t.paramUrbanExpansion}
              </label>
              <span className="font-mono font-bold text-rose-700 text-sm">+{deltaUrban}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={deltaUrban}
              onChange={e => {
                setDeltaUrban(Number(e.target.value));
                setHasRunSimulation(false);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Slider 3: Cool Roofs & High-Albedo Retrofit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-800 font-semibold flex items-center gap-1.5">
                <SunMedium className="w-4 h-4 text-sky-600" />
                {t.paramCoolRoofs}
              </label>
              <span className="font-mono font-bold text-sky-700 text-sm">+{deltaCoolRoof}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={deltaCoolRoof}
              onChange={e => {
                setDeltaCoolRoof(Number(e.target.value));
                setHasRunSimulation(false);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Prominent Run Scenario Button */}
          <button
            id="btn-run-scenario"
            onClick={() => setHasRunSimulation(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Run Scenario
          </button>
        </div>

        {/* Outcome Cards & Delta Visualization (Conditioned on hasRunSimulation) */}
        <div className="lg:col-span-7 space-y-4">
          {hasRunSimulation ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Side-by-side Baseline vs Simulated Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Baseline Card */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.currentBaseline}
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                    {simulation.baseline.hvi} / 10
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    {simulation.baseline.risk_category}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 font-mono">
                    LST: {simulation.baseline.lst_celsius}°C
                  </div>
                </div>

                {/* Simulated Future Card */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-center relative overflow-hidden shadow-2xs">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    {t.simulatedFuture}
                  </div>
                  <div
                    className={`text-2xl font-black font-mono mt-1 ${
                      simulation.simulated.hvi < simulation.baseline.hvi ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {simulation.simulated.hvi} / 10
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    {simulation.simulated.risk_category}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 font-mono">
                    LST: {simulation.simulated.lst_celsius}°C
                  </div>
                </div>

                {/* Net Delta Impact Card */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-center flex flex-col justify-center shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.netDeltaChange}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    {simulation.delta.hvi_change < 0 ? (
                      <TrendingDown className="w-5 h-5 text-emerald-600" />
                    ) : simulation.delta.hvi_change > 0 ? (
                      <TrendingUp className="w-5 h-5 text-rose-600" />
                    ) : null}
                    <span
                      className={`text-2xl font-black font-mono ${
                        simulation.delta.hvi_change < 0 ? 'text-emerald-600' : simulation.delta.hvi_change > 0 ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {simulation.delta.hvi_change > 0 ? `+${simulation.delta.hvi_change}` : `${simulation.delta.hvi_change}`}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    LST Impact: {simulation.delta.lst_change_celsius > 0 ? `+${simulation.delta.lst_change_celsius}` : `${simulation.delta.lst_change_celsius}`}°C
                  </div>
                </div>
              </div>

              {/* Recommended Action & Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  Recommended Intervention Directive
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {simulation.impact_summary_en}
                </p>
              </div>

              {/* Plotly Delta Comparison Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Comparative Impact Metrics (Baseline vs Simulated)
                </h4>
                <ScenarioDeltaChart result={simulation} />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-2xs">
              <Sparkles className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Scenario Simulation Prepared</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Adjust green cover, urban growth, or cool roof parameters on the left, then click <strong>Run Scenario</strong> to calculate HVI score shifts, LST impacts, and recommended policy interventions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

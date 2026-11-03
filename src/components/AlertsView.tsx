import React, { useState } from 'react';
import { BellRing, Flame, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { WardData, Language, AlertItem } from '../types';
import { getTranslation } from '../services/i18n';
import { evaluateWardAlerts } from '../services/alertEngine';

interface AlertsViewProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language
}) => {
  const t = getTranslation(language);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'RED' | 'AMBER' | 'YELLOW'>('ALL');
  const [expandedAlertIds, setExpandedAlertIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedAlertIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Gather all active alerts
  const allAlerts: AlertItem[] = [];
  wards.forEach(w => {
    const wardAlerts = evaluateWardAlerts(w);
    allAlerts.push(...wardAlerts);
  });

  const filteredAlerts = filterLevel === 'ALL'
    ? allAlerts
    : allAlerts.filter(a => a.level === filterLevel);

  const redCount = allAlerts.filter(a => a.level === 'RED').length;
  const amberCount = allAlerts.filter(a => a.level === 'AMBER').length;
  const yellowCount = allAlerts.filter(a => a.level === 'YELLOW').length;

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
              <BellRing className="w-4 h-4 text-rose-600 animate-bounce" />
              Municipal Heatwave Action Early-Warning Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.navAlerts}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Automated thresholds evaluated against Steadman Heat Index, Landsat thermal emissivity, and vulnerable demographic clustering
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Active Monitoring: {wards.length} Wards
            </span>
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={() => setFilterLevel('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterLevel === 'ALL' ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Alerts ({allAlerts.length})
          </button>
          <button
            onClick={() => setFilterLevel('RED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              filterLevel === 'RED' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Flame className="w-3 h-3" />
            Critical Red Alerts ({redCount})
          </button>
          <button
            onClick={() => setFilterLevel('AMBER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              filterLevel === 'AMBER' ? 'bg-amber-500 text-white shadow-2xs' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Amber Warnings ({amberCount})
          </button>
          <button
            onClick={() => setFilterLevel('YELLOW')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              filterLevel === 'YELLOW' ? 'bg-yellow-500 text-white shadow-2xs' : 'bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100'
            }`}
          >
            <Info className="w-3 h-3" />
            Yellow Advisories ({yellowCount})
          </button>
        </div>
      </div>

      {/* Compact Alerts Feed with Reveal-on-Click */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const isRed = alert.level === 'RED';
          const isAmber = alert.level === 'AMBER';
          const isExpanded = expandedAlertIds.includes(alert.alert_id);

          const cardBorder = isRed
            ? 'border-rose-200 bg-rose-50/50'
            : isAmber
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-yellow-200 bg-yellow-50/30';

          const badgeBg = isRed
            ? 'bg-rose-600 text-white'
            : isAmber
            ? 'bg-amber-500 text-white'
            : 'bg-yellow-500 text-white';

          return (
            <div
              key={alert.alert_id}
              className={`border rounded-xl p-4 shadow-2xs transition bg-white ${cardBorder}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${badgeBg}`}>
                    {alert.level} LEVEL
                  </span>
                  <span
                    onClick={() => {
                      const w = wards.find(item => item.ward_id === alert.ward_id);
                      if (w) onSelectWard(w);
                    }}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer"
                  >
                    {alert.ward_name} ({alert.ward_id})
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-sm">
                    {alert.headline_en}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                    {alert.issued_at}
                  </span>
                  <button
                    onClick={() => toggleExpand(alert.alert_id)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#2563EB] hover:text-white text-slate-800 text-xs font-bold transition border border-slate-200 cursor-pointer"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {/* Revealable Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 animate-in fade-in duration-150">
                  <div className="text-xs font-mono text-slate-800 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 w-fit">
                    Trigger Telemetry: {alert.trigger_metric}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Municipal Protocol:</strong> {alert.advisory_en}
                  </p>

                  {language === 'te' && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <h5 className="text-xs font-bold text-amber-900 mb-1">
                        {alert.headline_te}
                      </h5>
                      <p className="text-xs text-amber-900/90 font-sans leading-relaxed">
                        <strong>కార్యాచరణ మార్గదర్శకం:</strong> {alert.advisory_te}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

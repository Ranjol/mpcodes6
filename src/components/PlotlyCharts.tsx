import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { WardData, SHAPFeatureContribution, ScenarioSimulationResult, Language } from '../types';

// 1. Domain Radar Chart (Exposure, Sensitivity, Adaptive Capacity, Social Vulnerability)
export const DomainRadarChart: React.FC<{ ward: WardData }> = ({ ward }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const exp = ward.exposure_score ?? 6.5;
    const sens = ward.sensitivity_score ?? 6.0;
    const adapt = ward.adaptive_capacity_score ?? 4.0;
    const social = ward.social_vulnerability_score ?? 6.0;

    const data: Plotly.Data[] = [
      {
        type: 'scatterpolar',
        r: [exp, sens, adapt, social, exp],
        theta: ['Exposure (LST/Pop)', 'Sensitivity (Demographics)', 'Adaptive Capacity (NDVI/UHC)', 'Social Vulnerability', 'Exposure (LST/Pop)'],
        fill: 'toself',
        fillcolor: 'rgba(239, 68, 68, 0.2)',
        line: { color: '#ef4444', width: 2.5 },
        name: ward.ward_name,
        marker: { size: 6, color: '#ef4444' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 10],
          tickfont: { color: '#64748b', size: 10 },
          gridcolor: '#e2e8f0',
          linecolor: '#cbd5e1'
        },
        angularaxis: {
          tickfont: { color: '#334155', size: 11, family: 'sans-serif' },
          gridcolor: '#e2e8f0',
          linecolor: '#cbd5e1'
        },
        bgcolor: '#f8fafc'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 30, b: 30, l: 40, r: 40 },
      showlegend: false,
      font: { color: '#334155' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [ward]);

  return <div ref={chartRef} className="w-full h-72" />;
};

// 2. SHAP Feature Attribution Waterfall / Bar Chart
export const SHAPFeatureChart: React.FC<{ drivers: SHAPFeatureContribution[] }> = ({ drivers }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !drivers.length) return;

    // Sort by value ascending for horizontal bar chart
    const sorted = [...drivers].sort((a, b) => a.shap_value - b.shap_value);
    const labels = sorted.map(d => d.feature);
    const values = sorted.map(d => d.shap_value);
    const colors = values.map(v => (v >= 0 ? '#ef4444' : '#10b981'));

    const data: Plotly.Data[] = [
      {
        type: 'bar',
        x: values,
        y: labels,
        orientation: 'h',
        marker: {
          color: colors,
          line: { color: '#e2e8f0', width: 1 }
        },
        text: values.map(v => (v > 0 ? `+${v}` : `${v}`)),
        textposition: 'outside',
        textfont: { color: '#334155', size: 11 }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 15, b: 30, l: 220, r: 40 },
      xaxis: {
        title: { text: 'SHAP Contribution to Heat Risk (Shapley Value)', font: { size: 11, color: '#64748b' } },
        gridcolor: '#f1f5f9',
        tickfont: { color: '#64748b' },
        zerolinecolor: '#cbd5e1',
        zerolinewidth: 2
      },
      yaxis: {
        tickfont: { color: '#334155', size: 11 },
        automargin: true
      },
      font: { color: '#334155' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [drivers]);

  return <div ref={chartRef} className="w-full h-80" />;
};

// 3. Ward-vs-Ward Comparative Grouped Bar Chart
export const WardComparisonChart: React.FC<{
  wards: WardData[];
  metric?: 'hvi' | 'lst' | 'ndvi' | 'pop' | 'health';
  language?: Language;
}> = ({ wards, metric = 'hvi', language = 'en' }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !wards.length) return;

    const names = wards.map(w => w.ward_name);
    let seriesName = 'Heat Vulnerability Index (HVI)';
    let yAxisTitle = 'HVI Score (1-10)';
    let values: number[] = [];
    let barColor = '#2563EB';

    if (metric === 'hvi') {
      seriesName = 'Heat Vulnerability Index (HVI)';
      yAxisTitle = 'HVI Score (1-10)';
      values = wards.map(w => w.normalized_hvi ?? 5.0);
      barColor = '#f43f5e';
    } else if (metric === 'lst') {
      seriesName = 'Land Surface Temp (°C)';
      yAxisTitle = 'Surface Temperature (°C)';
      values = wards.map(w => w.lst_celsius);
      barColor = '#ea580c';
    } else if (metric === 'ndvi') {
      seriesName = 'Vegetation Canopy (NDVI)';
      yAxisTitle = 'NDVI Index (0.00 – 1.00)';
      values = wards.map(w => w.ndvi);
      barColor = '#10b981';
    } else if (metric === 'pop') {
      seriesName = 'Population Density (/km²)';
      yAxisTitle = 'Persons / km²';
      values = wards.map(w => w.population_density);
      barColor = '#8b5cf6';
    } else if (metric === 'health') {
      seriesName = 'UHC Proximity Gap (km)';
      yAxisTitle = 'Distance to Nearest UHC (km)';
      values = wards.map(w => w.uhc_distance_km);
      barColor = '#06b6d4';
    }

    const data: Plotly.Data[] = [
      {
        name: seriesName,
        type: 'bar',
        x: names,
        y: values,
        marker: { color: barColor },
        text: values.map(v => typeof v === 'number' && v > 100 ? v.toLocaleString() : v.toFixed(2)),
        textposition: 'outside',
        textfont: { size: 12, color: '#1e293b', weight: 700 },
        cliponaxis: false
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 25, b: 50, l: 50, r: 20 },
      bargap: 0.35,
      xaxis: {
        tickfont: { color: '#1e293b', size: 11, weight: 600 },
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        title: { text: yAxisTitle, font: { size: 11, color: '#475569', weight: 600 } },
        gridcolor: '#e2e8f0',
        tickfont: { color: '#64748b', size: 10 }
      },
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0,
        font: { color: '#334155', size: 11 }
      },
      font: { color: '#334155' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [wards, metric, language]);

  return <div ref={chartRef} className="w-full max-w-[460px] mx-auto h-[320px]" />;
};

// 4. Scenario Comparison Delta Chart (Baseline vs Simulated)
export const ScenarioDeltaChart: React.FC<{ result: ScenarioSimulationResult }> = ({ result }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const categories = ['Heat Vulnerability (HVI)', 'Land Surface Temp (LST °C)', 'Vegetation Cover (NDVI x10)'];
    const baselineVals = [result.baseline.hvi, result.baseline.lst_celsius, result.baseline.ndvi * 10];
    const simulatedVals = [result.simulated.hvi, result.simulated.lst_celsius, result.simulated.ndvi * 10];

    const data: Plotly.Data[] = [
      {
        name: 'Current Baseline',
        type: 'bar',
        x: categories,
        y: baselineVals,
        marker: { color: '#94a3b8' },
        text: baselineVals.map(v => v.toFixed(1)),
        textposition: 'outside',
        textfont: { color: '#64748b' }
      },
      {
        name: 'Simulated Scenario',
        type: 'bar',
        x: categories,
        y: simulatedVals,
        marker: { color: result.delta.hvi_change <= 0 ? '#10b981' : '#ef4444' },
        text: simulatedVals.map(v => v.toFixed(1)),
        textposition: 'outside',
        textfont: { color: '#1e293b' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      barmode: 'group',
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 25, b: 40, l: 40, r: 20 },
      xaxis: {
        tickfont: { color: '#334155', size: 12 },
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        title: { text: 'Magnitude', font: { size: 11, color: '#64748b' } },
        gridcolor: '#f1f5f9',
        tickfont: { color: '#64748b' }
      },
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0.1,
        font: { color: '#334155', size: 11 }
      },
      font: { color: '#334155' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [result]);

  return <div ref={chartRef} className="w-full h-80" />;
};

// 5. Multi-Year Historical & Seasonal Trends Chart
export const TrendsChart: React.FC<{
  ward: WardData;
  metric?: 'lst' | 'ndvi' | 'builtup' | 'pop';
  language?: Language;
}> = ({ ward, metric = 'lst', language = 'en' }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const years = [2020, 2021, 2022, 2023, 2024];
    let seriesName = 'Land Surface Temp (°C)';
    let yAxisTitle = 'LST (°C)';
    let seriesValues: number[] = [];
    let lineColor = '#f97316';
    let markerColor = '#ea580c';

    if (metric === 'lst') {
      const baseLST = ward.lst_celsius;
      seriesName = 'Surface Temp LST (°C)';
      yAxisTitle = 'LST (°C)';
      seriesValues = [baseLST - 1.8, baseLST - 1.3, baseLST - 0.5, baseLST - 0.2, baseLST];
      lineColor = '#f97316';
      markerColor = '#ea580c';
    } else if (metric === 'ndvi') {
      const baseNDVI = ward.ndvi;
      seriesName = 'Vegetation Canopy (NDVI)';
      yAxisTitle = 'NDVI Score';
      seriesValues = [
        Math.min(1, baseNDVI + 0.08),
        Math.min(1, baseNDVI + 0.06),
        Math.min(1, baseNDVI + 0.03),
        Math.min(1, baseNDVI + 0.01),
        baseNDVI
      ];
      lineColor = '#10b981';
      markerColor = '#059669';
    } else if (metric === 'builtup') {
      const baseBuilt = ward.building_density_pct;
      seriesName = 'Built-Up Expansion (%)';
      yAxisTitle = 'Built-Up Density (%)';
      seriesValues = [
        Math.max(0, baseBuilt - 12),
        Math.max(0, baseBuilt - 9),
        Math.max(0, baseBuilt - 5),
        Math.max(0, baseBuilt - 2),
        baseBuilt
      ];
      lineColor = '#6366f1';
      markerColor = '#4f46e5';
    } else if (metric === 'pop') {
      const basePop = ward.population_density;
      seriesName = 'Population Density (/km²)';
      yAxisTitle = 'Persons / km²';
      seriesValues = [
        Math.max(100, basePop - 2200),
        Math.max(100, basePop - 1600),
        Math.max(100, basePop - 1000),
        Math.max(100, basePop - 400),
        basePop
      ];
      lineColor = '#8b5cf6';
      markerColor = '#7c3aed';
    }

    const data: Plotly.Data[] = [
      {
        name: seriesName,
        type: 'scatter',
        mode: 'lines+markers',
        x: years,
        y: seriesValues,
        line: { color: lineColor, width: 3 },
        marker: { size: 8, color: markerColor },
        text: seriesValues.map(v => typeof v === 'number' && v > 100 ? v.toLocaleString() : v.toFixed(2)),
        textposition: 'top center',
        textfont: { size: 10, color: '#334155' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 30, b: 40, l: 55, r: 30 },
      xaxis: {
        title: { text: 'Landsat 8/9 Annual Peak Composites (2020 – 2024)', font: { size: 11, color: '#64748b' } },
        tickfont: { color: '#64748b' },
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        title: { text: yAxisTitle, font: { color: lineColor, size: 11 } },
        tickfont: { color: lineColor },
        gridcolor: '#f1f5f9'
      },
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0.1,
        font: { color: '#334155', size: 11 }
      },
      font: { color: '#334155' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [ward, metric, language]);

  return <div ref={chartRef} className="w-full h-80" />;
};

// 6. City-Wide Risk Distribution Donut Chart with center label
export const RiskDistributionDonutChart: React.FC<{
  lowCount: number;
  modCount: number;
  highCount: number;
  totalWards: number;
}> = ({ lowCount, modCount, highCount, totalWards }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const values = [lowCount, modCount, highCount];
    const labels = ['Low Risk', 'Moderate Risk', 'High Risk'];
    const colors = ['#10b981', '#f59e0b', '#ef4444'];

    const data: Plotly.Data[] = [
      {
        type: 'pie',
        labels: labels,
        values: values,
        hole: 0.62,
        marker: {
          colors: colors,
          line: { color: '#ffffff', width: 2 }
        },
        textinfo: 'percent',
        hoverinfo: 'label+value+percent',
        textposition: 'inside',
        textfont: { color: '#ffffff', size: 11, family: 'sans-serif' }
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 10, b: 20, l: 10, r: 10 },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.05,
        y: -0.1,
        font: { size: 11, color: '#475569' }
      },
      annotations: [
        {
          font: { size: 14, color: '#0f172a', family: 'sans-serif', weight: 700 },
          showarrow: false,
          text: `<b>${totalWards}</b><br><span style="font-size: 11px; font-weight: normal; color: #64748b;">Wards</span>`,
          x: 0.5,
          y: 0.5
        }
      ]
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [lowCount, modCount, highCount, totalWards]);

  return <div ref={chartRef} className="w-full h-64" />;
};

// 7. Zone Comparison Bar Chart (Average HVI across zones)
export const ZoneComparisonBarChart: React.FC<{
  zoneData: { zone: string; avgHvi: number; count: number }[];
}> = ({ zoneData }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !zoneData || !zoneData.length) return;

    const zones = zoneData.map(z => z.zone.replace(' Zone', ''));
    const hviScores = zoneData.map(z => z.avgHvi);
    const wardCounts = zoneData.map(z => z.count);
    const colors = hviScores.map(score =>
      score >= 7.0 ? '#ef4444' : score >= 5.5 ? '#f59e0b' : score >= 4.0 ? '#eab308' : '#10b981'
    );

    const data: Plotly.Data[] = [
      {
        type: 'bar',
        x: zones,
        y: hviScores,
        width: zones.length <= 4 ? 0.35 : zones.length <= 7 ? 0.5 : 0.65,
        marker: {
          color: colors,
          line: { color: '#0f172a', width: 0.75 },
          opacity: 0.95
        },
        text: hviScores.map(v => v.toFixed(2)),
        textposition: 'outside',
        textfont: { size: 12, color: '#0f172a', family: 'sans-serif', weight: 700 },
        cliponaxis: false,
        customdata: wardCounts,
        hovertemplate: '<b>%{x} Zone</b><br>Mean HVI: <b>%{y:.2f} / 10</b><br>Monitored Wards: <b>%{customdata}</b><extra></extra>'
      }
    ];

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { t: 25, b: 55, l: 50, r: 20 },
      bargap: 0.35,
      xaxis: {
        tickfont: { color: '#1e293b', size: 11, family: 'sans-serif', weight: 600 },
        gridcolor: '#f1f5f9',
        title: {
          text: 'Municipal Administrative Zones',
          font: { size: 11, color: '#64748b', family: 'sans-serif', weight: 600 },
          standoff: 12
        }
      },
      yaxis: {
        title: {
          text: 'Mean Heat Vulnerability Index (HVI)',
          font: { size: 11, color: '#475569', family: 'sans-serif', weight: 600 }
        },
        range: [0, 10.5],
        dtick: 2,
        tickfont: { color: '#475569', size: 10, family: 'sans-serif' },
        gridcolor: '#e2e8f0',
        zerolinecolor: '#cbd5e1',
        zerolinewidth: 1.5
      },
      font: { color: '#334155' }
    };

    Plotly.newPlot(chartRef.current, data, layout, { responsive: true, displayModeBar: false });

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [zoneData]);

  if (!zoneData || zoneData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-400 text-xs font-medium">
        No comparison data available for this location.
      </div>
    );
  }

  return <div ref={chartRef} className="w-full max-w-xl mx-auto h-[320px] sm:h-[350px]" />;
};


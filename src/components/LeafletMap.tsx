import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Eye,
  Info,
  ThermometerSun,
  Trees,
  Building2,
  Droplets,
  Users,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Satellite,
  Compass,
  Database,
  Sparkles,
  Crosshair,
  Plus,
  Minus,
  Map as MapIcon
} from 'lucide-react';
import { WardData, Language, CityConfig } from '../types';
import { getTranslation } from '../services/i18n';

export type MapRiskFilter = 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_HIGH' | 'VERY_LOW' | 'ALL' | null;

export interface LeafletMapProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  language: Language;
  heightClass?: string;
  selectedCity?: CityConfig;
  onOpenPipelineModal?: () => void;
  onMapClick?: (lat: number, lon: number) => void;
  riskFilter?: MapRiskFilter;
  onRiskFilterChange?: (filter: MapRiskFilter) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  language,
  heightClass = 'h-[540px]',
  selectedCity,
  onOpenPipelineModal,
  onMapClick,
  riskFilter: propRiskFilter,
  onRiskFilterChange
}) => {
  const t = getTranslation(language);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const uhcLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  const cityCenter: [number, number] = selectedCity?.center ?? [17.4065, 78.4772];
  const cityZoom: number = selectedCity?.default_zoom ?? 11;

  const [activeLayerMode, setActiveLayerMode] = useState<
    'HVI' | 'LST' | 'NDVI' | 'NDWI' | 'POP' | 'LULC' | 'SOCIAL' | 'ADMIN' | 'WEATHER'
  >('HVI');
  const [showUHCMarkers, setShowUHCMarkers] = useState<boolean>(false);
  const [basemapType, setBasemapType] = useState<'streets' | 'satellite' | 'dark' | 'terrain'>('streets');
  const [internalRiskFilter, setInternalRiskFilter] = useState<MapRiskFilter>(null);

  const currentRiskFilter = propRiskFilter !== undefined ? propRiskFilter : internalRiskFilter;
  const setRiskFilter = (filter: MapRiskFilter) => {
    setInternalRiskFilter(filter);
    if (onRiskFilterChange) onRiskFilterChange(filter);
  };

  // Dynamic feature coloring based on active layer mode
  const getFeatureColor = (ward: WardData): string => {
    if (activeLayerMode === 'HVI') {
      const hvi = ward.normalized_hvi ?? 5.0;
      if (hvi >= 7.0) return '#ef4444'; // Red (High Risk: 7-10)
      if (hvi >= 4.0) return '#f59e0b'; // Amber (Moderate Risk: 4-6)
      return '#10b981'; // Green (Low Risk: 1-3)
    } else if (activeLayerMode === 'LST') {
      const lst = ward.lst_celsius;
      if (lst >= 42.0) return '#b91c1c'; // Deep Red
      if (lst >= 40.0) return '#ea580c'; // Orange Red
      if (lst >= 38.0) return '#f59e0b'; // Yellow Amber
      return '#0284c7'; // Cool Blue
    } else if (activeLayerMode === 'NDVI') {
      const ndvi = ward.ndvi;
      if (ndvi >= 0.30) return '#059669'; // Lush Green
      if (ndvi >= 0.20) return '#84cc16'; // Moderate Green
      if (ndvi >= 0.14) return '#d97706'; // Sparse Amber
      return '#78350f'; // Barren / Concrete
    } else if (activeLayerMode === 'NDWI') {
      const ndwi = ward.ndwi;
      if (ndwi >= 0.05) return '#0284c7'; // High Moisture
      if (ndwi >= -0.08) return '#38bdf8'; // Moderate Moisture
      if (ndwi >= -0.16) return '#94a3b8'; // Dry Surface
      return '#d97706'; // Severe Moisture Deficit
    } else if (activeLayerMode === 'POP') {
      const den = ward.population_density;
      if (den >= 20000) return '#7c3aed'; // Ultra Dense
      if (den >= 14000) return '#a855f7'; // Dense
      if (den >= 8000) return '#38bdf8'; // Moderate
      return '#64748b'; // Low Density
    } else if (activeLayerMode === 'SOCIAL') {
      const lowInc = ward.low_income_slum_pct;
      if (lowInc >= 35) return '#9333ea';
      if (lowInc >= 20) return '#c084fc';
      return '#e9d5ff';
    } else if (activeLayerMode === 'ADMIN') {
      return '#3b82f6';
    } else if (activeLayerMode === 'WEATHER') {
      const temp = ward.current_temp_celsius;
      if (temp >= 40) return '#dc2626';
      if (temp >= 38) return '#f97316';
      return '#eab308';
    } else {
      // LULC
      const lulc = ward.lulc_class.toLowerCase();
      if (lulc.includes('industrial') || lulc.includes('stone')) return '#be123c';
      if (lulc.includes('commercial') || lulc.includes('dense')) return '#e11d48';
      if (lulc.includes('residential')) return '#f97316';
      if (lulc.includes('scrub') || lulc.includes('arid') || lulc.includes('rocky')) return '#ca8a04';
      if (lulc.includes('greenery') || lulc.includes('park') || lulc.includes('heritage')) return '#16a34a';
      return '#475569';
    }
  };

  // Basemap URLs - 100% Free & Open (OpenStreetMap light road basemap + Satellite, Dark, Terrain)
  const basemapUrls: Record<string, string> = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}'
  };

  // Helper: Fit bounds across ALL loaded ward geometries
  const fitCityBounds = () => {
    if (!mapInstanceRef.current) return;
    if (wards && wards.length > 0) {
      const bounds = L.latLngBounds([]);
      wards.forEach(w => {
        if (w.coordinates && w.coordinates.length > 0) {
          w.coordinates.forEach(([lat, lon]) => {
            bounds.extend([lat, lon]);
          });
        } else if (w.centroid) {
          bounds.extend(w.centroid);
        }
      });
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [24, 24],
          maxZoom: 13,
          animate: true
        });
        return;
      }
    }
    if (selectedCity) {
      mapInstanceRef.current.setView(selectedCity.center, selectedCity.default_zoom);
    }
  };

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: cityCenter,
      zoom: cityZoom,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true
    });

    const tileLayer = L.tileLayer(basemapUrls[basemapType], {
      attribution:
        basemapType === 'satellite'
          ? '&copy; Esri, Maxar, Earthstar Geographics'
          : '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abc',
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }).addTo(map);

    baseTileLayerRef.current = tileLayer;

    const polyGroup = L.layerGroup().addTo(map);
    const uhcGroup = L.layerGroup().addTo(map);

    polygonLayerGroupRef.current = polyGroup;
    uhcLayerGroupRef.current = uhcGroup;
    mapInstanceRef.current = map;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    // Automatic City-Wide Extent Calculation upon map load
    if (wards && wards.length > 0) {
      const bounds = L.latLngBounds([]);
      wards.forEach(w => {
        if (w.coordinates && w.coordinates.length > 0) {
          w.coordinates.forEach(([lat, lon]) => {
            bounds.extend([lat, lon]);
          });
        } else if (w.centroid) {
          bounds.extend(w.centroid);
        }
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
      }
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    baseTileLayerRef.current.setUrl(basemapUrls[basemapType]);
  }, [basemapType]);

  // Fit bounds when selectedCity or wards changes
  useEffect(() => {
    fitCityBounds();
  }, [selectedCity?.id, wards.length]);

  // Center/Pan map to selected ward when selectedWard changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedWard) return;
    if (selectedWard.coordinates && selectedWard.coordinates.length > 0) {
      const bounds = L.latLngBounds(selectedWard.coordinates);
      if (bounds.isValid()) {
        mapInstanceRef.current.panTo(bounds.getCenter(), { animate: true });
      }
    } else if (selectedWard.centroid) {
      mapInstanceRef.current.panTo(selectedWard.centroid, { animate: true });
    }
  }, [selectedWard?.ward_id]);

  // Render All Ward Polygons (City-Wide Choropleth)
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerGroupRef.current) return;

    const polyGroup = polygonLayerGroupRef.current;
    polyGroup.clearLayers();

    wards.forEach(ward => {
      const isSelected = selectedWard && ward.ward_id === selectedWard.ward_id;
      
      let fillColor = 'transparent';
      let fillOpacity = 0;
      let strokeColor = isSelected ? '#1d4ed8' : '#ffffff';
      let strokeOpacity = isSelected ? 1 : 0.8;
      let strokeWidth = isSelected ? 3 : 1;

      if (activeLayerMode === 'HVI') {
        const hvi = ward.normalized_hvi ?? 5.0;
        const isVeryHigh = hvi >= 7.5 || (ward.risk_category === 'HIGH' && hvi >= 7.0);
        const isHigh = !isVeryHigh && (hvi >= 6.0 || ward.risk_category === 'HIGH');
        const isMod = !isVeryHigh && !isHigh && ((hvi >= 4.0 && hvi < 6.0) || ward.risk_category === 'MODERATE');
        const isLow = !isVeryHigh && !isHigh && !isMod && ((hvi >= 2.5 && hvi < 4.0) || ward.risk_category === 'LOW');
        const isVeryLow = !isVeryHigh && !isHigh && !isMod && !isLow;

        // Visual color palette matching reference image:
        // Very Low -> clean green, Low -> light green, Moderate -> yellow, High -> orange, Very High -> red/pink-red
        let baseColor = '#22c55e'; // Very Low - clean green

        if (isVeryHigh) {
          baseColor = '#ef4444'; // Very High - red / pink-red
        } else if (isHigh) {
          baseColor = '#f97316'; // High - orange
        } else if (isMod) {
          baseColor = '#facc15'; // Moderate - yellow
        } else if (isLow) {
          baseColor = '#84cc16'; // Low - light green
        } else {
          baseColor = '#22c55e'; // Very Low - clean green
        }

        strokeColor = isSelected ? '#1d4ed8' : '#ffffff';
        strokeOpacity = isSelected ? 1 : 0.8;
        strokeWidth = isSelected ? 3 : 1;

        if (!currentRiskFilter || currentRiskFilter === 'ALL') {
          // Fill all ward polygons with heat-risk colors
          fillColor = baseColor;
          fillOpacity = isSelected ? 0.85 : 0.65;
          strokeColor = isSelected ? '#1d4ed8' : '#ffffff';
          strokeOpacity = isSelected ? 1 : 0.8;
          strokeWidth = isSelected ? 3 : 1;
        } else {
          // Specific filter active: highlight matching wards, dim others
          const isMatch =
            (currentRiskFilter === 'VERY_HIGH' && isVeryHigh) ||
            (currentRiskFilter === 'HIGH' && isHigh) ||
            (currentRiskFilter === 'MODERATE' && isMod) ||
            (currentRiskFilter === 'LOW' && isLow) ||
            (currentRiskFilter === 'VERY_LOW' && isVeryLow);

          if (isMatch) {
            fillColor = baseColor;
            fillOpacity = isSelected ? 0.90 : 0.80;
            strokeColor = isSelected ? '#1d4ed8' : '#ffffff';
            strokeOpacity = 1;
            strokeWidth = isSelected ? 3.5 : 1.5;
          } else {
            fillColor = baseColor;
            fillOpacity = 0.12;
            strokeColor = '#ffffff';
            strokeOpacity = 0.3;
            strokeWidth = 0.8;
          }
        }
      } else {
        fillColor = getFeatureColor(ward);
        fillOpacity = isSelected ? 0.85 : 0.60;
        strokeColor = isSelected ? '#1d4ed8' : '#ffffff';
        strokeOpacity = isSelected ? 1 : 0.8;
        strokeWidth = isSelected ? 3 : 1;
      }

      // Original sharp polygon geometry and rendering
      const polygon = L.polygon(ward.coordinates, {
        color: strokeColor,
        opacity: strokeOpacity,
        weight: strokeWidth,
        fillColor: fillColor,
        fillOpacity: fillOpacity
      });

      // Interactive hover feedback
      polygon.on('mouseover', () => {
        if (!isSelected) {
          polygon.setStyle({
            fillOpacity: 0.85,
            weight: 2,
            color: '#1d4ed8',
            opacity: 1
          });
        }
      });

      polygon.on('mouseout', () => {
        if (!isSelected) {
          polygon.setStyle({
            fillOpacity: fillOpacity,
            weight: strokeWidth,
            color: strokeColor,
            opacity: strokeOpacity
          });
        }
      });

      const riskLabel =
        ward.risk_category === 'HIGH'
          ? 'High Risk'
          : ward.risk_category === 'MODERATE'
          ? 'Moderate Risk'
          : 'Low Risk';

      // Interactive Rich Tooltip
      polygon.bindTooltip(
        `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 6px; font-size: 11px; line-height: 1.4; color: #0f172a;">
          <div style="font-weight: 700; color: #0f172a; font-size: 12px; margin-bottom: 2px;">
            ${ward.ward_name} <span style="font-weight: normal; color: #64748b;">(${ward.ward_id})</span>
          </div>
          <div style="color: #334155;">Zone: <strong>${ward.zone_name}</strong></div>
          <div style="color: #334155;">
            HVI: <strong style="color: ${
              ward.normalized_hvi && ward.normalized_hvi >= 7
                ? '#dc2626'
                : ward.normalized_hvi && ward.normalized_hvi >= 4
                ? '#d97706'
                : '#16a34a'
            };">${ward.normalized_hvi}/10</strong> (${riskLabel})
          </div>
          <div style="color: #475569;">LST: <strong>${ward.lst_celsius}°C</strong> | NDVI: <strong>${ward.ndvi}</strong></div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">
            Landmark: ${ward.landmarks[0] || `${selectedCity?.name || 'City'} Ward`}
          </div>
        </div>
        `,
        { sticky: true, opacity: 0.98 }
      );

      polygon.on('click', () => {
        onSelectWard(ward);
      });

      polygon.addTo(polyGroup);
    });
  }, [wards, selectedWard?.ward_id, activeLayerMode, basemapType, selectedCity, currentRiskFilter]);

  // Update Healthcare / UHC Center Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !uhcLayerGroupRef.current) return;

    const uhcGroup = uhcLayerGroupRef.current;
    uhcGroup.clearLayers();

    if (showUHCMarkers) {
      wards.forEach(ward => {
        const uhcIcon = L.divIcon({
          className: 'custom-uhc-marker',
          html: `<div style="width: 18px; height: 18px; border-radius: 9999px; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">H</div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        const uhcLat = ward.centroid[0] + 0.0025;
        const uhcLon = ward.centroid[1] + 0.0025;

        const marker = L.marker([uhcLat, uhcLon], { icon: uhcIcon });
        marker.bindPopup(
          `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; font-size: 11px;">
            <strong style="color: #1d4ed8; font-size: 12px; display: block;">${ward.uhc_name}</strong>
            <div style="color: #475569; margin-top: 2px;">Serving: ${ward.ward_name} (${ward.zone_name})</div>
            <div style="color: #475569;">Distance to Ward Center: <strong>${ward.uhc_distance_km} km</strong></div>
            <div style="color: #15803d; font-weight: 600; margin-top: 4px;">✓ Heat Stress & Emergency ORS Centre</div>
          </div>
          `
        );
        marker.addTo(uhcGroup);
      });
    }
  }, [wards, showUHCMarkers]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-50 select-none`}
    >
      {/* Interactive Map Surface */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Humanized AI Telemetry Initialization */}
      {wards.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xs text-center">
          <div className="max-w-md bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Synchronizing Spatial Data
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluating surface heat radiation and vegetation canopy indices for <strong>{selectedCity?.name}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Top-Left: Risk Levels Floating Horizontal Pill Bar (Exact Reference Image Style) */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-2.5 sm:gap-3.5 text-xs font-semibold text-slate-700">
        <button
          id="btn-filter-very-low"
          onClick={() => setRiskFilter(currentRiskFilter === 'VERY_LOW' ? null : 'VERY_LOW')}
          className={`flex items-center gap-1.5 transition cursor-pointer px-1 py-0.5 rounded ${
            currentRiskFilter === 'VERY_LOW' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:text-slate-900'
          }`}
          title="Filter Very Low Risk Areas"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
          <span>Very Low</span>
        </button>

        <button
          id="btn-filter-low"
          onClick={() => setRiskFilter(currentRiskFilter === 'LOW' ? null : 'LOW')}
          className={`flex items-center gap-1.5 transition cursor-pointer px-1 py-0.5 rounded ${
            currentRiskFilter === 'LOW' ? 'bg-lime-50 text-lime-800 font-bold' : 'hover:text-slate-900'
          }`}
          title="Filter Low Risk Areas"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] shrink-0" />
          <span>Low</span>
        </button>

        <button
          id="btn-filter-mod"
          onClick={() => setRiskFilter(currentRiskFilter === 'MODERATE' ? null : 'MODERATE')}
          className={`flex items-center gap-1.5 transition cursor-pointer px-1 py-0.5 rounded ${
            currentRiskFilter === 'MODERATE' ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:text-slate-900'
          }`}
          title="Filter Moderate Risk Areas"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shrink-0" />
          <span>Moderate</span>
        </button>

        <button
          id="btn-filter-high"
          onClick={() => setRiskFilter(currentRiskFilter === 'HIGH' ? null : 'HIGH')}
          className={`flex items-center gap-1.5 transition cursor-pointer px-1 py-0.5 rounded ${
            currentRiskFilter === 'HIGH' ? 'bg-orange-50 text-orange-900 font-bold' : 'hover:text-slate-900'
          }`}
          title="Filter High Risk Areas"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shrink-0" />
          <span>High</span>
        </button>

        <button
          id="btn-filter-very-high"
          onClick={() => setRiskFilter(currentRiskFilter === 'VERY_HIGH' ? null : 'VERY_HIGH')}
          className={`flex items-center gap-1.5 transition cursor-pointer px-1 py-0.5 rounded ${
            currentRiskFilter === 'VERY_HIGH' ? 'bg-rose-50 text-rose-900 font-bold' : 'hover:text-slate-900'
          }`}
          title="Filter Very High Risk Areas"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
          <span>Very High</span>
        </button>

        {currentRiskFilter !== null && (
          <button
            onClick={() => setRiskFilter(null)}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold pl-1 underline cursor-pointer border-l border-slate-200 ml-0.5"
            title="Remove risk filter to show normal base map"
          >
            Clear
          </button>
        )}
      </div>

      {/* Top-Right: Map / Satellite Basemap Toggle Pill (Exact Reference Image Style) */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-1 text-xs">
        <button
          id="btn-basemap-map"
          onClick={() => setBasemapType('streets')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
            basemapType === 'streets'
              ? 'bg-[#2563EB] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
        <button
          id="btn-basemap-satellite"
          onClick={() => setBasemapType('satellite')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
            basemapType === 'satellite'
              ? 'bg-[#2563EB] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>
      </div>

      {/* Bottom-Right: Target Locate and Vertical Zoom Controls (Exact Reference Image Style) */}
      <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-2">
        <button
          id="btn-map-locate"
          onClick={fitCityBounds}
          title="Center on City"
          className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <Crosshair className="w-4 h-4 text-slate-700" />
        </button>

        <div className="rounded-xl bg-white shadow-sm border border-slate-200 divide-y divide-slate-100 flex flex-col overflow-hidden text-slate-700">
          <button
            id="btn-map-zoom-in"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-700 font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            id="btn-map-zoom-out"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-700 font-bold transition cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom-Left: Graphic Scale Bar (Exact Reference Image Style) */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start select-none pointer-events-none bg-white/80 backdrop-blur-xs p-1 rounded-md border border-slate-200/60 shadow-2xs">
        <div className="flex justify-between w-20 text-[9px] font-mono text-slate-800 font-semibold px-0.5">
          <span>0</span>
          <span>5</span>
          <span>10 km</span>
        </div>
        <div className="w-20 h-1.5 border-b-2 border-l-2 border-r-2 border-slate-800 flex justify-between">
          <div className="w-[1px] h-full bg-transparent" />
          <div className="w-[1px] h-full bg-slate-800" />
          <div className="w-[1px] h-full bg-transparent" />
        </div>
      </div>
    </div>
  );
};

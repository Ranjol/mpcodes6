import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, RotateCcw, Filter, Building, ChevronDown, Globe2, Sparkles, Loader2, Calendar, AlertTriangle, Layers } from 'lucide-react';
import { WardData, CityConfig, CityId, LocationSearchResult, LocationNode } from '../types';
import { CITIES_REGISTRY } from '../data/citiesData';
import { searchLocation, resolveLocation } from '../services/locationService';

interface SearchBarProps {
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  selectedCity: CityConfig;
  onCityChange: (cityId: CityId, customNode?: LocationNode) => void;
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  selectedRisk: string;
  onRiskChange: (risk: string) => void;
  onReset: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  selectedCity,
  onCityChange,
  selectedZone,
  onZoneChange,
  selectedRisk,
  onRiskChange,
  onReset
}) => {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live asynchronous global location search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocation(query);
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = async (item: LocationSearchResult) => {
    setIsOpen(false);
    setQuery('');

    // If item is a specific local ward in current or known dataset
    if (item.is_ward && item.ward_id) {
      const match = wards.find(w => w.ward_id === item.ward_id);
      if (match) {
        onSelectWard(match);
        return;
      }
    }

    // Resolve full hierarchy and coordinates
    const resolved = await resolveLocation(item.name || item.display_name);
    if (resolved) {
      const cityNode = resolved.hierarchy.city || {
        id: item.city_name?.toLowerCase() || item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: item.city_name || item.name,
        country_code: item.country_code,
        admin_level: 'city',
        place_type: item.type,
        latitude: item.latitude,
        longitude: item.longitude,
        dataset_status: 'COMPLETE'
      };

      onCityChange(cityNode.id, cityNode);

      if (resolved.hierarchy.area && item.ward_id) {
        const match = wards.find(w => w.ward_id === item.ward_id);
        if (match) onSelectWard(match);
      }
    } else {
      // Direct city node
      onCityChange(item.city_name?.toLowerCase() || item.name.toLowerCase(), {
        id: item.city_name?.toLowerCase() || item.name.toLowerCase(),
        name: item.name,
        country_code: item.country_code,
        admin_level: item.type === 'ward' ? 'ward' : 'city',
        place_type: item.type,
        latitude: item.latitude,
        longitude: item.longitude,
        dataset_status: 'COMPLETE'
      });
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectResult(suggestions[0]);
      } else {
        const resolved = await resolveLocation(query.trim());
        if (resolved) {
          const cityNode = resolved.hierarchy.city || {
            id: resolved.city_municipality.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: resolved.city_municipality,
            country_code: resolved.country_code,
            admin_level: 'city',
            place_type: 'city',
            latitude: resolved.latitude,
            longitude: resolved.longitude,
            dataset_status: 'COMPLETE'
          };
          onCityChange(cityNode.id, cityNode);
          setQuery('');
          setIsOpen(false);
        }
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onReset();
  };

  return (
    <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-2xs w-full max-w-full min-w-0">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 min-w-0">
        {/* Global Search Input with Autocomplete */}
        <div ref={dropdownRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="input-ward-search"
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search by country, city, ward, landmark, PIN code (e.g. Tokyo, London, Kapra, 500062)..."
              className="w-full pl-9 pr-14 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition"
            />
            {isLoading && (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin absolute right-8 pointer-events-none" />
            )}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Global Geographic Matches</span>
                <span className="text-slate-400 font-normal">Press Enter to select</span>
              </div>
              {suggestions.map(item => {
                const isCurrentWard = selectedWard && item.ward_id === selectedWard.ward_id;
                const isCurrentCity = selectedCity && item.name.toLowerCase() === selectedCity.name.toLowerCase();

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className={`px-3 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition ${
                      isCurrentWard || isCurrentCity ? 'bg-blue-50/60 border-l-2 border-blue-600' : ''
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-xs text-slate-900 truncate">{item.name}</span>
                        {item.postal_code && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono">
                            {item.postal_code}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate pl-5.5">
                        {item.display_name}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {item.category || item.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Filters and City Selector */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* City Selector */}
          <div className="relative">
            <select
              id="select-city"
              value={selectedCity.id}
              onChange={e => onCityChange(e.target.value as CityId)}
              className="pl-2.5 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 appearance-none cursor-pointer transition max-w-[160px] sm:max-w-[200px] truncate"
            >
              <option value={selectedCity.id}>
                {selectedCity.name}, {selectedCity.state}
              </option>
              {CITIES_REGISTRY.filter(c => c.id !== selectedCity.id).map(city => (
                <option key={city.id} value={city.id}>
                  {city.full_label} {city.dataset_status === 'COMPLETE' ? `(${city.total_wards ?? 150} Wards)` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Zone Filter (Dynamic per selected city) */}
          <div className="relative">
            <select
              id="select-zone-filter"
              value={selectedZone}
              onChange={e => onZoneChange(e.target.value)}
              className="pl-2.5 pr-7 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl text-xs font-medium text-slate-800 appearance-none cursor-pointer"
            >
              <option value="ALL">All Zones ({selectedCity.name})</option>
              {selectedCity.zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          <button
            id="btn-reset-filters"
            onClick={handleClear}
            title="Reset Search and Filters"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition shrink-0 font-semibold text-xs cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: WardData[];
  selectedWard?: WardData;
  onSelectWard: (ward: WardData) => void;
  selectedCity: CityConfig;
  onCityChange: (cityId: CityId, customNode?: LocationNode) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  wards,
  selectedWard,
  onSelectWard,
  selectedCity,
  onCityChange
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocation(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = async (item: LocationSearchResult) => {
    if (item.is_ward && item.ward_id) {
      const match = wards.find(w => w.ward_id === item.ward_id);
      if (match) {
        onSelectWard(match);
        onClose();
        return;
      }
    }

    const resolved = await resolveLocation(item.name || item.display_name);
    if (resolved) {
      const cityNode = resolved.hierarchy.city || {
        id: item.city_name?.toLowerCase() || item.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: item.city_name || item.name,
        country_code: item.country_code,
        admin_level: 'city',
        place_type: item.type,
        latitude: item.latitude,
        longitude: item.longitude,
        dataset_status: 'COMPLETE'
      };
      onCityChange(cityNode.id, cityNode);
      if (resolved.hierarchy.area && item.ward_id) {
        const match = wards.find(w => w.ward_id === item.ward_id);
        if (match) onSelectWard(match);
      }
    } else {
      onCityChange(item.city_name?.toLowerCase() || item.name.toLowerCase(), {
        id: item.city_name?.toLowerCase() || item.name.toLowerCase(),
        name: item.name,
        country_code: item.country_code,
        admin_level: item.type === 'ward' ? 'ward' : 'city',
        place_type: item.type,
        latitude: item.latitude,
        longitude: item.longitude,
        dataset_status: 'COMPLETE'
      });
    }
    onClose();
  };

  const localWardsPreview = wards.slice(0, 8);

  return (
    <div className="fixed inset-0 z-[2500] bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Top Input Bar */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by country, city, ward, landmark, PIN code (e.g. Kapra, London)..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[11px] font-bold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {query.trim() && suggestions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Geographic Matches ({suggestions.length})
              </div>
              {suggestions.map(item => {
                const isSelected =
                  (selectedWard && item.ward_id === selectedWard.ward_id) ||
                  (selectedCity && item.name.toLowerCase() === selectedCity.name.toLowerCase());
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50/70 transition flex items-center justify-between group cursor-pointer ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold text-xs text-slate-900 truncate">{item.name}</span>
                        {item.postal_code && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {item.postal_code}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 pl-6">
                        {item.display_name}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-700 uppercase shrink-0">
                      {item.category || item.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {query.trim() && !isLoading && suggestions.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching wards or locations found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {!query.trim() && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Quick Wards &bull; {selectedCity.name}</span>
                <span className="text-slate-400 font-normal">Click to navigate</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {localWardsPreview.map(ward => (
                  <button
                    key={ward.ward_id}
                    onClick={() => {
                      onSelectWard(ward);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-xs text-slate-800 truncate group-hover:text-blue-600">
                        {ward.ward_name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {ward.ward_id} &bull; {ward.zone_name}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ward.risk_category === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : ward.risk_category === 'MODERATE'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {ward.risk_category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Global municipal datasets enabled</span>
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};


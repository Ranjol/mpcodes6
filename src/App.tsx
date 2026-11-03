import React, { useState, useMemo, useEffect } from 'react';
import { WardData, Language, StakeholderView, NavTab, CityId, LocationNode, CityConfig } from './types';
import { getCityConfig, getCityRawWards } from './data/citiesData';
import { computeCitywideHVI } from './services/pcaEngine';
import { evaluateWardAlerts } from './services/alertEngine';
import { buildDynamicCityConfig, fetchLiveWeather, reverseGeocodeLocation } from './services/locationService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SearchModal } from './components/SearchBar';
import { DashboardView } from './components/DashboardView';
import { InteractiveMapPage } from './components/InteractiveMapPage';
import { WardProfileView } from './components/WardProfileView';
import { ScenarioView } from './components/ScenarioView';
import { SocialVulnerabilityView } from './components/SocialVulnerabilityView';
import { ComparisonsPage } from './components/ComparisonsPage';
import { TrendsView } from './components/TrendsView';
import { RecommendationsView } from './components/RecommendationsView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { CHWView } from './components/CHWView';
import { PdfReportModal } from './components/PdfReportModal';

export const App: React.FC = () => {
  // Selected City state (Generic city architecture with Hyderabad as default)
  const [selectedCityId, setSelectedCityId] = useState<CityId>('hyderabad');
  const [customCityConfig, setCustomCityConfig] = useState<CityConfig | null>(null);

  const selectedCity = useMemo<CityConfig>(() => {
    if (customCityConfig && customCityConfig.id === selectedCityId) {
      return customCityConfig;
    }
    return getCityConfig(selectedCityId) || getCityConfig('hyderabad')!;
  }, [selectedCityId, customCityConfig]);

  // Run PCA Engine dynamically on city wards dataset to compute exact research formula scores
  const enrichedWards = useMemo(() => {
    const rawWards = getCityRawWards(selectedCityId, selectedCity);
    const { enrichedWards } = computeCitywideHVI(rawWards);
    return enrichedWards;
  }, [selectedCityId, selectedCity]);

  const wards = enrichedWards;
  const [selectedWard, setSelectedWard] = useState<WardData | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [stakeholderView, setStakeholderView] = useState<StakeholderView>('PLANNER');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'te' || saved === 'hi' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Global keyboard shortcut (⌘K or Ctrl+K) to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filters state
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  // Sync selected ward when enrichedWards or city changes
  useEffect(() => {
    if (enrichedWards.length > 0) {
      setSelectedWard(prev => {
        if (prev) {
          const match = enrichedWards.find(w => w.ward_id === prev.ward_id);
          if (match) return match;
        }
        return null;
      });
    } else {
      setSelectedWard(null);
    }
  }, [enrichedWards]);

  // Total active alerts across wards
  const totalAlertsCount = useMemo(() => {
    let count = 0;
    wards.forEach(w => {
      const alerts = evaluateWardAlerts(w);
      if (alerts.some(a => a.level === 'RED' || a.level === 'AMBER')) count++;
    });
    return count;
  }, [wards]);

  // Filtered wards according to selected zone and risk level
  const displayedWards = useMemo(() => {
    return wards.filter(w => {
      const matchZone = selectedZone === 'ALL' || w.zone_name === selectedZone;
      let matchRisk = true;
      if (selectedRisk === 'HIGH') matchRisk = (w.normalized_hvi ?? 5.0) >= 7.0;
      else if (selectedRisk === 'MODERATE') {
        const hvi = w.normalized_hvi ?? 5.0;
        matchRisk = hvi >= 4.0 && hvi < 7.0;
      } else if (selectedRisk === 'LOW') {
        matchRisk = (w.normalized_hvi ?? 5.0) < 4.0;
      }
      return matchZone && matchRisk;
    });
  }, [wards, selectedZone, selectedRisk]);

  const handleSelectWard = (w: WardData) => {
    setSelectedWard(w);
  };

  const handleOpenScenarioWithWard = (w: WardData) => {
    setSelectedWard(w);
    setCurrentTab('scenarios');
  };

  const handleResetFilters = () => {
    setSelectedZone('ALL');
    setSelectedRisk('ALL');
    setCustomCityConfig(null);
    setSelectedCityId('hyderabad');
    setSelectedWard(null);
  };

  const handleCityChange = async (newCityId: CityId, customNode?: LocationNode) => {
    if (customNode) {
      const config = await buildDynamicCityConfig(customNode);
      setCustomCityConfig(config);
      setSelectedCityId(newCityId);

      // Asynchronously fetch live meteorological values
      const weather = await fetchLiveWeather(customNode.latitude, customNode.longitude, customNode.name);
      setCustomCityConfig(prev => (prev && prev.id === config.id ? { ...prev, weather } : prev));
    } else {
      setCustomCityConfig(null);
      setSelectedCityId(newCityId);
    }
  };

  const handleSelectWardFromLocation = (wardId: string) => {
    const found = wards.find(w => w.ward_id === wardId || w.ward_name.toLowerCase() === wardId.toLowerCase());
    if (found) {
      setSelectedWard(found);
    }
  };

  const handleMapClickLocation = async (lat: number, lon: number) => {
    try {
      const resolved = await reverseGeocodeLocation(lat, lon);
      if (resolved) {
        const node: LocationNode = {
          id: resolved.city.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'custom_location',
          name: resolved.city !== 'City / Municipality Not Available' ? resolved.city : resolved.state,
          country_code: resolved.countryCode,
          latitude: lat,
          longitude: lon,
          admin_level: 'city',
          admin_level_label: 'City / Municipality',
          place_type: 'city',
          parent_id: resolved.state,
          municipal_body: `${resolved.city} Municipal Administration`,
          description: resolved.formattedAddress
        };
        await handleCityChange(node.id, node);
      }
    } catch (e) {
      console.warn('Map click reverse geocode error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex antialiased overflow-x-hidden w-full max-w-full">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        language={language}
        alertsCount={totalAlertsCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* 2. Main Light Content Area (offset by 18rem = 72 on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        {/* Global Clean Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          userRole={stakeholderView}
          onRoleChange={setStakeholderView}
          onOpenReportModal={() => setIsPdfModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          selectedWardTemp={selectedWard?.current_temp_celsius}
          selectedWardHumidity={selectedWard?.current_humidity_pct}
          selectedCity={selectedCity}
          selectedWard={selectedWard || undefined}
          wards={wards}
          onSelectWard={handleSelectWard}
          onCityChange={handleCityChange}
          onSelectWardFromLocation={handleSelectWardFromLocation}
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
          onResetFilters={handleResetFilters}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0">
          {stakeholderView === 'CHW' ? (
            /* Community Health Worker (CHW) Specialized Field View */
            <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
              <CHWView ward={selectedWard || undefined} language={language} />
            </div>
          ) : (
            /* Planner / Intelligent System Views */
            <>
              {currentTab === 'overview' && (
                <DashboardView
                  wards={displayedWards.length > 0 ? displayedWards : wards}
                  selectedWard={selectedWard || undefined}
                  onSelectWard={handleSelectWard}
                  language={language}
                  onNavigateToTab={setCurrentTab}
                  selectedCity={selectedCity}
                  onMapClick={handleMapClickLocation}
                />
              )}

              {currentTab === 'map' && (
                <InteractiveMapPage
                  wards={displayedWards.length > 0 ? displayedWards : wards}
                  selectedWard={selectedWard || undefined}
                  onSelectWard={handleSelectWard}
                  language={language}
                  onNavigateToTab={setCurrentTab}
                  selectedCity={selectedCity}
                  onMapClick={handleMapClickLocation}
                />
              )}

              {currentTab === 'profile' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <WardProfileView
                    ward={selectedWard || undefined}
                    wards={wards}
                    onSelectWard={handleSelectWard}
                    language={language}
                    onOpenPdfReport={() => setIsPdfModalOpen(true)}
                    onOpenScenarioWithWard={handleOpenScenarioWithWard}
                  />
                </div>
              )}

              {currentTab === 'scenarios' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <ScenarioView
                    wards={wards}
                    selectedWard={selectedWard || undefined}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {(currentTab === 'social_vuln' || currentTab === 'social') && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <SocialVulnerabilityView
                    wards={wards}
                    selectedWard={selectedWard || undefined}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'comparison' && (
                <ComparisonsPage
                  wards={displayedWards.length > 0 ? displayedWards : wards}
                  selectedWard={selectedWard || undefined}
                  onSelectWard={handleSelectWard}
                  language={language}
                  selectedCity={selectedCity}
                />
              )}

              {currentTab === 'trends' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <TrendsView
                    wards={wards}
                    selectedWard={selectedWard || undefined}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'recommendations' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <RecommendationsView
                    wards={wards}
                    selectedWard={selectedWard || undefined}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'alerts' && (
                <div className="p-4 sm:p-6 max-w-[1700px] mx-auto">
                  <AlertsView
                    wards={wards}
                    selectedWard={selectedWard || undefined}
                    onSelectWard={handleSelectWard}
                    language={language}
                  />
                </div>
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  wards={wards}
                  selectedWard={selectedWard || undefined}
                  onSelectWard={handleSelectWard}
                  language={language}
                  onOpenPdfReport={() => setIsPdfModalOpen(true)}
                  selectedCity={selectedCity}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* PDF Export Modal */}
      <PdfReportModal
        ward={selectedWard || undefined}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        language={language}
        selectedCity={selectedCity}
      />

      {/* Global Location & Ward Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        wards={wards}
        selectedWard={selectedWard || undefined}
        onSelectWard={handleSelectWard}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
      />
    </div>
  );
};

export default App;

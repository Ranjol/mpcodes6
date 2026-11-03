import React from 'react';
import {
  LayoutDashboard,
  Map,
  Building2,
  Sliders,
  Users,
  GitCompare,
  TrendingUp,
  ShieldAlert,
  BellRing,
  FileText,
  BookOpen,
  X,
  Sparkles,
  Search
} from 'lucide-react';
import { NavTab, Language } from '../types';
import { getTranslation } from '../services/i18n';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
  alertsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  language,
  alertsCount,
  isOpenMobile,
  onCloseMobile,
  onOpenSearch
}) => {
  const t = getTranslation(language);

  const navItems = [
    { id: 'overview' as NavTab, label: t.navOverview, icon: LayoutDashboard },
    { id: 'map' as NavTab, label: t.navHeatMap, icon: Map },
    { id: 'profile' as NavTab, label: t.navWardProfile, icon: Building2 },
    { id: 'scenarios' as NavTab, label: t.navScenarios, icon: Sliders },
    { id: 'social_vuln' as NavTab, label: t.navSocialVuln, icon: Users },
    { id: 'comparison' as NavTab, label: t.navComparison, icon: GitCompare },
    { id: 'trends' as NavTab, label: t.navTrends, icon: TrendingUp },
    { id: 'recommendations' as NavTab, label: t.navRecommendations, icon: ShieldAlert },
    {
      id: 'alerts' as NavTab,
      label: t.navAlerts,
      icon: BellRing,
      badge: alertsCount > 0 ? alertsCount : undefined
    },
    { id: 'reports' as NavTab, label: t.reportsTitle, icon: FileText }
  ];

  const handleSelect = (tab: NavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-700 w-72 select-none border-r border-slate-200">
      {/* 1. Brand Header inside Sidebar */}
      <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Circular GeoRisk Environmental Logo */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden relative">
              <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Globe / Earth circular base */}
                <circle cx="18" cy="18" r="16" fill="#0284c7" />
                {/* Wave / Landmass organic contours */}
                <path d="M4 22C8 18 13 24 18 20C23 16 28 21 32 18V34H4V22Z" fill="#10b981" />
                <path d="M4 26C9 23 14 27 19 24C24 21 28 25 32 23V34H4V26Z" fill="#059669" />
                <circle cx="18" cy="13" r="5" fill="#38bdf8" opacity="0.6" />
                {/* Subtle latitude arc */}
                <path d="M6 14C12 17 24 17 30 14" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                <path d="M8 9C13 11 23 11 28 9" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-lg font-black text-slate-900 tracking-tight leading-none flex items-center">
              <span>Geo</span>
              <span className="text-blue-600">Risk</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 tracking-tight mt-1 leading-tight">
              Safer Communities • Smarter Decisions
            </div>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 text-slate-400 hover:text-slate-700 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Search Button in Left-Side Layout */}
      <div className="px-3 pt-3 pb-2.5 border-b border-slate-100">
        <button
          id="btn-sidebar-search"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 bg-blue-50/70 hover:bg-blue-100/90 text-slate-700 hover:text-slate-900 border border-blue-200/90 hover:border-blue-400 rounded-xl transition-all duration-150 text-xs font-semibold cursor-pointer shadow-2xs group"
          title="Search by country, city, ward, landmark, PIN code (⌘K)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate text-slate-700">Search wards &amp; places...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-blue-200 rounded text-blue-600/80 font-bold shrink-0 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* 4. Navigation Modules Vertically Underneath */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2.5">
          Navigation Modules
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : 'bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Tagline & System Status */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
        <div className="text-[11px] text-slate-600 font-medium leading-relaxed mb-2">
          Data-driven heat risk assessment &amp; municipal GIS analytics
        </div>
        <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200/80 pt-2">
          <span>v2.4 Geospatial DSS</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-72 shadow-sm border-r border-slate-200">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

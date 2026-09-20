import React from 'react';
import { Activity, PhoneCall, ShieldAlert, Clock, RefreshCw, Bookmark } from 'lucide-react';

interface NavbarProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeHoldCount: number;
  onOpenHolds: () => void;
  lang: 'en' | 'hi';
  onToggleLang: () => void;
  lastSyncTime?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSimulating,
  onToggleSimulation,
  onRefresh,
  isRefreshing,
  activeHoldCount,
  onOpenHolds,
  lang,
  onToggleLang,
  lastSyncTime,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
                  {lang === 'en' ? 'Hospital Bed Availability' : 'अस्पताल बेड उपलब्धता'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
                  {lang === 'en' ? 'Live Monitoring Agent' : 'लाइव निगरानी एजेंट'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>
                  {lang === 'en' ? 'Real-time verified status' : 'रीयल-टाइम सत्यापित स्थिति'}
                  {lastSyncTime ? ` • ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simulation toggle */}
            <button
              id="btn-toggle-live-feed"
              onClick={onToggleSimulation}
              title={isSimulating ? 'Pause real-time updates' : 'Resume real-time updates'}
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isSimulating
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isSimulating ? (lang === 'en' ? 'Live Sync: ON' : 'लाइव सिंक: चालू') : (lang === 'en' ? 'Live Sync: PAUSED' : 'लाइव सिंक: रुका')}
            </button>

            {/* Manual Refresh */}
            <button
              id="btn-manual-refresh"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh bed counts"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Language toggle */}
            <button
              id="btn-toggle-lang"
              onClick={onToggleLang}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {/* Active Bed Holds */}
            <button
              id="btn-view-holds"
              onClick={onOpenHolds}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{lang === 'en' ? 'My Holds' : 'मेरे होल्ड'}</span>
              {activeHoldCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {activeHoldCount}
                </span>
              )}
            </button>

            {/* Direct Ambulance 108 Hotline */}
            <a
              id="btn-ambulance-call"
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Call 108' : '108 कॉल'}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

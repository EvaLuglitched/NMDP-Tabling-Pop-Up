import React from 'react';
import { 
  QrCode, 
  BarChart3, 
  Globe,
  Sparkles,
  Zap,
  Heart
} from 'lucide-react';

export type AppView = 'home' | 'invitation' | 'portal' | 'analytics';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  pledgeCount: number;
  onSimulateScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  pledgeCount,
  onSimulateScan,
}) => {
  return (
    <header className="w-full bg-[#070b10]/90 border-b border-white/10 sticky top-0 z-50 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer" onClick={() => onSelectView('home')}>
            {/* Blossom geometric icon */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400/20 to-indigo-500/20 border border-white/20 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="24" r="10" opacity="0.9" />
                <circle cx="68" cy="32" r="10" opacity="0.9" />
                <circle cx="76" cy="50" r="10" opacity="0.9" />
                <circle cx="68" cy="68" r="10" opacity="0.9" />
                <circle cx="50" cy="76" r="10" opacity="0.9" />
                <circle cx="32" cy="68" r="10" opacity="0.9" />
                <circle cx="24" cy="50" r="10" opacity="0.9" />
                <circle cx="32" cy="32" r="10" opacity="0.9" />
                <circle cx="50" cy="50" r="12" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-lg sm:text-xl text-white font-medium tracking-tight">
                  NMDP Tabling Pop-Up
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-sky-200 text-[10px] font-mono">
                  Sept 21 • UC Berkeley
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-light">
                MDes Volunteers • Amazon Hub Locker • Blood &amp; Pediatric Cancer Awareness
              </p>
            </div>
          </div>

          {/* Navigation View Switcher Tabs (Direct Full-Screen Web Interface) */}
          <nav className="flex items-center bg-black/60 p-1 rounded-full border border-white/15 text-xs font-semibold overflow-x-auto max-w-full">
            {/* 1. Start Saving Lives (Hero Intro) */}
            <button
              onClick={() => onSelectView('home')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentView === 'home'
                  ? 'bg-white text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Start Saving Lives</span>
            </button>

            {/* 2. Invitation Card & QR */}
            <button
              onClick={() => onSelectView('invitation')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentView === 'invitation'
                  ? 'bg-white text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invitation Card &amp; QR</span>
              <span className="sm:hidden">Invite &amp; QR</span>
            </button>

            {/* 3. Event Portal */}
            <button
              onClick={() => onSelectView('portal')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentView === 'portal'
                  ? 'bg-white text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Event Portal</span>
              <span className="sm:hidden">Portal</span>
            </button>

            {/* 4. Real-Time Report */}
            <button
              onClick={() => onSelectView('analytics')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentView === 'analytics'
                  ? 'bg-white text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Stats</span>
              <span className="sm:hidden">Stats</span>
            </button>
          </nav>

          {/* Quick Action Button for Testing Interaction Track */}
          <div className="hidden xl:flex items-center gap-2">
            <button
              onClick={onSimulateScan}
              className="px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 hover:bg-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test a real-time QR scan event to see the live metrics update"
            >
              <Zap className="w-3.5 h-3.5 text-sky-300" />
              + Simulate Scan
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

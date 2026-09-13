import React, { useState, useEffect } from 'react';
import { Navbar, AppView } from './components/Navbar';
import { StartSavingLivesView } from './components/StartSavingLivesView';
import { InvitationCard } from './components/InvitationCard';
import { EventLandingView } from './components/EventLandingView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CampaignStats, PledgeItem } from './types';
import { trackVisitOnLoad } from './utils/analytics';
import { 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Heart,
  QrCode,
  BellRing
} from 'lucide-react';

import { getInitialStats, cacheStatsLocally } from './utils/defaultStats';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  // Initialize with cached or realistic defaults so Live Stats renders in 0ms!
  const [stats, setStats] = useState<CampaignStats>(() => getInitialStats());
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize analytics on page load
  useEffect(() => {
    trackVisitOnLoad();
    fetchStats();

    // Check if user came via QR code or direct link with target=event_portal
    const params = new URLSearchParams(window.location.search);
    if (params.get('target') === 'event_portal') {
      setCurrentView('portal');
    }
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch('/api/stats', { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.totalVisits === 'number') {
          setStats(data);
          cacheStatsLocally(data);
        }
      }
    } catch (err) {
      // Network offline, slow, or timeout: stats remains gracefully loaded from local cache
      console.debug('Stats fetch completed with local fallback:', err);
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingStats(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Simulates a student scanning the QR code on UC Berkeley campus
  const handleSimulateScan = async () => {
    const spots = ['amazon_hub_flyer', 'campus_poster_sproul', 'moffitt_library_table'];
    const randomSpot = spots[Math.floor(Math.random() * spots.length)];
    const mockSessionId = 'sess-scan-' + Math.random().toString(36).substring(2, 8);

    try {
      // Record visit
      await fetch('/api/track/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: randomSpot,
          medium: 'qr_code',
          campaign: 'nmdp_berkeley_fall26',
          sessionId: mockSessionId,
          referrer: 'phone_camera_lens',
        }),
      });

      // Record QR scanned event
      await fetch('/api/track/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: mockSessionId,
          type: 'qr_scanned',
          metadata: { spot: randomSpot, device: 'mobile_safari' },
        }),
      });

      await fetchStats();
      
      const spotName = 
        randomSpot === 'amazon_hub_flyer' 
          ? 'Amazon Hub Locker flyer' 
          : randomSpot === 'campus_poster_sproul' 
          ? 'Sproul Plaza poster' 
          : 'Moffitt Library table';

      showToast(`📱 Real-Time QR Scan recorded from ${spotName}! Analytics updated.`);
    } catch (err) {
      console.error('Error simulating scan:', err);
    }
  };

  const handlePledgeRecorded = (pledge: PledgeItem) => {
    fetchStats();
    showToast(`🎉 New student pledge logged: ${pledge.name} committed to stop by on Sept 21!`);
  };

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient background aura lights */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-900/15 blur-[160px] pointer-events-none" />

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        pledgeCount={stats?.totalPledges || 0}
        onSimulateScan={handleSimulateScan}
      />

      {/* Floating Toast Notification for Real-Time Activity */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm ethereal-glass text-white px-4 py-3 rounded-2xl shadow-2xl border border-sky-400/40 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5 duration-300">
          <BellRing className="w-4 h-4 text-sky-400 flex-shrink-0 animate-bounce" />
          <span className="flex-1 font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Campaign Canvas */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        {currentView === 'home' && (
          <StartSavingLivesView
            stats={stats}
            onNavigateToInvitation={() => setCurrentView('invitation')}
            onNavigateToPortal={() => setCurrentView('portal')}
            onNavigateToAnalytics={() => setCurrentView('analytics')}
          />
        )}

        {currentView === 'invitation' && (
          <InvitationCard
            onSimulateScan={handleSimulateScan}
            onNavigateToPortal={() => setCurrentView('portal')}
          />
        )}

        {currentView === 'portal' && (
          <EventLandingView
            onPledgeSubmitted={handlePledgeRecorded}
            onNavigateToAnalytics={() => setCurrentView('analytics')}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsDashboard
            stats={stats}
            isLoading={isLoadingStats}
            onRefreshStats={fetchStats}
            onSimulateQrScan={handleSimulateScan}
          />
        )}
      </main>

      {/* Footer with Compliance & Partner Acknowledgments */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 mt-12 text-xs text-slate-400 bg-black/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-sky-300 flex items-center justify-center font-bold text-xs">
              MDes
            </div>
            <div>
              <p className="font-medium text-slate-200">
                UC Berkeley Master of Design (MDes) × NMDP Volunteer Pop-Up
              </p>
              <p className="text-[11px] text-slate-500 font-light">
                September Blood Cancer and Pediatric Cancer Awareness Month Campaign
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Compliant with UC Berkeley Student Code of Conduct
            </span>
            <span className="text-white/20">•</span>
            <span>Monday, Sept 21 • 10am-12pm PT</span>
            <span className="text-white/20">•</span>
            <span>Outside Amazon Hub Locker (2495 Bancroft Way)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

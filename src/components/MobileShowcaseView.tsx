import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Sparkles,
  Calendar,
  MapPin,
  Heart,
  QrCode,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Copy,
  ChevronLeft,
  Search,
  Plus,
  Compass,
  User,
  Share2
} from 'lucide-react';
import { CampaignStats, PledgeItem } from '../types';

interface MobileShowcaseViewProps {
  stats: CampaignStats | null;
  onSimulateScan: () => void;
  onOpenPortal: () => void;
  onOpenAnalytics: () => void;
}

export const MobileShowcaseView: React.FC<MobileShowcaseViewProps> = ({
  stats,
  onSimulateScan,
  onOpenPortal,
  onOpenAnalytics,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [summaryText, setSummaryText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'moments' | 'search' | 'calendar' | 'profile'>('moments');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://berkeley.edu';
    const targetUrl = `${origin}/?utm_source=mobile_showcase&utm_medium=qr_code&target=event_portal`;
    
    QRCode.toDataURL(targetUrl, {
      width: 260,
      margin: 1,
      color: {
        dark: '#081018',
        light: '#FFFFFF',
      },
    }).then(setQrUrl).catch(console.error);

    // Initial summary
    if (stats) {
      setSummaryText(
        `For the upcoming NMDP Tabling Session, I designed a multi-channel invitation campaign featuring an ethereal mobile landing page and dynamic QR codes to drive awareness for Blood Cancer and Pediatric Cancer Awareness Month. The invitation directed UC Berkeley students to the pop-up tabling outside the Amazon Hub Locker (2495 Bancroft Way) on Monday, September 21st from 10am - 12pm PT. Over the campaign tracking period, the invitation generated ${stats.totalVisits} total views and ${stats.qrVisits} direct QR scans, with ${stats.devices.mobile} visits originating from mobile devices on campus. The campaign logged ${stats.totalPledges} student pledges to stop by and get swabbed, while ${stats.events.calendar_add} students synced the tabling session to their calendars. By combining poignant typography with urgent medical facts—such as a diagnosis occurring every 3-4 minutes—the invitation successfully generated active campus participation.`
      );
    }
  }, [stats]);

  const handleCopySummary = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header bar */}
      <div className="ethereal-glass rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400/20 to-blue-600/10 border border-white/15 flex items-center justify-center text-sky-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-xl text-white font-medium">
              Interactive Triptych Device Showcase
            </h3>
            <p className="text-xs text-slate-400">
              Direct implementation of the reference UI aesthetic: Invitation Onboarding, Event Portal, and AI Agent Echo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateScan}
            className="px-4 py-2 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-300" />
            Simulate Live Scan
          </button>
          <button
            onClick={handleCopySummary}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSummary ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            Copy 5-Sentence Reflection
          </button>
        </div>
      </div>

      {/* 3 Phone Frames Side-by-Side (Directly Replicating User Screenshot) */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="flex items-start justify-center gap-6 sm:gap-8 min-w-[1050px] px-4">
          {/* =========================================================================
              PHONE 1: Invitation & Onboarding Screen (Left Screen in Reference)
             ========================================================================= */}
          <div className="w-[330px] h-[670px] rounded-[48px] bg-black border-[7px] border-[#1f2833] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-3 relative flex flex-col overflow-hidden">
            {/* Inner Screen */}
            <div className="w-full h-full rounded-[40px] bg-gradient-to-b from-[#8ab4ce] via-[#486e8a] to-[#0a141d] text-white p-5 flex flex-col justify-between relative overflow-hidden select-none">
              {/* Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-semibold opacity-90 px-1 pt-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="w-4 h-2 rounded-sm border border-current flex items-center px-0.5">
                    <div className="w-full h-1 bg-current rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center space-y-2 mt-8">
                <h3 className="font-editorial text-[26px] font-normal leading-[1.15] tracking-tight text-white">
                  Save more than just <br />
                  files — <span className="italic">save moments</span>
                </h3>
                <p className="text-[11px] text-white/80 max-w-[240px] mx-auto leading-relaxed">
                  A single 30-second cheek swab at UC Berkeley gives a blood cancer patient a second chance at life.
                </p>
              </div>

              {/* Blossom Emblem & Brand Name (Exactly matching Screen 1) */}
              <div className="flex flex-col items-center justify-center my-auto space-y-3">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-white drop-shadow" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="22" r="11" opacity="0.95" />
                      <circle cx="70" cy="30" r="11" opacity="0.95" />
                      <circle cx="78" cy="50" r="11" opacity="0.95" />
                      <circle cx="70" cy="70" r="11" opacity="0.95" />
                      <circle cx="50" cy="78" r="11" opacity="0.95" />
                      <circle cx="30" cy="70" r="11" opacity="0.95" />
                      <circle cx="22" cy="50" r="11" opacity="0.95" />
                      <circle cx="30" cy="30" r="11" opacity="0.95" />
                      <circle cx="50" cy="50" r="12" fill="#ffffff" />
                    </svg>
                  </div>
                </div>
                <div className="font-sans-ui text-sm font-bold tracking-[0.25em] text-white uppercase">
                  NMDP × CAL
                </div>
              </div>

              {/* Bottom Action Section */}
              <div className="space-y-3 mb-2">
                <button
                  onClick={onOpenPortal}
                  className="w-full py-3.5 px-5 rounded-full bg-black hover:bg-neutral-900 text-white font-semibold text-xs transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                >
                  <span>Start saving lives</span>
                </button>
                <div className="text-[10px] text-center text-white/70 font-medium">
                  Monday, Sept 21 • Outside Amazon Hub Locker
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              PHONE 2: Event Portal & Discovery (Center Screen in Reference)
             ========================================================================= */}
          <div className="w-[330px] h-[670px] rounded-[48px] bg-black border-[7px] border-[#1f2833] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-3 relative flex flex-col overflow-hidden">
            <div className="w-full h-full rounded-[40px] bg-[#070b10] text-white p-4 flex flex-col justify-between relative overflow-hidden select-none">
              {/* Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-semibold opacity-80 px-2 pt-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="w-4 h-2 rounded-sm border border-current flex items-center px-0.5">
                    <div className="w-full h-1 bg-current rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Main Scrollable Content */}
              <div className="flex-1 overflow-y-auto space-y-3.5 py-2 pr-0.5 mt-1">
                {/* Top Ethereal Memory Card */}
                <div className="rounded-[28px] ethereal-card-gradient p-4 border border-white/15 relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="ethereal-pill text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white/90">
                      Tabling Pop-Up
                    </span>
                    <span className="text-[10px] text-white/70 font-mono">Sept 21, 2026</span>
                  </div>

                  {/* Card Title & Content */}
                  <div className="pt-8 space-y-1">
                    <h4 className="font-editorial text-2xl text-white font-normal leading-tight">
                      Morning on Bancroft Way
                    </h4>
                    <p className="text-[10px] text-white/75 leading-snug">
                      10am – 12pm PT outside Amazon Hub Locker (2495 Bancroft Way). Berkeley MDes volunteers sharing info.
                    </p>
                  </div>
                </div>

                {/* Glowing Beacon Orb & Question Widget (Mirroring Screen 2) */}
                <div className="text-center py-2 space-y-2">
                  <div className="relative mx-auto w-10 h-10 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-md animate-pulse" />
                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 border border-white/40 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                    Every 3–4 Minutes
                  </div>
                  <h5 className="font-editorial text-base text-white leading-tight px-2">
                    Someone in the U.S. is diagnosed with a blood cancer. Will you step up?
                  </h5>

                  <button
                    onClick={onOpenPortal}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#2f4f66] to-[#406885] border border-white/20 text-white text-xs font-semibold shadow hover:brightness-110 transition-all cursor-pointer"
                  >
                    Open Pledge Form
                  </button>
                </div>

                {/* Second Peeking Card */}
                <div className="rounded-[24px] bg-gradient-to-b from-[#13222e] to-[#0d161f] p-3.5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="ethereal-pill text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white/80">
                      85%+ Non-Surgical
                    </span>
                    <span className="text-[10px] text-white/60 font-mono">PBSC Donation</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug pt-1">
                    Blood stem cells live in bone marrow and blood, replacing damaged cells to restore immune systems.
                  </p>
                </div>
              </div>

              {/* Floating Bottom Navigation Dock (Exact replica of Screen 2's Dock) */}
              <div className="pt-2">
                <div className="rounded-full bg-[#121820]/90 backdrop-blur-xl border border-white/10 p-1.5 flex items-center justify-between shadow-2xl">
                  <div className="flex items-center gap-3 pl-3">
                    <button
                      onClick={() => setActiveTab('moments')}
                      className={`text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                        activeTab === 'moments' ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Drive</span>
                    </button>
                    <button
                      onClick={onOpenAnalytics}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onSimulateScan}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Circular White Plus Action Button */}
                  <button
                    onClick={onOpenPortal}
                    className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold shadow-lg hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              PHONE 3: AI Agent Echo & Real-Time Engagement (Right Screen in Reference)
             ========================================================================= */}
          <div className="w-[330px] h-[670px] rounded-[48px] bg-black border-[7px] border-[#1f2833] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-3 relative flex flex-col overflow-hidden">
            <div className="w-full h-full rounded-[40px] bg-[#070b10] text-white p-4 flex flex-col justify-between relative overflow-hidden select-none">
              {/* Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-semibold opacity-80 px-2 pt-1">
                <div className="flex items-center gap-1 text-slate-300 text-[11px]">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </div>
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">5G</span>
                </div>
              </div>

              {/* Horizontal Peek Carousel */}
              <div className="flex gap-2 overflow-x-hidden pt-2">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#2a455a] to-[#12202c] p-2 border border-white/10 flex flex-col justify-between flex-shrink-0">
                  <span className="text-[8px] uppercase tracking-wider text-sky-200">Views</span>
                  <div className="font-editorial text-lg text-white font-medium">{stats?.totalVisits || 12}</div>
                  <span className="text-[8px] text-slate-400">Total reach</span>
                </div>
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1a3346] to-[#0c1822] p-2 border border-white/10 flex flex-col justify-between flex-shrink-0">
                  <span className="text-[8px] uppercase tracking-wider text-purple-200">QR Opens</span>
                  <div className="font-editorial text-lg text-white font-medium">{stats?.qrVisits || 8}</div>
                  <span className="text-[8px] text-emerald-400">{stats?.qrOpenRate || 67}% rate</span>
                </div>
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#2d2238] to-[#160f1e] p-2 border border-white/10 flex flex-col justify-between flex-shrink-0">
                  <span className="text-[8px] uppercase tracking-wider text-rose-200">Pledges</span>
                  <div className="font-editorial text-lg text-white font-medium">{stats?.totalPledges || 5}</div>
                  <span className="text-[8px] text-rose-300">Committed</span>
                </div>
              </div>

              {/* Echo Glowing Orb & Question Header */}
              <div className="text-center py-2 space-y-1.5">
                <div className="relative mx-auto w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-md" />
                  <Sparkles className="w-5 h-5 text-sky-300 relative z-10" />
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">AI Agent Echo</div>
                <h5 className="font-editorial text-sm text-white font-normal leading-snug px-2">
                  Synthesizing campus activity outside Amazon Hub Locker.
                </h5>
              </div>

              {/* Frosted Action Box (Exact replica of Screen 3's widget) */}
              <div className="rounded-[24px] bg-gradient-to-b from-[#243d52]/80 to-[#122332]/90 p-3.5 border border-white/15 space-y-2.5">
                <div className="flex items-center justify-between text-[9px] text-slate-300">
                  <span>Assignment Submission</span>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-sky-200">#MDES</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-sky-200">#NMDP</span>
                  </div>
                </div>

                <p className="text-[11px] text-white leading-snug font-medium">
                  Would you like me to generate your 3–6 sentence assignment reflection?
                </p>

                <button
                  onClick={handleCopySummary}
                  className="w-full py-2 px-3 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-[11px] transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copiedSummary ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSummary ? 'Copied to Clipboard!' : 'Copy 5-Sentence Report'}
                </button>
              </div>

              {/* Bullet Features (Matching Screen 3's "What it does") */}
              <div className="text-[10px] text-slate-400 space-y-1 px-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-300" />
                  Campaign metrics captured:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[10px]">
                  <li>Tracks QR open rate vs campus placement</li>
                  <li>Records student stem cell registry pledges</li>
                  <li>Generates slide reflection with live data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

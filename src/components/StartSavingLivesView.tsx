import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Heart, 
  QrCode, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Users, 
  Activity, 
  ExternalLink 
} from 'lucide-react';
import { CampaignStats } from '../types';

interface StartSavingLivesViewProps {
  stats: CampaignStats | null;
  onNavigateToInvitation: () => void;
  onNavigateToPortal: () => void;
  onNavigateToAnalytics: () => void;
}

export const StartSavingLivesView: React.FC<StartSavingLivesViewProps> = ({
  stats,
  onNavigateToInvitation,
  onNavigateToPortal,
  onNavigateToAnalytics,
}) => {
  const handleAddToCalendar = () => {
    const title = encodeURIComponent('NMDP Stem Cell Registry Pop-Up Tabling @ UC Berkeley');
    const details = encodeURIComponent(
      'Join Berkeley MDes students & NMDP volunteers outside the Amazon Hub Locker to raise awareness for Blood & Pediatric Cancer Awareness Month and get swabbed for the donor registry!'
    );
    const location = encodeURIComponent('Amazon Hub Locker, 2495 Bancroft Way, Berkeley, CA 94720');
    const dates = '20260921T170000Z/20260921T190000Z'; // 10am-12pm PT is 17:00-19:00 UTC
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`, '_blank');
  };

  const handleOpenMap = () => {
    window.open('https://maps.google.com/?q=2495+Bancroft+Way,+Berkeley,+CA+94720', '_blank');
  };

  const totalPledges = stats?.totalPledges || 0;
  const totalVisits = stats?.totalVisits || 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-16 animate-in fade-in duration-500">
      {/* Primary Hero Section: Directly Translating Reference Aesthetic Screen 1 */}
      <div className="relative rounded-[36px] sm:rounded-[44px] overflow-hidden ethereal-card-gradient border border-white/20 p-8 sm:p-14 shadow-2xl">
        {/* Soft atmospheric misty overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-7 max-w-2xl mx-auto">
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="ethereal-pill px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase flex items-center gap-2 text-white shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
              Blood &amp; Pediatric Cancer Awareness Month
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono text-sky-200">
              Monday, Sept 21 • 10am – 12pm PT
            </div>
          </div>

          {/* Central Cellular Blossom Life Emblem */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center my-2">
            {/* Ambient pulsating radial haze */}
            <div className="absolute inset-0 bg-sky-400/25 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-[0_0_50px_rgba(138,180,206,0.3)]">
              <svg className="w-16 h-16 sm:w-18 sm:h-18 text-white drop-shadow-md" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="22" r="10" opacity="0.9" />
                <circle cx="70" cy="30" r="10" opacity="0.9" />
                <circle cx="78" cy="50" r="10" opacity="0.9" />
                <circle cx="70" cy="70" r="10" opacity="0.9" />
                <circle cx="50" cy="78" r="10" opacity="0.9" />
                <circle cx="30" cy="70" r="10" opacity="0.9" />
                <circle cx="22" cy="50" r="10" opacity="0.9" />
                <circle cx="30" cy="30" r="10" opacity="0.9" />
                <circle cx="50" cy="50" r="13" fill="#ffffff" />
              </svg>
            </div>
          </div>

          {/* Editorial Display Typography */}
          <div className="space-y-3.5">
            <h1 className="font-editorial text-4xl sm:text-6xl text-white font-normal leading-[1.08] tracking-tight">
              Start Saving Lives.
            </h1>
            <p className="text-sm sm:text-base text-slate-200 font-light leading-relaxed max-w-xl mx-auto">
              Every 3 to 4 minutes, someone in the U.S. is diagnosed with a blood cancer. Outside the Amazon Hub Locker this September, your 5-minute cheek swab can give a patient their second chance at life.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              onClick={onNavigateToPortal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
              <span>Enter Event Portal &amp; Pledge</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={onNavigateToInvitation}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm transition-all backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-sky-300" />
              <span>View Official Invitation Card &amp; QR</span>
            </button>
          </div>

          {/* Quick Real-Time Impact Metric */}
          {totalPledges > 0 && (
            <div className="pt-1 flex items-center gap-2 text-xs text-sky-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong>{totalPledges} students</strong> have already pledged to stop by on Sept 21!
              </span>
              <button
                onClick={onNavigateToAnalytics}
                className="underline hover:text-white cursor-pointer ml-1 text-[11px]"
              >
                View Live Stats
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Event Logistics & Interactive Cards (Real Responsive Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Date & Time Card */}
        <div className="ethereal-glass rounded-3xl p-6 border border-white/15 space-y-3 hover:border-white/30 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-sky-400/20 text-sky-300 border border-white/15 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">
            Date &amp; Schedule
          </div>
          <h3 className="font-editorial text-2xl text-white font-normal">
            Monday, Sept 21
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            10:00 AM – 12:00 PM PT. Drop in anytime between classes for a quick, painless 5-minute cheek swab.
          </p>
          <button
            onClick={handleAddToCalendar}
            className="text-xs text-sky-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer pt-1"
          >
            Add to Google Calendar <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Location Card */}
        <div className="ethereal-glass rounded-3xl p-6 border border-white/15 space-y-3 hover:border-white/30 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-white/15 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            Campus Pop-Up Site
          </div>
          <h3 className="font-editorial text-2xl text-white font-normal">
            Amazon Hub Locker
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            2495 Bancroft Way, Berkeley, CA 94720. Look for the UC Berkeley MDes banner and volunteer table!
          </p>
          <button
            onClick={handleOpenMap}
            className="text-xs text-indigo-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer pt-1"
          >
            Get Walking Directions <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Impact & Medical Fact Card */}
        <div className="ethereal-glass rounded-3xl p-6 border border-white/15 space-y-3 hover:border-white/30 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 border border-white/15 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">
            Why It Matters
          </div>
          <h3 className="font-editorial text-2xl text-white font-normal">
            Painless &amp; Non-Surgical
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Over 85% of stem cell donations are non-surgical PBSC (like donating plasma). 70% of patients rely on stranger donors!
          </p>
          <button
            onClick={onNavigateToPortal}
            className="text-xs text-rose-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer pt-1"
          >
            Take 10s Myth Quiz <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two Next Step Pathways */}
      <div className="ethereal-glass rounded-[32px] p-6 sm:p-8 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
            Ready to participate?
          </div>
          <h4 className="font-editorial text-2xl sm:text-3xl text-white font-normal">
            Join UC Berkeley students making a real difference
          </h4>
          <p className="text-xs text-slate-300 font-light">
            You can pledge to stop by, view the digital invitation card, or print physical flyers with live QR codes.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onNavigateToPortal}
            className="px-6 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <span>Enter Event Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Camera, Download, Sparkles, MapPin, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface CampusMockupProps {
  onBackToCard: () => void;
}

export const CampusMockup: React.FC<CampusMockupProps> = ({ onBackToCard }) => {
  const [activeScene, setActiveScene] = useState<'amazon_locker' | 'sproul_board'>('amazon_locker');
  const [downloadNotice, setDownloadNotice] = useState(false);

  const handleCaptureTip = () => {
    trackEvent('invitation_downloaded', { scene: activeScene, type: 'photo_mockup' });
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Controls Header */}
      <div className="ethereal-glass rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400/20 to-indigo-500/10 border border-white/15 flex items-center justify-center text-sky-300">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-xl text-white font-medium">Campus Physical In-Situ Mockup</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 font-semibold">
                Assignment Slide Asset
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Photorealistic in-situ rendering outside Amazon Hub Locker (2495 Bancroft Way) for your slide deck
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex bg-black/40 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setActiveScene('amazon_locker')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeScene === 'amazon_locker'
                  ? 'bg-white text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Amazon Hub Site
            </button>
            <button
              onClick={() => setActiveScene('sproul_board')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeScene === 'sproul_board'
                  ? 'bg-white text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sproul Plaza Board
            </button>
          </div>

          <button
            onClick={handleCaptureTip}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Capture for Slides
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Tip for your Google Slide deck:</strong> Use a screen capture tool (Shift+Cmd+4 on macOS or Win+Shift+S on Windows) to snap this framed mockup and paste directly into your presentation deck.
          </span>
        </div>
      )}

      {/* Realistic Photo Mockup Canvas */}
      <div className="relative w-full rounded-[38px] overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-b from-[#091118] via-[#111f2c] to-[#070d13] p-6 sm:p-14 flex items-center justify-center min-h-[580px]">
        {/* Atmospheric twilight background blur */}
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#8ab4ce_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Environmental context location tag */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs border border-white/15">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          {activeScene === 'amazon_locker' ? (
            <span>2495 Bancroft Way, Berkeley (Outside Amazon Hub Locker)</span>
          ) : (
            <span>Sproul Plaza Campus Notice Board, UC Berkeley</span>
          )}
        </div>

        {/* Physical Poster Display Container */}
        <div className="relative z-10 w-full max-w-sm sm:max-w-md transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300">
          {/* Pushpins or Table stand hardware */}
          {activeScene === 'sproul_board' ? (
            <>
              <div className="absolute -top-3 left-6 z-30 w-5 h-5 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
              </div>
              <div className="absolute -top-3 right-6 z-30 w-5 h-5 rounded-full bg-sky-600 border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-200" />
              </div>
            </>
          ) : (
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md text-white px-3.5 py-0.5 rounded-full text-[10px] font-semibold border border-white/20 shadow-lg">
              Tabling Stand • 2495 Bancroft Way
            </div>
          )}

          {/* Physical flyer surface with ethereal twilight theme */}
          <div className="bg-gradient-to-b from-[#8ab4ce]/95 via-[#315774] to-[#0a1219] text-white rounded-[32px] p-7 sm:p-8 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] border border-white/30 relative overflow-hidden">
            {/* Header badges */}
            <div className="flex items-center justify-between mb-4">
              <span className="ethereal-pill px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                NMDP × Berkeley MDes
              </span>
              <span className="text-[10px] uppercase tracking-wider text-sky-200 font-semibold font-mono">
                Sept 21 • 10am-12pm
              </span>
            </div>

            {/* Blossom Emblem */}
            <div className="flex items-center justify-center my-2">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <svg className="w-10 h-10 text-white" viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="50" cy="22" r="11" opacity="0.9" />
                  <circle cx="70" cy="30" r="11" opacity="0.9" />
                  <circle cx="78" cy="50" r="11" opacity="0.9" />
                  <circle cx="70" cy="70" r="11" opacity="0.9" />
                  <circle cx="50" cy="78" r="11" opacity="0.9" />
                  <circle cx="30" cy="70" r="11" opacity="0.9" />
                  <circle cx="22" cy="50" r="11" opacity="0.9" />
                  <circle cx="30" cy="30" r="11" opacity="0.9" />
                  <circle cx="50" cy="50" r="12" fill="#ffffff" />
                </svg>
              </div>
            </div>

            {/* Editorial Title */}
            <div className="text-center my-3">
              <h3 className="font-editorial text-2xl sm:text-3xl font-normal leading-tight text-white">
                Save more than just a moment — <br />
                <span className="italic">save a life.</span>
              </h3>
              <p className="text-[11px] text-white/80 mt-1 max-w-xs mx-auto">
                UC Berkeley Tabling Pop-Up for Blood &amp; Pediatric Cancer Awareness Month.
              </p>
            </div>

            {/* Stat */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/15 text-xs text-white/90 mb-3 space-y-0.5 text-center">
              <div className="text-[10px] uppercase tracking-widest text-sky-300 font-bold">Every 3–4 Minutes</div>
              <p className="text-[11px]">Someone in the U.S. is diagnosed with a blood cancer. A 30-sec swab is all it takes to join the registry.</p>
            </div>

            {/* Logistics box */}
            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1 mb-3 text-xs">
              <div className="text-sky-200 font-semibold text-[11px]">
                📅 Monday, Sept 21st • 10:00 AM – 12:00 PM PT
              </div>
              <div className="text-white/80 text-[11px]">
                📍 Outside Amazon Hub Locker (2495 Bancroft Way, Berkeley)
              </div>
            </div>

            {/* QR block */}
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-xl p-1 flex-shrink-0 flex items-center justify-center shadow">
                <div className="w-full h-full bg-slate-950 rounded-lg grid grid-cols-4 gap-0.5 p-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-[1px] ${
                        i % 2 === 0 || i === 3 || i === 12 ? 'bg-white' : 'bg-slate-950'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-left text-xs">
                <div className="font-editorial text-base text-white">Scan with Camera</div>
                <div className="text-[10px] text-white/70">
                  Tracked QR for RSVP &amp; tabling location
                </div>
                <div className="text-[10px] text-sky-300 font-mono mt-0.5">
                  Spot: {activeScene}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

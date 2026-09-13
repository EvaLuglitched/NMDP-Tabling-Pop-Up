import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  Download, 
  Printer, 
  QrCode as QrIcon, 
  Share2, 
  Layers,
  GraduationCap,
  Activity,
  CheckCircle2,
  ExternalLink,
  Heart,
  ArrowRight,
  Globe
} from 'lucide-react';
import { DesignTheme, CampusSpot, SpotConfig } from '../types';
import { trackEvent } from '../utils/analytics';

interface InvitationCardProps {
  onSimulateScan?: () => void;
  onNavigateToPortal?: () => void;
}

const CAMPUS_SPOTS: SpotConfig[] = [
  { id: 'amazon_hub_flyer', label: 'Amazon Hub Locker (Event Site)', location: '2495 Bancroft Way', type: 'Physical Poster / Table' },
  { id: 'campus_poster_sproul', label: 'Sproul Plaza Notice Board', location: 'Sproul Hall Bulletin', type: 'Campus Kiosk Poster' },
  { id: 'moffitt_library_table', label: 'Moffitt Library 3rd Floor', location: 'Study Hall Tables', type: 'Flyer Handout' },
  { id: 'mdes_slack', label: 'Berkeley MDes Community', location: 'Digital Design Studio', type: 'Social & Slack' },
  { id: 'instagram_mdes', label: 'Instagram Stories & Linktree', location: 'UC Berkeley Bio', type: 'Digital Story' },
];

export const InvitationCard: React.FC<InvitationCardProps> = ({ onSimulateScan, onNavigateToPortal }) => {
  const [theme, setTheme] = useState<DesignTheme>('ethereal');
  const [selectedSpot, setSelectedSpot] = useState<CampusSpot>('amazon_hub_flyer');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [customDomain, setCustomDomain] = useState<string>('');
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getDestinationUrl = (spot: CampusSpot): string => {
    const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://berkeley.edu';
    const origin = customDomain.trim() ? customDomain.trim().replace(/\/+$/, '') : defaultOrigin;
    return `${origin}/?utm_source=${spot}&utm_medium=qr_code&utm_campaign=nmdp_berkeley_fall26&target=event_portal`;
  };

  useEffect(() => {
    const targetUrl = getDestinationUrl(selectedSpot);
    const darkColor = theme === 'ethereal' ? '#0b141d' : theme === 'berkeley' ? '#003262' : '#0f172a';
    
    QRCode.toDataURL(targetUrl, {
      width: 480,
      margin: 1.5,
      color: {
        dark: darkColor,
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [theme, selectedSpot, customDomain]);

  const handlePrint = () => {
    trackEvent('flyer_printed', { theme, spot: selectedSpot });
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    trackEvent('invitation_downloaded', { format: 'qr_png', theme, spot: selectedSpot });
    const link = document.createElement('a');
    link.download = `NMDP-Berkeley-Tabling-QR-${selectedSpot}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleCopyLink = () => {
    const url = getDestinationUrl(selectedSpot);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    trackEvent('share_clicked', { spot: selectedSpot, method: 'copy_tracked_url' });
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Aesthetic Controls & Spot Attribution Bar */}
      <div className="ethereal-glass rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400/20 to-indigo-500/10 border border-white/15 flex items-center justify-center text-sky-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-lg text-white font-medium tracking-wide">
              Invitation Graphic Design Studio
            </h3>
            <p className="text-xs text-slate-400">
              Ethereal dusk typography, tracked QR placement, and high-res print export
            </p>
          </div>
        </div>

        {/* Theme Palette Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme('ethereal')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              theme === 'ethereal'
                ? 'bg-gradient-to-r from-sky-500/30 to-blue-600/30 text-white border border-sky-400/50 shadow-lg shadow-sky-950/40'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
            Ethereal Dusk (Reference UI)
          </button>
          <button
            onClick={() => setTheme('berkeley')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              theme === 'berkeley'
                ? 'bg-[#003262]/80 text-amber-300 border border-amber-400/50 shadow'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Cal Blue &amp; Gold
          </button>
          <button
            onClick={() => setTheme('minimalist')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              theme === 'minimalist'
                ? 'bg-white text-slate-950 font-bold border border-white shadow'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            Monochrome Poster
          </button>
        </div>

        {/* Print & Download Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-sky-300" />
            Print Invitation
          </button>
          <button
            onClick={handleDownloadQr}
            className="px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 hover:bg-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download QR (.png)
          </button>
        </div>
      </div>

      {/* Main Grid: Card on Left (Col 7), Campaign Placement & Details on Right (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Ethereal Invitation Card & Interactive QR Pass */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            ref={cardRef}
            id="printable-invitation"
            className={`w-full max-w-lg rounded-3xl sm:rounded-[36px] p-6 sm:p-9 shadow-2xl transition-all duration-300 relative overflow-hidden border ${
              theme === 'ethereal'
                ? 'bg-gradient-to-b from-[#8ab4ce]/95 via-[#3a617d] to-[#091118] text-white border-white/25 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]'
                : theme === 'berkeley'
                ? 'bg-gradient-to-b from-[#003262] via-[#00274D] to-[#001D38] text-white border-amber-400/40'
                : 'bg-white text-slate-950 border-slate-300 shadow-xl'
            }`}
          >
            {/* Header badges and date row */}
            <div className="flex items-center justify-between mb-6">
              <div className="ethereal-pill px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wider uppercase flex items-center gap-1.5 text-white/90">
                <Sparkles className="w-3 h-3 text-sky-300" />
                September Awareness Drive
              </div>
              <div className="text-[11px] tracking-widest text-white/80 uppercase font-mono">
                Sept 21, 2026
              </div>
            </div>

            {/* Ethereal Blossom / Stem Cell Life Emblem (Mirroring reference UI) */}
            <div className="flex flex-col items-center text-center my-4 space-y-3">
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Glowing ambient radial haze */}
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                
                {/* Petal blossom geometric ring representing cells and renewal */}
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white drop-shadow-md" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="22" r="12" opacity="0.9" />
                    <circle cx="70" cy="30" r="12" opacity="0.9" />
                    <circle cx="78" cy="50" r="12" opacity="0.9" />
                    <circle cx="70" cy="70" r="12" opacity="0.9" />
                    <circle cx="50" cy="78" r="12" opacity="0.9" />
                    <circle cx="30" cy="70" r="12" opacity="0.9" />
                    <circle cx="22" cy="50" r="12" opacity="0.9" />
                    <circle cx="30" cy="30" r="12" opacity="0.9" />
                    <circle cx="50" cy="50" r="13" fill="#ffffff" />
                  </svg>
                </div>
              </div>

              <div className="text-xs font-semibold tracking-widest uppercase text-white/90">
                NMDP × UC Berkeley
              </div>
            </div>

            {/* Main Editorial Headline (Matching Reference Typography) */}
            <div className="text-center space-y-3 my-6">
              <h2 className="font-editorial text-3xl sm:text-4xl text-white font-normal leading-[1.15] tracking-tight">
                Save more than just a moment — <br />
                <span className="italic font-normal">save a life.</span>
              </h2>
              <p className="text-xs sm:text-[13px] text-white/80 max-w-xs mx-auto leading-relaxed">
                Berkeley MDes students pop-up on Bancroft Way to help you join the blood stem cell registry with a 30-second cheek swab.
              </p>
            </div>

            {/* Urgent Medical Stat in Frosted Pill Box */}
            <div className="ethereal-pill rounded-2xl p-3.5 mb-6 text-center space-y-1">
              <div className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-300" />
                Every 3–4 Minutes
              </div>
              <p className="text-[11px] sm:text-xs text-white/90 leading-snug">
                Someone in the U.S. is diagnosed with a blood cancer. Blood stem cells restore damaged immune systems.
              </p>
            </div>

            {/* Event Logistics Frosted Card */}
            <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 p-4 space-y-2.5 mb-6 text-xs text-white/95">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-sky-300 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase font-semibold">When</div>
                  <div className="font-medium text-xs sm:text-sm">Monday, September 21st • 10am – 12pm PT</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-sky-300 flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase font-semibold">Where</div>
                  <div className="font-medium text-xs sm:text-sm">Outside Amazon Hub Locker</div>
                  <div className="text-[11px] text-white/70">2495 Bancroft Way, Berkeley, CA 94720</div>
                </div>
              </div>
            </div>

            {/* Tracked QR Code Section Styled as Modern Interactive Pass */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex items-center gap-4 shadow-xl">
              <div 
                onClick={() => window.open(getDestinationUrl(selectedSpot), '_blank')}
                className="bg-white p-2 rounded-xl shadow-lg flex-shrink-0 relative group cursor-pointer transition-transform hover:scale-105"
                title="Click to test open this QR destination URL in a new tab"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scan to RSVP for NMDP tabling session"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-slate-400 text-xs">
                    Generating...
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium p-1 text-center">
                  <ExternalLink className="w-4 h-4 mb-1 text-sky-300" />
                  Click to Test Scan
                </div>
              </div>

              <div className="space-y-1.5 text-left flex-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Tracked Live Link
                </span>
                <h4 className="font-editorial text-lg text-white font-medium leading-snug">
                  Scan with Camera
                </h4>
                <p className="text-[11px] text-white/70 leading-normal">
                  RSVP, add to calendar, and view live Berkeley tabling directions.
                </p>
                <button
                  onClick={onSimulateScan}
                  className="mt-1 text-[11px] font-medium text-sky-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Simulate scan in-app <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Bottom Signature Action Pill (Matching Reference UI's Bottom Button) */}
            <div className="mt-7 pt-2">
              <button
                onClick={onNavigateToPortal}
                className="w-full py-3.5 px-6 rounded-full bg-slate-950 hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-white/15"
              >
                <span>Enter Event Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-300" />
              </button>
              <p className="text-[10px] text-center text-white/60 mt-3 font-medium">
                Your memory is more than a gallery • Your swab can save a life
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 justify-center">
              <QrIcon className="w-3.5 h-3.5 text-sky-400" />
              Live QR encoded with spot:{' '}
              <code className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[11px] font-mono text-sky-300">
                {selectedSpot}
              </code>
            </span>
          </div>
        </div>

        {/* Right: Campus Placement Selector & Assignment Compliance */}
        <div className="lg:col-span-5 space-y-5">
          {/* Campaign Spot Selector */}
          <div className="ethereal-glass rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-editorial text-xl text-white font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Campus Placement Attribution
              </h4>
              <span className="text-[11px] text-sky-300 font-mono">Live Tracking</span>
            </div>
            <p className="text-xs text-slate-300">
              Select where this invitation will be physically posted or shared to track localized engagement:
            </p>

            <div className="space-y-2">
              {CAMPUS_SPOTS.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedSpot === spot.id
                      ? 'bg-gradient-to-r from-sky-950/60 to-blue-950/40 border-sky-400/60 shadow-lg shadow-sky-950/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{spot.label}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/15">
                      {spot.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{spot.location}</div>
                </button>
              ))}
            </div>

            {/* Quick URL Copy Bar & Vercel Custom Domain Configuration */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1 text-slate-200 font-semibold">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  QR 编码目标地址 (QR Destination)
                </span>
                <button
                  onClick={() => setIsEditingDomain(!isEditingDomain)}
                  className="text-sky-300 hover:text-white underline text-[10px] cursor-pointer"
                >
                  {isEditingDomain ? '取消自定义' : '自定义 Vercel 域名'}
                </button>
              </div>

              {isEditingDomain && (
                <div className="p-2.5 rounded-xl bg-black/50 border border-sky-400/30 space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[10px] text-slate-400 block">
                    输入您在 Vercel 部署后的域名（例如 https://my-nmdp.vercel.app）：
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://your-app.vercel.app"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="flex-1 bg-white/10 text-xs text-white px-2.5 py-1.5 rounded-lg border border-white/20 focus:outline-none focus:border-sky-400 font-mono"
                    />
                    <button
                      onClick={() => setCustomDomain('')}
                      className="px-2 py-1.5 rounded-lg bg-white/10 text-[10px] text-slate-300 hover:text-white cursor-pointer"
                      title="重置为当前浏览器自动识别的域名"
                    >
                      重置
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getDestinationUrl(selectedSpot)}
                  className="flex-1 bg-black/40 text-[11px] text-sky-200 px-3 py-2.5 rounded-xl border border-white/10 font-mono truncate select-all"
                />
                <button
                  onClick={() => window.open(getDestinationUrl(selectedSpot), '_blank')}
                  className="p-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                  title="在新窗口打开测试此二维码链接"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Assignment Requirement Guidance Card */}
          <div className="rounded-3xl p-5 border border-sky-400/20 bg-gradient-to-br from-[#122332]/90 to-[#0c1622]/90 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-sky-300">
              <Sparkles className="w-4 h-4" />
              <h4 className="font-editorial text-lg text-white font-medium">
                Assignment Page &amp; Google Slide Deck
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Include a scan or photo of your invitation and describe what you created with your live interaction numbers (3 - 6 sentences).
            </p>
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span><strong>Format:</strong> High-res printable flyer &amp; digital invitation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span><strong>Tracking:</strong> Real-time QR scans &amp; web visitor analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span><strong>University Ethics:</strong> Full compliance with Student Code of Conduct</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

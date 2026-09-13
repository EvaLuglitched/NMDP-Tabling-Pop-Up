import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Share2,
  CheckCircle2,
  ExternalLink,
  Users,
  Activity,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { trackEvent, generateGoogleCalendarUrl, downloadIcsFile } from '../utils/analytics';
import { PledgeItem } from '../types';

interface EventLandingViewProps {
  onPledgeSubmitted?: (pledge: PledgeItem) => void;
  onNavigateToAnalytics?: () => void;
}

export const EventLandingView: React.FC<EventLandingViewProps> = ({
  onPledgeSubmitted,
  onNavigateToAnalytics
}) => {
  // Pledge Form State
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState<PledgeItem['affiliation']>('Undergraduate');
  const [timePreference, setTimePreference] = useState('10:00 - 10:30 AM');
  const [reminderType, setReminderType] = useState<'email' | 'sms' | 'calendar_only'>('calendar_only');
  const [contact, setContact] = useState('');
  const [pledgeNote, setPledgeNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPledge, setSubmittedPledge] = useState<PledgeItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Interactive Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // FAQ toggle state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Share state
  const [shareCopied, setShareCopied] = useState(false);

  const handleAddToCalendar = (type: 'google' | 'ics') => {
    trackEvent('calendar_add', { format: type });
    if (type === 'google') {
      window.open(generateGoogleCalendarUrl(), '_blank', 'noopener,noreferrer');
    } else {
      downloadIcsFile();
    }
  };

  const handleOpenMap = (app: 'google' | 'apple') => {
    trackEvent('map_opened', { app });
    const address = 'Amazon Hub Locker, 2495 Bancroft Way, Berkeley, CA 94720';
    if (app === 'google') {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    } else {
      window.open(`https://maps.apple.com/?address=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('utm_source') || 'event_portal';

      const res = await fetch('/api/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          affiliation,
          timePreference,
          reminderType,
          contact: contact.trim() || undefined,
          pledgeNote: pledgeNote.trim() || undefined,
          source,
          sessionId: localStorage.getItem('nmdp_berkeley_session_id') || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.pledge) {
        setSubmittedPledge(data.pledge);
        if (onPledgeSubmitted) {
          onPledgeSubmitted(data.pledge);
        }

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8ab4ce', '#FDB515', '#E63946', '#ffffff']
        });
      } else {
        setErrorMsg('Could not save pledge. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting pledge:', err);
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuizChoice = (index: number) => {
    setQuizAnswer(index);
    setQuizAnswered(true);
    trackEvent('quiz_answered', { question: 1, chosen: index, isCorrect: index === 1 });
  };

  const handleShareClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    trackEvent('share_clicked', { channel: 'copy_link' });
    setTimeout(() => setShareCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Ethereal Hero Card (Directly Mirroring Screen 2 from Reference UI) */}
      <div className="relative rounded-[36px] overflow-hidden ethereal-card-gradient border border-white/15 p-7 sm:p-10 shadow-2xl">
        {/* Soft atmospheric misty overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-2xl">
          {/* Header row with pill and date */}
          <div className="flex items-center justify-between">
            <div className="ethereal-pill px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wider uppercase flex items-center gap-1.5 text-white/90">
              <Sparkles className="w-3 h-3 text-sky-300" />
              September Awareness Drive
            </div>
            <span className="text-xs text-white/75 font-mono">Monday, Sept 21</span>
          </div>

          {/* Editorial Title */}
          <div className="space-y-3 pt-4">
            <h1 className="font-editorial text-3xl sm:text-5xl text-white font-normal leading-[1.1] tracking-tight">
              Morning on Bancroft Way
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg font-light">
              Crisp fall air, conversations between classes, and the feeling that a stranger's second chance at life starts with you.
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#pledge-section"
              className="px-5 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs sm:text-sm transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
              Pledge to Stop By &amp; Swab
            </a>
            <button
              onClick={() => handleAddToCalendar('google')}
              className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full text-xs sm:text-sm font-medium transition-all inline-flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <Calendar className="w-4 h-4 text-sky-300" />
              Add to Google Calendar
            </button>
            <button
              onClick={handleShareClick}
              className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-medium transition-all inline-flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <Share2 className="w-4 h-4" />
              {shareCopied ? 'Link Copied!' : 'Share with Friends'}
            </button>
          </div>
        </div>

        {/* Ambient atmospheric glow in bottom right */}
        <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* Glowing Beacon Section (Directly Mirroring Screen 2's Glowing Orb & Question) */}
      <div className="ethereal-glass rounded-[32px] p-7 sm:p-9 text-center space-y-4 shadow-xl border border-white/10 relative overflow-hidden">
        {/* Luminous Glowing Orb */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-lg animate-pulse" />
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 border border-white/40 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-sky-300 uppercase tracking-widest">
            The Reality in the U.S.
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl text-white font-normal leading-snug max-w-xl mx-auto">
            Every 3 to 4 minutes, someone is diagnosed with a blood cancer.
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Blood stem cells live in bone marrow and blood. When donated, these healthy cells start producing new cells to replace damaged ones and help restore their blood and immune systems.
          </p>
        </div>

        <div className="pt-2">
          <a
            href="#pledge-section"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Learn How to Join the Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Logistics & Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date & Time */}
        <div className="ethereal-glass p-5 rounded-3xl space-y-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-sky-300">Date &amp; Time</div>
            <div className="font-editorial text-xl text-white font-medium mt-0.5">Monday, Sept 21st</div>
            <div className="text-xs text-slate-300 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 text-sky-300" />
              10:00 AM – 12:00 PM PT
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs">
            <button
              onClick={() => handleAddToCalendar('google')}
              className="text-sky-300 hover:text-white font-medium cursor-pointer"
            >
              Google Cal
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => handleAddToCalendar('ics')}
              className="text-slate-300 hover:text-white font-medium cursor-pointer"
            >
              Apple (.ics)
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="ethereal-glass p-5 rounded-3xl space-y-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-sky-300">Campus Pop-Up</div>
            <div className="font-editorial text-xl text-white font-medium mt-0.5">Amazon Hub Locker</div>
            <div className="text-xs text-slate-300 mt-1">
              2495 Bancroft Way, Berkeley, CA 94720
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs">
            <button
              onClick={() => handleOpenMap('google')}
              className="text-sky-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              Google Maps
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => handleOpenMap('apple')}
              className="text-slate-300 hover:text-white font-medium cursor-pointer"
            >
              Apple Maps
            </button>
          </div>
        </div>

        {/* Volunteers */}
        <div className="ethereal-glass p-5 rounded-3xl space-y-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-sky-300">Volunteers Onsite</div>
            <div className="font-editorial text-xl text-white font-medium mt-0.5">Berkeley MDes Students</div>
            <div className="text-xs text-slate-300 mt-1">
              Master of Design students will guide your 30-sec cheek swab.
            </div>
          </div>
          <div className="pt-2 border-t border-white/10">
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Drop-ins welcome anytime
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Myth-Buster Widget (Mirroring Screen 3's Interactive Card) */}
      <div className="ethereal-glass rounded-3xl p-6 sm:p-8 border border-white/15 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-sky-300 border border-white/15 font-mono">
              #FACT_CHECK
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-sky-300 border border-white/15 font-mono">
              #PBSC_DONATION
            </span>
          </div>
          <span className="text-xs text-white/50">10-second quiz</span>
        </div>

        <h4 className="font-editorial text-2xl text-white font-normal leading-snug">
          Does donating blood stem cells always require surgery with bone marrow extraction?
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleQuizChoice(0)}
            className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              quizAnswer === 0
                ? 'bg-rose-950/60 border-rose-400 text-rose-200'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
            }`}
          >
            A. True, it's always a surgery with general anesthesia.
          </button>
          <button
            onClick={() => handleQuizChoice(1)}
            className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              quizAnswer === 1
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
            }`}
          >
            B. False! Over 85% of donations are non-surgical PBSC (like donating plasma).
          </button>
        </div>

        {quizAnswered && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm space-y-1.5 animate-in fade-in duration-300">
            {quizAnswer === 1 ? (
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Correct! You know your facts!
              </div>
            ) : (
              <div className="text-amber-300 font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Actually, it's False!
              </div>
            )}
            <p className="text-slate-300 text-xs leading-relaxed font-light">
              About 85% to 90% of stem cell donations are done through <strong>Peripheral Blood Stem Cell (PBSC)</strong> donation, an outpatient, non-surgical process where blood is drawn from one arm, passed through a machine that collects stem cells, and returned through the other arm!
            </p>
          </div>
        )}
      </div>

      {/* Student Pledge / RSVP Section */}
      <div id="pledge-section" className="ethereal-glass rounded-[36px] p-6 sm:p-10 border border-white/15 shadow-2xl">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-400/30 mx-auto flex items-center justify-center">
              <Heart className="w-6 h-6 fill-rose-400 text-rose-400" />
            </div>
            <h3 className="font-editorial text-3xl sm:text-4xl text-white font-normal">
              Pledge to Stop By &amp; Swab
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              No medical commitment today — let our MDes team know you plan to visit the Amazon Hub Locker table on Monday, Sept 21.
            </p>
          </div>

          {submittedPledge ? (
            <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-400/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-2xl text-white">Thank you, {submittedPledge.name}!</h4>
              <p className="text-xs text-emerald-200 max-w-md mx-auto">
                Your pledge has been logged in the campaign database. See you Monday, Sept 21st ({submittedPledge.timePreference}) outside the Amazon Hub Locker at 2495 Bancroft Way!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => handleAddToCalendar('google')}
                  className="px-5 py-2.5 rounded-full bg-white text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Add to Calendar
                </button>
                <button
                  onClick={() => setSubmittedPledge(null)}
                  className="px-4 py-2.5 rounded-full border border-white/20 text-white text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Pledge Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name or Initials *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    UC Berkeley Affiliation
                  </label>
                  <select
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#0c141d] border border-white/15 text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Undergraduate">Undergraduate Student</option>
                    <option value="Graduate / MDes">Graduate / MDes Student</option>
                    <option value="Faculty / Staff">Faculty / Staff</option>
                    <option value="Berkeley Community">Berkeley Community Member</option>
                    <option value="Visitor">Visitor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Time on Sept 21
                  </label>
                  <select
                    value={timePreference}
                    onChange={(e) => setTimePreference(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#0c141d] border border-white/15 text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="10:00 - 10:30 AM">10:00 – 10:30 AM</option>
                    <option value="10:30 - 11:00 AM">10:30 – 11:00 AM</option>
                    <option value="11:00 - 11:30 AM">11:00 – 11:30 AM</option>
                    <option value="11:30 - 12:00 PM">11:30 – 12:00 PM</option>
                    <option value="Flexible drop-in">Flexible drop-in between classes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Reminder Method (Ethical privacy protected)
                </label>
                <div className="flex gap-4 text-xs text-slate-300 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="reminder"
                      checked={reminderType === 'calendar_only'}
                      onChange={() => setReminderType('calendar_only')}
                    />
                    <span>Calendar Only</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="reminder"
                      checked={reminderType === 'email'}
                      onChange={() => setReminderType('email')}
                    />
                    <span>Email Reminder</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="reminder"
                      checked={reminderType === 'sms'}
                      onChange={() => setReminderType('sms')}
                    />
                    <span>SMS Alert</span>
                  </label>
                </div>

                {reminderType !== 'calendar_only' && (
                  <input
                    type="text"
                    placeholder={reminderType === 'email' ? 'yourname@berkeley.edu' : '(510) 555-0123'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Note or Inspiration (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swabbing between design studio classes!"
                  value={pledgeNote}
                  onChange={(e) => setPledgeNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm transition-all shadow-xl cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Logging Pledge...' : 'Confirm My Pledge to Visit Tabling'}
              </button>

              <p className="text-[11px] text-white/50 text-center leading-relaxed font-light">
                In strict accordance with the UC Berkeley Student Code of Conduct, data collected is used solely for the educational campaign and volunteer capacity planning.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

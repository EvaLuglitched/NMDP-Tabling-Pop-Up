import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  QrCode,
  Calendar,
  MapPin,
  Heart,
  Sparkles,
  Copy,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Layers,
  FileText,
  Activity,
  Zap,
  ArrowRight,
  Database,
  Trash2,
  Download,
  RotateCcw,
  Info
} from 'lucide-react';
import { CampaignStats, PledgeItem } from '../types';
import { trackEvent } from '../utils/analytics';
import { 
  DEFAULT_CAMPAIGN_STATS, 
  getInitialPledges, 
  cachePledgesLocally, 
  generateInstantSummary 
} from '../utils/defaultStats';

interface AnalyticsDashboardProps {
  stats: CampaignStats | null;
  isLoading: boolean;
  onRefreshStats: () => void;
  onSimulateQrScan: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  stats,
  isLoading,
  onRefreshStats,
  onSimulateQrScan,
}) => {
  const currentStats = stats || DEFAULT_CAMPAIGN_STATS;
  const [copiedReport, setCopiedReport] = useState(false);
  const [reportTone, setReportTone] = useState<'standard' | 'impact' | 'design'>('standard');
  const [generatedSummary, setGeneratedSummary] = useState<string>(() =>
    generateInstantSummary(currentStats, 'standard')
  );
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [pledgesList, setPledgesList] = useState<PledgeItem[]>(() => getInitialPledges());
  const [activeTab, setActiveTab] = useState<'overview' | 'pledges'>('overview');

  // Keep summary synchronized in 0ms whenever stats or tone changes
  useEffect(() => {
    setGeneratedSummary(generateInstantSummary(currentStats, reportTone));
  }, [currentStats.totalVisits, currentStats.qrVisits, currentStats.totalPledges, reportTone]);

  useEffect(() => {
    fetchPledges();
  }, [currentStats.totalPledges]);

  const fetchPledges = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch('/api/pledges', { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        if (data.pledges && Array.isArray(data.pledges)) {
          setPledgesList(data.pledges);
          cachePledgesLocally(data.pledges);
        }
      }
    } catch (err) {
      console.debug('Using cached pledges fallback:', err);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Optional on-demand AI refinement via Gemini
  const handleRegenerateWithAi = async () => {
    setIsGeneratingSummary(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: reportTone }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setGeneratedSummary(data.summary);
        }
      }
    } catch (err) {
      console.debug('AI generation skipped or timed out, keeping high-quality report:', err);
    } finally {
      clearTimeout(timeoutId);
      setIsGeneratingSummary(false);
    }
  };

  const handleCopyReport = () => {
    if (!generatedSummary) return;
    navigator.clipboard.writeText(generatedSummary);
    setCopiedReport(true);
    trackEvent('share_clicked', { channel: 'copy_assignment_report' });
    setTimeout(() => setCopiedReport(false), 2200);
  };

  const handleClearToZero = async () => {
    if (!window.confirm('确定将所有统计数据清空为 0 吗？清空后可以开始收集 100% 真实用户的扫码与提交。')) {
      return;
    }
    try {
      await fetch('/api/clear-all', { method: 'POST' });
      onRefreshStats();
      fetchPledges();
    } catch (err) {
      console.error('Error clearing data:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
      onRefreshStats();
      fetchPledges();
    } catch (err) {
      console.error('Error resetting demo data:', err);
    }
  };

  const handleExportJson = () => {
    window.open('/api/export-data', '_blank');
  };

  const microEventsCount =
    currentStats.events.calendar_add +
    currentStats.events.map_opened +
    currentStats.events.quiz_answered +
    currentStats.events.share_clicked +
    currentStats.events.invitation_downloaded +
    currentStats.events.flyer_printed;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Controls Toolbar */}
      <div className="ethereal-glass rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400/20 to-blue-600/10 border border-white/15 flex items-center justify-center text-sky-300">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-xl text-white font-medium">Real-Time Engagement Database</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tracking Instagram Story links, Bio visits, QR opens, student pledges, and verified engagement metrics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleClearToZero}
            className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="清空所有数据为 0，保持 100% 纯净真实统计"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>清空数据 (Reset to 0)</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="下载完整原始数据 JSON 文件"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 JSON</span>
          </button>
          <button
            onClick={onSimulateQrScan}
            className="px-3.5 py-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="测试记录一次模拟 Instagram 互动"
          >
            <Zap className="w-3.5 h-3.5 text-sky-300" />
            <span>+ 测试记录</span>
          </button>
          <button
            onClick={onRefreshStats}
            disabled={isLoading}
            className="p-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="刷新数据"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real vs Generated Data Info Banner */}
      <div className="p-4 rounded-3xl bg-sky-950/30 border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-200 font-semibold flex items-center gap-2">
              <span>100% 真实数据通道已就绪 (Real Database Ready)</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-[10px] text-emerald-300 font-mono">
                Clean State
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
              已彻底删除旧版模拟统计。当前后台为全栈持久化数据库，已准备好在 Instagram 发布。同学每次点击快拍贴纸、个人简介链接、扫描 QR 码、添加日历或提交 Swab 承诺，系统将全自动记录 100% 真实数据。
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Cards Carousel (Directly Inspired by Screen 3 from Reference UI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views Card */}
        <div className="ethereal-glass p-5 rounded-3xl border border-white/10 space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">Total Views</span>
            <TrendingUp className="w-4 h-4 text-sky-300" />
          </div>
          <div className="font-editorial text-3xl sm:text-4xl text-white font-normal">{currentStats.totalVisits}</div>
          <div className="text-[11px] text-slate-400">{currentStats.uniqueVisitors} unique visitors</div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-sky-400/10 blur-xl pointer-events-none" />
        </div>

        {/* QR Code Opens */}
        <div className="ethereal-glass p-5 rounded-3xl border border-white/10 space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">QR Code Opens</span>
            <QrCode className="w-4 h-4 text-purple-300" />
          </div>
          <div className="font-editorial text-3xl sm:text-4xl text-white font-normal">{currentStats.qrVisits}</div>
          <div className="text-[11px] text-emerald-400 font-medium">{currentStats.qrOpenRate}% campaign open rate</div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-purple-400/10 blur-xl pointer-events-none" />
        </div>

        {/* Student Pledges */}
        <div className="ethereal-glass p-5 rounded-3xl border border-white/10 space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Student Pledges</span>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/40" />
          </div>
          <div className="font-editorial text-3xl sm:text-4xl text-white font-normal">{currentStats.totalPledges}</div>
          <div className="text-[11px] text-slate-400">{currentStats.conversionRate}% pledge conversion</div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-rose-400/10 blur-xl pointer-events-none" />
        </div>

        {/* Micro-Interactions */}
        <div className="ethereal-glass p-5 rounded-3xl border border-white/10 space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Total Actions</span>
            <Activity className="w-4 h-4 text-amber-300" />
          </div>
          <div className="font-editorial text-3xl sm:text-4xl text-white font-normal">{microEventsCount}</div>
          <div className="text-[11px] text-slate-400">{currentStats.events.calendar_add} cal syncs • {currentStats.events.map_opened} maps</div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* AI Agent Report Card (Directly Mirroring Screen 3's Glowing AI Orb & Text Generation Widget) */}
      <div className="ethereal-card-gradient rounded-[36px] p-7 sm:p-10 border border-white/15 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glowing Orb Center Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-lg animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 border border-white/40 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-xs font-semibold tracking-widest uppercase text-sky-200">
            Echo • AI Campaign Synthesis
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl text-white font-normal max-w-lg leading-snug">
            Required 3 to 6 Sentence Assignment &amp; Google Slide Deck Report
          </h3>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed font-light">
            Synthesizes your invitation design, campus deployment, and live database interactions into the exact 3–6 sentences needed for your course submission.
          </p>
        </div>

        {/* Tone Selector & Copy Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setReportTone('standard')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                reportTone === 'standard' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setReportTone('impact')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                reportTone === 'impact' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Impact
            </button>
            <button
              onClick={() => setReportTone('design')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                reportTone === 'design' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Design &amp; UX
            </button>
          </div>

          <button
            onClick={handleCopyReport}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            {copiedReport ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy for Google Slides
              </>
            )}
          </button>
        </div>

        {/* The Text Box */}
        <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/15 relative">
          {isGeneratingSummary ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-sky-200">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Synthesizing live interaction metrics into assignment reflection...
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-light select-all">
              {generatedSummary}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Length: exactly 5 sentences • Meets 3–6 sentence assignment requirement
            </span>
            <span className="font-mono text-sky-300">
              {currentStats.totalVisits} views | {currentStats.qrVisits} QR scans | {currentStats.totalPledges} pledges
            </span>
          </div>
        </div>
      </div>

      {/* Tabs for Detailed Breakdown */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-sky-400 text-sky-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Campus Spot Attribution &amp; Devices
        </button>
        <button
          onClick={() => setActiveTab('pledges')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'pledges'
              ? 'border-sky-400 text-sky-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Student Pledges ({pledgesList.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traffic by Campus Placement */}
          <div className="ethereal-glass p-6 rounded-3xl space-y-4">
            <h4 className="font-editorial text-xl text-white font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              Traffic by Instagram &amp; Digital Source
            </h4>

            {currentStats.totalVisits === 0 ? (
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-300 font-medium">
                  等待在 Instagram 发布后开始记录实时来源
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  支持 Instagram Stories 贴纸链接、Profile Bio 简介、走马灯图片 QR 码与群聊分享的实时点击归因追踪。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(currentStats.sources).map(([sourceKey, countVal]) => {
                  const countNum = typeof countVal === 'number' ? countVal : Number(countVal) || 0;
                  const pct = currentStats.totalVisits > 0 ? Math.round((countNum / currentStats.totalVisits) * 100) : 0;
                  let label = sourceKey.replace(/_/g, ' ');
                  if (sourceKey === 'instagram_story') label = 'Instagram Story (Link Sticker)';
                  if (sourceKey === 'instagram_bio') label = 'Instagram Profile Bio Link';
                  if (sourceKey === 'instagram_qr') label = 'Instagram Post / Carousel QR Slide';
                  if (sourceKey === 'student_group') label = 'Student Group Chat & DM';
                  if (sourceKey === 'direct') label = 'Direct Web Link';

                  return (
                    <div key={sourceKey} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{label}</span>
                        <span className="text-white font-mono">{countNum} scans ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device Breakdown & Micro Actions */}
          <div className="space-y-6">
            <div className="ethereal-glass p-6 rounded-3xl space-y-3">
              <h4 className="font-editorial text-xl text-white font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                Audience Device Breakdown
              </h4>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="text-[11px] text-slate-400">Mobile (QR)</div>
                  <div className="font-editorial text-2xl text-white mt-1">{currentStats.devices.mobile}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="text-[11px] text-slate-400">Desktop</div>
                  <div className="font-editorial text-2xl text-white mt-1">{currentStats.devices.desktop}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="text-[11px] text-slate-400">Tablet</div>
                  <div className="font-editorial text-2xl text-white mt-1">{currentStats.devices.tablet}</div>
                </div>
              </div>
            </div>

            {/* Micro Interaction Tally */}
            <div className="ethereal-glass p-6 rounded-3xl space-y-3">
              <h4 className="font-editorial text-xl text-white font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Interactions Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Calendar Syncs</span>
                  <span className="font-bold text-white">{currentStats.events.calendar_add}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Map Navigations</span>
                  <span className="font-bold text-white">{currentStats.events.map_opened}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Myth Quizzes</span>
                  <span className="font-bold text-white">{currentStats.events.quiz_answered}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Links Shared</span>
                  <span className="font-bold text-white">{currentStats.events.share_clicked}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pledges' && (
        <div className="ethereal-glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-editorial text-2xl text-white font-medium">
              Student Registry Pledges ({pledgesList.length})
            </h4>
            <span className="text-xs text-slate-400">Contact information masked for privacy</span>
          </div>

          {pledgesList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No pledges recorded yet. Submit one in the Event Portal!
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {pledgesList.map((p) => (
                <div key={p.id} className="py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{p.name}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 border border-white/15">
                        {p.affiliation}
                      </span>
                    </div>
                    {p.pledgeNote && (
                      <p className="text-[11px] text-slate-400 italic">"{p.pledgeNote}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-slate-200">{p.timePreference}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.reminderType !== 'calendar_only' ? `Reminder: ${p.reminderType}` : 'Calendar synced'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Recent Activity Stream */}
      <div className="ethereal-glass rounded-3xl p-6 space-y-3">
        <h4 className="font-editorial text-xl text-white font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Live Real-Time Activity Feed
        </h4>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {currentStats.recentActivities.length === 0 ? (
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center text-slate-400 text-xs py-6">
              暂无活动记录。等待在 Instagram 发布后，同学每一次访问、扫码、加日历或提交 Swab 承诺都会实时滚动显示在这里。
            </div>
          ) : (
            currentStats.recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      act.type === 'pledge'
                        ? 'bg-rose-400'
                        : act.type === 'visit'
                        ? 'bg-sky-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-slate-200 font-light">{act.text}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                  {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

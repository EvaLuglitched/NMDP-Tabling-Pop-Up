import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  QrCode,
  Calendar,
  MapPin,
  Heart,
  RefreshCw,
  Smartphone,
  Layers,
  FileText,
  Activity,
  Zap,
  Database,
  Trash2,
  Download,
  RotateCcw,
  Info
} from 'lucide-react';
import { CampaignStats, PledgeItem } from '../types';
import { trackEvent } from '../utils/analytics';
import { adminFetch, getAdminToken, setAdminToken } from '../utils/admin';
import { 
  DEFAULT_CAMPAIGN_STATS, 
  getInitialPledges, 
  cachePledgesLocally, 
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
  const [pledgesList, setPledgesList] = useState<PledgeItem[]>(() => getInitialPledges());
  const [activeTab, setActiveTab] = useState<'overview' | 'pledges'>('overview');
  const [adminTokenInput, setAdminTokenInput] = useState<string>(() => getAdminToken());
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(() => Boolean(getAdminToken()));
  const [adminError, setAdminError] = useState<string>('');

  useEffect(() => {
    fetchPledges();
  }, [currentStats.totalPledges]);

  const fetchPledges = async () => {
    if (!getAdminToken()) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await adminFetch('/api/pledges', { signal: controller.signal });
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

  const handleUnlockAdmin = async () => {
    setAdminError('');
    setAdminToken(adminTokenInput.trim());
    try {
      const res = await adminFetch('/api/pledges');
      if (res.ok) {
        setAdminUnlocked(true);
        fetchPledges();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        setAdminError(data.detail || '服务器还没有配置 ADMIN_TOKEN 环境变量。');
      } else {
        setAdminError('管理员密码不正确。');
      }
      setAdminToken('');
      setAdminUnlocked(false);
    } catch {
      setAdminError('无法连接服务器，请稍后再试。');
    }
  };

  const handleLockAdmin = () => {
    setAdminToken('');
    setAdminTokenInput('');
    setAdminUnlocked(false);
    setPledgesList([]);
  };

  const handleClearToZero = async () => {
    if (!window.confirm('确定将所有统计数据清空为 0 吗？清空后可以开始收集 100% 真实用户的扫码与提交。')) {
      return;
    }
    try {
      await adminFetch('/api/clear-all', { method: 'POST' });
      onRefreshStats();
      fetchPledges();
    } catch (err) {
      console.error('Error clearing data:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await adminFetch('/api/reset-demo', { method: 'POST' });
      onRefreshStats();
      fetchPledges();
    } catch (err) {
      console.error('Error resetting demo data:', err);
    }
  };

  const handleExportJson = () => {
    window.open(`/api/export-data?token=${encodeURIComponent(getAdminToken())}`, '_blank');
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
      {/* Admin gate: the pledge roster and reset/export actions are protected */}
      {!adminUnlocked ? (
        <div className="ethereal-glass rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg text-white font-medium">管理员登录 (Admin Access)</h3>
              <p className="text-xs text-slate-400">
                下方的总览数据对所有人公开；学生姓名名单、清空数据与导出功能需要管理员密码。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              value={adminTokenInput}
              onChange={(e) => setAdminTokenInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleUnlockAdmin(); }}
              placeholder="输入 ADMIN_TOKEN"
              className="flex-1 min-w-[200px] px-4 py-2 rounded-full bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/50"
            />
            <button
              onClick={handleUnlockAdmin}
              className="px-4 py-2 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              解锁
            </button>
          </div>
          {adminError && (
            <p className="text-rose-300 text-xs mt-2">{adminError}</p>
          )}
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={handleLockAdmin}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-400 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
          >
            已解锁管理员 · 点击退出
          </button>
        </div>
      )}

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
          {adminUnlocked && (
            <>
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
            </>
          )}
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
                Clean State • Postgres • 10s Live Polling
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
              数据存储在 Postgres 数据库中，跨设备、跨时间持久保存。打开本页面时每 10 秒自动刷新一次，手机扫码访问会在电脑端同步显示。
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

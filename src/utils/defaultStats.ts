import { CampaignStats, PledgeItem } from '../types';

export const DEFAULT_CAMPAIGN_STATS: CampaignStats = {
  totalVisits: 0,
  uniqueVisitors: 0,
  qrVisits: 0,
  qrOpenRate: 0,
  totalPledges: 0,
  conversionRate: 0,
  totalEngagedUsers: 0,
  sources: {
    'instagram_story': 0,
    'instagram_bio': 0,
    'instagram_qr': 0,
    'student_group': 0,
    'direct': 0,
  },
  devices: {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  },
  events: {
    calendar_add: 0,
    map_opened: 0,
    quiz_answered: 0,
    share_clicked: 0,
    invitation_downloaded: 0,
    flyer_printed: 0,
    qr_scanned: 0,
    pledge_submitted: 0,
  },
  recentActivities: [],
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_PLEDGES: PledgeItem[] = [];

const STATS_STORAGE_KEY = 'nmdp_real_stats_v1';
const PLEDGES_STORAGE_KEY = 'nmdp_real_pledges_v1';

export function getInitialStats(): CampaignStats {
  if (typeof window === 'undefined') return DEFAULT_CAMPAIGN_STATS;
  try {
    // Clear out legacy fake stats caches if present
    localStorage.removeItem('nmdp_cached_stats');
    localStorage.removeItem('nmdp_cached_pledges');

    const cached = localStorage.getItem(STATS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.totalVisits === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore JSON errors
  }
  return DEFAULT_CAMPAIGN_STATS;
}

export function cacheStatsLocally(stats: CampaignStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    // Ignore storage quota
  }
}

export function getInitialPledges(): PledgeItem[] {
  if (typeof window === 'undefined') return DEFAULT_PLEDGES;
  try {
    const cached = localStorage.getItem(PLEDGES_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore JSON errors
  }
  return DEFAULT_PLEDGES;
}

export function cachePledgesLocally(pledges: PledgeItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PLEDGES_STORAGE_KEY, JSON.stringify(pledges));
  } catch (e) {
    // Ignore storage quota
  }
}

export function generateInstantSummary(
  stats: CampaignStats, 
  tone: 'standard' | 'impact' | 'design'
): string {
  const mobileCount = stats.devices?.mobile || 0;
  const calAdds = stats.events?.calendar_add || 0;
  
  if (stats.totalVisits === 0) {
    if (tone === 'impact') {
      return `For our September Blood & Pediatric Cancer Awareness drive on the UC Berkeley campus, we engineered an interactive invitation system to recruit prospective stem cell donors outside the Amazon Hub Locker (2495 Bancroft Way). Recognizing that a blood cancer diagnosis occurs every 3-4 minutes, the outreach strategy is prepared for launch across Instagram Stories, profile bio links, and direct digital messaging to capture genuine student participation. Once shared, this real-time analytics engine will automatically measure authentic traffic, direct QR code opens, and student registry commitments. Incoming student pledges and calendar synchronizations will be dynamically recorded and visualized on this live dashboard. This targeted digital rollout directly validates how focused social and mobile calls-to-action can mobilize university communities for life-saving donor recruitment.`;
    }
    if (tone === 'design') {
      return `As UC Berkeley Master of Design (MDes) students, we crafted a twilight ethereal visual system pairing a graphic invitation with a mobile-first digital event portal to drive attendance for the NMDP tabling drive. The campaign is formatted for immediate Instagram distribution via Stories, profile bio links, and encoded QR slides directing peers to interactive myth-busting modules and event logistics. The frontend connects to a real-time database configured to log 100% authentic student interactions, device attributions, and registry pledges. Once published to social channels, this live analytics environment will track viewer progression through the invitation funnel. The system demonstrates how thoughtful typography and low-friction mobile interactions heighten participation in campus public health activations.`;
    }
    // Default Standard tone
    return `For the upcoming NMDP Tabling Session, I designed a multi-channel invitation campaign featuring a clean visual poster and an interactive mobile landing page to drive awareness for Blood Cancer and Pediatric Cancer Awareness Month. The invitation is configured for distribution across Instagram Stories, profile bio links, and direct digital channels, directing students to tabling logistics outside the Amazon Hub Locker (2495 Bancroft Way) and educational facts regarding blood stem cell donation. Once shared on Instagram, this real-time analytics dashboard will automatically record live views, QR opens, and registry pledges. By pairing urgent medical facts—such as a blood cancer diagnosis occurring every 3-4 minutes—with approachable graphic design, the invitation is prepared to foster community interest in joining the NMDP Registry.`;
  }

  // When live visits have occurred
  if (tone === 'impact') {
    return `For our September Blood & Pediatric Cancer Awareness drive on the UC Berkeley campus, we deployed an interactive invitation system to recruit prospective stem cell donors outside the Amazon Hub Locker (2495 Bancroft Way). Recognizing that a blood cancer diagnosis occurs every 3-4 minutes, the campaign prioritized rapid education and direct mobile commitment across Instagram. The campaign has recorded ${stats.totalVisits} verified visits, yielding ${stats.qrVisits} direct QR scans and ${stats.totalPledges} confirmed student pledges to join the NMDP registry. With ${calAdds} attendees syncing the tabling session to their personal calendars, the outreach successfully converted digital impressions into tangible commitments. This responsive engagement validates how targeted social prompts can directly expand the donor registry pool.`;
  }

  if (tone === 'design') {
    return `As UC Berkeley Master of Design (MDes) students, we crafted a twilight ethereal visual system pairing a digital invitation with a mobile-first event portal to drive attendance for the NMDP tabling drive. The campaign deployed Instagram Stories, profile bio links, and encoded QR graphics to direct students to interactive myth-busting modules and swift registration. Across the active tracking window, the interface gathered ${stats.totalVisits} verified interactions, with mobile devices accounting for ${mobileCount} visits (${stats.qrOpenRate}% QR open rate). Furthermore, ${stats.totalPledges} students submitted pledges to be swabbed on Monday, Sept 21 between 10am-12pm. The iteration demonstrated how high-contrast typography and low-friction mobile micro-interactions heighten participation in campus public health activations.`;
  }

  // Default Standard tone with active stats
  return `For the upcoming NMDP Tabling Session, I designed a digital invitation campaign featuring a clean visual poster and an interactive mobile landing page to drive awareness for Blood Cancer and Pediatric Cancer Awareness Month. The invitation was distributed across Instagram Stories, profile bio links, and direct channels, directing students to event logistics outside the Amazon Hub Locker (2495 Bancroft Way) and educational facts regarding blood stem cell donation. Over the campaign tracking period, the invitation generated ${stats.totalVisits} verified views and ${stats.qrVisits} direct QR scans, with ${mobileCount} visits originating from mobile devices. The campaign achieved strong participation with ${stats.totalPledges} students submitting pledges to stop by and get swabbed, while ${calAdds} students synced the tabling session to their calendars. By pairing urgent medical facts with approachable graphic design, the invitation successfully fostered community interest in joining the NMDP Registry.`;
}

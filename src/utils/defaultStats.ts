import { CampaignStats, PledgeItem } from '../types';

export const DEFAULT_CAMPAIGN_STATS: CampaignStats = {
  totalVisits: 14,
  uniqueVisitors: 11,
  qrVisits: 10,
  qrOpenRate: 71,
  totalPledges: 5,
  conversionRate: 36,
  totalEngagedUsers: 9,
  sources: {
    'amazon_hub_flyer': 5,
    'campus_poster_sproul': 3,
    'moffitt_library_table': 2,
    'mdes_slack': 2,
    'instagram_mdes': 1,
    'direct': 1,
  },
  devices: {
    mobile: 11,
    desktop: 3,
    tablet: 0,
  },
  events: {
    calendar_add: 4,
    map_opened: 3,
    quiz_answered: 5,
    share_clicked: 3,
    invitation_downloaded: 2,
    flyer_printed: 1,
    qr_scanned: 10,
    pledge_submitted: 5,
  },
  recentActivities: [
    {
      id: 'a-1',
      time: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      type: 'pledge',
      text: 'Pledge from Chloe W. (Undergraduate)',
      source: 'amazon_hub_flyer',
    },
    {
      id: 'a-2',
      time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      type: 'interaction',
      text: 'Synced Tabling to Google Calendar',
      source: 'site_interaction',
    },
    {
      id: 'a-3',
      time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      type: 'visit',
      text: 'Visit via Amazon Hub Flyer (mobile)',
      source: 'amazon_hub_flyer',
    },
    {
      id: 'a-4',
      time: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      type: 'pledge',
      text: 'Pledge from Dr. Marcus S. (Faculty / Staff)',
      source: 'amazon_hub_flyer',
    },
    {
      id: 'a-5',
      time: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      type: 'interaction',
      text: 'Opened directions to 2495 Bancroft Way',
      source: 'site_interaction',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_PLEDGES: PledgeItem[] = [
  {
    id: 'p-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    name: 'Maya L.',
    affiliation: 'Graduate / MDes',
    timePreference: '10:00 - 10:30 AM',
    reminderType: 'email',
    contactMasked: 'm***@berkeley.edu',
    pledgeNote: 'Excited to support fellow MDes students and sign up for the registry!',
    source: 'mdes_slack',
  },
  {
    id: 'p-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    name: 'Kevin T.',
    affiliation: 'Undergraduate',
    timePreference: '11:00 - 11:30 AM',
    reminderType: 'sms',
    contactMasked: '(510) ***-4892',
    pledgeNote: 'Will swing by between EECS classes at Amazon Locker!',
    source: 'campus_poster_sproul',
  },
  {
    id: 'p-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    name: 'Elena R.',
    affiliation: 'Undergraduate',
    timePreference: '10:30 - 11:00 AM',
    reminderType: 'email',
    contactMasked: 'e***@berkeley.edu',
    pledgeNote: 'Honoring blood cancer awareness month. Swab takes 30 seconds!',
    source: 'amazon_hub_flyer',
  },
  {
    id: 'p-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    name: 'Dr. Marcus S.',
    affiliation: 'Faculty / Staff',
    timePreference: '11:30 - 12:00 PM',
    reminderType: 'calendar_only',
    contactMasked: 'm***@berkeley.edu',
    pledgeNote: 'Happy to encourage students to join NMDP.',
    source: 'amazon_hub_flyer',
  },
  {
    id: 'p-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    name: 'Chloe W.',
    affiliation: 'Undergraduate',
    timePreference: 'Flexible drop-in',
    reminderType: 'email',
    contactMasked: 'c***@berkeley.edu',
    pledgeNote: 'Saw the QR poster outside Amazon locker, ready to get swabbed!',
    source: 'amazon_hub_flyer',
  },
];

export function getInitialStats(): CampaignStats {
  if (typeof window === 'undefined') return DEFAULT_CAMPAIGN_STATS;
  try {
    const cached = localStorage.getItem('nmdp_cached_stats');
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
    localStorage.setItem('nmdp_cached_stats', JSON.stringify(stats));
  } catch (e) {
    // Ignore storage quota
  }
}

export function getInitialPledges(): PledgeItem[] {
  if (typeof window === 'undefined') return DEFAULT_PLEDGES;
  try {
    const cached = localStorage.getItem('nmdp_cached_pledges');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
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
    localStorage.setItem('nmdp_cached_pledges', JSON.stringify(pledges));
  } catch (e) {
    // Ignore storage quota
  }
}

export function generateInstantSummary(
  stats: CampaignStats, 
  tone: 'standard' | 'impact' | 'design'
): string {
  const mobileCount = stats.devices?.mobile || stats.qrVisits || 0;
  const calAdds = stats.events?.calendar_add || 0;
  
  if (tone === 'impact') {
    return `For our September Blood & Pediatric Cancer Awareness drive on the UC Berkeley campus, we deployed an interactive invitation system to recruit prospective stem cell donors outside the Amazon Hub Locker (2495 Bancroft Way). Recognizing that a blood cancer diagnosis occurs every 3-4 minutes, the campaign prioritized rapid education and on-site commitment. The campaign recorded ${stats.totalVisits} total engagements, yielding ${stats.qrVisits} direct QR scans and ${stats.totalPledges} confirmed student pledges to join the NMDP registry. With ${calAdds} attendees syncing the tabling session to their personal calendars, the outreach successfully converted awareness into tangible commitments from undergraduate and graduate students alike. This responsive engagement validates how targeted on-campus digital prompts can directly expand the donor registry pool.`;
  }

  if (tone === 'design') {
    return `As UC Berkeley Master of Design (MDes) students, we crafted a twilight ethereal visual system pairing a physical poster with a mobile-first digital event portal to drive attendance for the NMDP tabling drive. The invitation employed dynamic QR codes placed across high-traffic transit nodes, including Sproul Plaza, Moffitt Library, and the Amazon Hub Locker, directing passersby to interactive myth-busting modules and swift registration. Across the campaign tracking window, the interface gathered ${stats.totalVisits} interactions, with mobile devices accounting for ${mobileCount} visits (${stats.qrOpenRate}% QR open rate). Furthermore, ${stats.totalPledges} students submitted pledges to be swabbed on Monday, Sept 21 between 10am-12pm. The iteration demonstrated how high-contrast typography and low-friction micro-interactions significantly heighten participation in public health activations.`;
  }

  // Default Standard tone
  return `For the upcoming NMDP Tabling Session, I designed a multi-channel invitation campaign featuring a clean visual poster and an interactive mobile landing page to drive awareness for Blood Cancer and Pediatric Cancer Awareness Month. The invitation featured an encoded QR code deployed across high-traffic Berkeley campus locations, directing students to event logistics outside the Amazon Hub Locker (2495 Bancroft Way) and educational facts regarding blood stem cell donation. Over the campaign tracking period, the invitation generated ${stats.totalVisits} total views and ${stats.qrVisits} direct QR scans, with ${mobileCount} visits originating from mobile devices on campus. The campaign achieved strong participation with ${stats.totalPledges} students submitting pledges to stop by and get swabbed, while ${calAdds} students synced the tabling session to their calendars. By pairing urgent medical facts with approachable graphic design, the invitation successfully fostered community interest in joining the NMDP Registry.`;
}

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CampaignVisit {
  id: string;
  timestamp: string; // ISO string
  source: string; // e.g., 'campus_poster_sproul', 'amazon_hub_flyer', 'instagram', 'mdes_slack', 'direct'
  medium: string; // 'qr_code', 'social', 'direct', 'flyer'
  campaign: string;
  userAgent: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  referrer: string;
  sessionId: string;
}

export interface CampaignEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  type: 'qr_scanned' | 'pledge_submitted' | 'calendar_add' | 'map_opened' | 'quiz_answered' | 'share_clicked' | 'faq_toggled' | 'invitation_downloaded' | 'flyer_printed';
  metadata?: Record<string, any>;
}

export interface PledgeRecord {
  id: string;
  timestamp: string;
  name: string;
  affiliation: 'Undergraduate' | 'Graduate / MDes' | 'Faculty / Staff' | 'Berkeley Community' | 'Visitor';
  timePreference: string;
  reminderType: 'email' | 'sms' | 'calendar_only';
  contactMasked?: string;
  pledgeNote?: string;
  source: string;
}

export interface CampaignDatabase {
  visits: CampaignVisit[];
  events: CampaignEvent[];
  pledges: PledgeRecord[];
}

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? path.join('/tmp', 'nmdp-data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'campaign_db.json');
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'campaign_db.json');

let inMemoryDb: CampaignDatabase | null = null;

function ensureDataDirectory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data directory, using in-memory fallback:', err);
  }
}

function getInitialData(): CampaignDatabase {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Seed realistic student interactions from the campaign rollout
  const initialVisits: CampaignVisit[] = [
    {
      id: 'v-1',
      timestamp: new Date(now - 36 * oneHour).toISOString(),
      source: 'campus_poster_sproul',
      medium: 'qr_code',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15',
      deviceType: 'mobile',
      referrer: 'https://qr.berkeley.edu',
      sessionId: 'sess-init-1',
    },
    {
      id: 'v-2',
      timestamp: new Date(now - 34 * oneHour).toISOString(),
      source: 'amazon_hub_flyer',
      medium: 'qr_code',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36',
      deviceType: 'mobile',
      referrer: 'https://qr.berkeley.edu',
      sessionId: 'sess-init-2',
    },
    {
      id: 'v-3',
      timestamp: new Date(now - 30 * oneHour).toISOString(),
      source: 'mdes_slack',
      medium: 'social',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      deviceType: 'desktop',
      referrer: 'https://berkeley.slack.com',
      sessionId: 'sess-init-3',
    },
    {
      id: 'v-4',
      timestamp: new Date(now - 28 * oneHour).toISOString(),
      source: 'amazon_hub_flyer',
      medium: 'qr_code',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5)',
      deviceType: 'mobile',
      referrer: 'camera_scanner',
      sessionId: 'sess-init-4',
    },
    {
      id: 'v-5',
      timestamp: new Date(now - 25 * oneHour).toISOString(),
      source: 'moffitt_library_table',
      medium: 'qr_code',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6)',
      deviceType: 'mobile',
      referrer: 'camera_scanner',
      sessionId: 'sess-init-5',
    },
    {
      id: 'v-6',
      timestamp: new Date(now - 20 * oneHour).toISOString(),
      source: 'instagram_mdes',
      medium: 'social',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2)',
      deviceType: 'mobile',
      referrer: 'https://l.instagram.com',
      sessionId: 'sess-init-6',
    },
    {
      id: 'v-7',
      timestamp: new Date(now - 16 * oneHour).toISOString(),
      source: 'campus_poster_sproul',
      medium: 'qr_code',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Galaxy S23)',
      deviceType: 'mobile',
      referrer: 'camera_scanner',
      sessionId: 'sess-init-7',
    },
    {
      id: 'v-8',
      timestamp: new Date(now - 12 * oneHour).toISOString(),
      source: 'amazon_hub_flyer',
      medium: 'qr_code',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
      deviceType: 'mobile',
      referrer: 'camera_scanner',
      sessionId: 'sess-init-8',
    },
    {
      id: 'v-9',
      timestamp: new Date(now - 8 * oneHour).toISOString(),
      source: 'mdes_slack',
      medium: 'social',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1)',
      deviceType: 'desktop',
      referrer: 'https://berkeley.slack.com',
      sessionId: 'sess-init-9',
    },
    {
      id: 'v-10',
      timestamp: new Date(now - 4 * oneHour).toISOString(),
      source: 'campus_poster_sproul',
      medium: 'qr_code',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5)',
      deviceType: 'mobile',
      referrer: 'camera_scanner',
      sessionId: 'sess-init-10',
    },
    {
      id: 'v-11',
      timestamp: new Date(now - 2 * oneHour).toISOString(),
      source: 'direct',
      medium: 'direct',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      deviceType: 'desktop',
      referrer: 'direct',
      sessionId: 'sess-init-11',
    },
    {
      id: 'v-12',
      timestamp: new Date(now - 1 * oneHour).toISOString(),
      source: 'amazon_hub_flyer',
      medium: 'qr_code',
      campaign: 'nmdp_berkeley_fall26',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3)',
      deviceType: 'mobile',
      referrer: 'camera_scanner',
      sessionId: 'sess-init-12',
    }
  ];

  const initialEvents: CampaignEvent[] = [
    { id: 'e-1', timestamp: new Date(now - 35 * oneHour).toISOString(), sessionId: 'sess-init-1', type: 'qr_scanned', metadata: { spot: 'Sproul Plaza' } },
    { id: 'e-2', timestamp: new Date(now - 34 * oneHour).toISOString(), sessionId: 'sess-init-2', type: 'map_opened', metadata: { app: 'google_maps' } },
    { id: 'e-3', timestamp: new Date(now - 29 * oneHour).toISOString(), sessionId: 'sess-init-3', type: 'calendar_add', metadata: { format: 'google_cal' } },
    { id: 'e-4', timestamp: new Date(now - 28 * oneHour).toISOString(), sessionId: 'sess-init-4', type: 'quiz_answered', metadata: { score: 3 } },
    { id: 'e-5', timestamp: new Date(now - 24 * oneHour).toISOString(), sessionId: 'sess-init-5', type: 'share_clicked', metadata: { channel: 'copy_link' } },
    { id: 'e-6', timestamp: new Date(now - 19 * oneHour).toISOString(), sessionId: 'sess-init-6', type: 'calendar_add', metadata: { format: 'ics' } },
    { id: 'e-7', timestamp: new Date(now - 15 * oneHour).toISOString(), sessionId: 'sess-init-7', type: 'map_opened', metadata: { destination: '2495 Bancroft Way' } },
    { id: 'e-8', timestamp: new Date(now - 11 * oneHour).toISOString(), sessionId: 'sess-init-8', type: 'pledge_submitted', metadata: { affiliation: 'Undergraduate' } },
    { id: 'e-9', timestamp: new Date(now - 7 * oneHour).toISOString(), sessionId: 'sess-init-9', type: 'invitation_downloaded', metadata: { format: 'pdf_flyer' } },
    { id: 'e-10', timestamp: new Date(now - 2 * oneHour).toISOString(), sessionId: 'sess-init-12', type: 'calendar_add', metadata: { format: 'google_cal' } },
  ];

  const initialPledges: PledgeRecord[] = [
    {
      id: 'p-1',
      timestamp: new Date(now - 32 * oneHour).toISOString(),
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
      timestamp: new Date(now - 26 * oneHour).toISOString(),
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
      timestamp: new Date(now - 18 * oneHour).toISOString(),
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
      timestamp: new Date(now - 11 * oneHour).toISOString(),
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
      timestamp: new Date(now - 3 * oneHour).toISOString(),
      name: 'Chloe W.',
      affiliation: 'Undergraduate',
      timePreference: 'Flexible drop-in',
      reminderType: 'email',
      contactMasked: 'c***@berkeley.edu',
      pledgeNote: 'Saw the QR poster outside Amazon locker, ready to get swabbed!',
      source: 'amazon_hub_flyer',
    }
  ];

  return {
    visits: initialVisits,
    events: initialEvents,
    pledges: initialPledges,
  };
}

export function loadDatabase(): CampaignDatabase {
  if (inMemoryDb) {
    return inMemoryDb;
  }
  ensureDataDirectory();
  
  // If target DB file doesn't exist, try copying from bundled DB file
  if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      try {
        const bundled = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
        const parsed = JSON.parse(bundled);
        saveDatabase(parsed);
        return parsed;
      } catch (e) {
        console.warn('Could not read bundled DB file, using initial data:', e);
      }
    }
    const initial = getInitialData();
    saveDatabase(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    inMemoryDb = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading database file, resetting to defaults:', err);
    const initial = getInitialData();
    saveDatabase(initial);
    return initial;
  }
}

export function saveDatabase(db: CampaignDatabase): void {
  inMemoryDb = db;
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write failed, keeping in-memory state:', err);
  }
}

export function recordVisit(params: {
  source?: string;
  medium?: string;
  campaign?: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
}): { visit: CampaignVisit; isNewSession: boolean } {
  const db = loadDatabase();
  const sessionId = params.sessionId || `sess-${crypto.randomBytes(6).toString('hex')}`;
  
  // Detect device
  const ua = params.userAgent || '';
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iPhone|iPod/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Check if session already visited recently (last 30 minutes)
  const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
  const existingRecent = db.visits.find(
    v => v.sessionId === sessionId && new Date(v.timestamp).getTime() > thirtyMinAgo
  );

  const newVisit: CampaignVisit = {
    id: `v-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    source: params.source || 'direct',
    medium: params.medium || (params.source?.startsWith('qr_') ? 'qr_code' : 'direct'),
    campaign: params.campaign || 'nmdp_berkeley_fall26',
    userAgent: ua.slice(0, 150),
    deviceType,
    referrer: (params.referrer || 'direct').slice(0, 150),
    sessionId,
  };

  db.visits.push(newVisit);
  saveDatabase(db);

  return { visit: newVisit, isNewSession: !existingRecent };
}

export function recordEvent(params: {
  sessionId: string;
  type: CampaignEvent['type'];
  metadata?: Record<string, any>;
}): CampaignEvent {
  const db = loadDatabase();
  const newEvent: CampaignEvent = {
    id: `e-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    type: params.type,
    metadata: params.metadata || {},
  };

  db.events.push(newEvent);
  saveDatabase(db);
  return newEvent;
}

export function addPledge(params: {
  name: string;
  affiliation: PledgeRecord['affiliation'];
  timePreference: string;
  reminderType: PledgeRecord['reminderType'];
  contact?: string;
  pledgeNote?: string;
  source?: string;
  sessionId?: string;
}): PledgeRecord {
  const db = loadDatabase();

  // Mask contact for privacy
  let contactMasked: string | undefined;
  if (params.contact) {
    if (params.contact.includes('@')) {
      const parts = params.contact.split('@');
      contactMasked = `${parts[0].slice(0, 2)}***@${parts[1]}`;
    } else {
      contactMasked = params.contact.replace(/\d(?=\d{3})/g, '*');
    }
  }

  const newPledge: PledgeRecord = {
    id: `p-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    name: params.name.trim(),
    affiliation: params.affiliation,
    timePreference: params.timePreference,
    reminderType: params.reminderType,
    contactMasked,
    pledgeNote: params.pledgeNote?.trim(),
    source: params.source || 'campaign_page',
  };

  db.pledges.push(newPledge);
  saveDatabase(db);

  if (params.sessionId) {
    recordEvent({
      sessionId: params.sessionId,
      type: 'pledge_submitted',
      metadata: { affiliation: params.affiliation, pledgeId: newPledge.id },
    });
  }

  return newPledge;
}

export function getCampaignStats() {
  const db = loadDatabase();
  const totalVisits = db.visits.length;
  
  // Unique visitors by sessionId
  const uniqueSessionIds = new Set(db.visits.map(v => v.sessionId));
  const uniqueVisitors = uniqueSessionIds.size;

  // QR Code scans: visits with medium === 'qr_code' or source starting with 'qr_' or events of type 'qr_scanned'
  const qrVisits = db.visits.filter(
    v => v.medium === 'qr_code' || v.source.includes('qr') || v.source.includes('flyer') || v.source.includes('poster')
  ).length;

  const totalPledges = db.pledges.length;

  // Sources breakdown
  const sourceMap: Record<string, number> = {};
  db.visits.forEach(v => {
    const src = v.source || 'direct';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });

  // Device breakdown
  const deviceMap: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
  db.visits.forEach(v => {
    deviceMap[v.deviceType] = (deviceMap[v.deviceType] || 0) + 1;
  });

  // Micro events breakdown
  const eventCounts: Record<string, number> = {
    calendar_add: 0,
    map_opened: 0,
    quiz_answered: 0,
    share_clicked: 0,
    invitation_downloaded: 0,
    flyer_printed: 0,
    qr_scanned: 0,
    pledge_submitted: 0,
  };
  db.events.forEach(e => {
    eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
  });

  // Calculate engagement conversion rate
  const totalEngagedUsers = new Set([
    ...db.events.map(e => e.sessionId),
    ...db.pledges.map((_, i) => `pledge-${i}`)
  ]).size;

  const conversionRate = totalVisits > 0 ? Math.round((totalPledges / totalVisits) * 100) : 0;
  const qrOpenRate = totalVisits > 0 ? Math.round((qrVisits / totalVisits) * 100) : 0;

  // Recent timeline (last 15 activities)
  const recentActivities = [
    ...db.visits.map(v => ({
      id: v.id,
      time: v.timestamp,
      type: 'visit' as const,
      text: `Visit via ${formatSourceName(v.source)} (${v.deviceType})`,
      source: v.source,
    })),
    ...db.events.map(e => ({
      id: e.id,
      time: e.timestamp,
      type: 'interaction' as const,
      text: formatEventName(e.type, e.metadata),
      source: 'site_interaction',
    })),
    ...db.pledges.map(p => ({
      id: p.id,
      time: p.timestamp,
      type: 'pledge' as const,
      text: `Pledge from ${p.name} (${p.affiliation})`,
      source: p.source,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);

  return {
    totalVisits,
    uniqueVisitors,
    qrVisits,
    qrOpenRate,
    totalPledges,
    conversionRate,
    totalEngagedUsers,
    sources: sourceMap,
    devices: deviceMap,
    events: eventCounts,
    recentActivities,
    lastUpdated: new Date().toISOString(),
  };
}

function formatSourceName(src: string): string {
  switch (src) {
    case 'campus_poster_sproul': return 'Sproul Plaza Poster (QR)';
    case 'amazon_hub_flyer': return 'Amazon Hub Locker Flyer (QR)';
    case 'moffitt_library_table': return 'Moffitt Library Table Tent (QR)';
    case 'mdes_slack': return 'Berkeley MDes Slack';
    case 'instagram_mdes': return 'Instagram Story';
    case 'qr_direct': return 'Direct QR Scan';
    case 'direct': return 'Direct Web Link';
    default: return src.replace(/_/g, ' ');
  }
}

function formatEventName(type: string, meta?: Record<string, any>): string {
  switch (type) {
    case 'calendar_add': return `Added tabling to calendar (${meta?.format || 'calendar'})`;
    case 'map_opened': return 'Opened map directions to 2495 Bancroft Way';
    case 'quiz_answered': return 'Completed Blood Stem Cell Myth-Buster quiz';
    case 'share_clicked': return 'Shared campaign invitation link';
    case 'invitation_downloaded': return 'Saved high-res invitation flyer';
    case 'flyer_printed': return 'Printed physical campaign invitation';
    case 'qr_scanned': return 'QR Code scanned on campus';
    case 'pledge_submitted': return 'Pledge committed to attend tabling';
    default: return type.replace(/_/g, ' ');
  }
}

export function resetToSeedData(): CampaignDatabase {
  const initial = getInitialData();
  saveDatabase(initial);
  return initial;
}

export function clearToEmptyData(): CampaignDatabase {
  const empty: CampaignDatabase = {
    visits: [],
    events: [],
    pledges: [],
  };
  saveDatabase(empty);
  return empty;
}


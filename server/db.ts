import crypto from 'crypto';
import postgres from 'postgres';

/**
 * Storage layer for the NMDP campaign tracker.
 *
 * Previously this wrote a JSON file to disk. That works on a long-lived server
 * (AI Studio / Cloud Run) but silently loses every write on Vercel, where each
 * request may land on a fresh, short-lived serverless instance with its own
 * empty /tmp. Data is now kept in Postgres.
 *
 * If DATABASE_URL is absent the module degrades to an in-memory store so the
 * site still renders and never 500s -- but data will not survive. The /api/health
 * endpoint reports which mode is active.
 */

export interface CampaignVisit {
  id: string;
  timestamp: string; // ISO string
  source: string; // e.g., 'instagram_story', 'campus_poster_sproul', 'direct'
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
  type:
    | 'qr_scanned'
    | 'pledge_submitted'
    | 'calendar_add'
    | 'map_opened'
    | 'quiz_answered'
    | 'share_clicked'
    | 'faq_toggled'
    | 'invitation_downloaded'
    | 'flyer_printed';
  metadata?: Record<string, any>;
}

export interface PledgeRecord {
  id: string;
  timestamp: string;
  name: string;
  affiliation:
    | 'Undergraduate'
    | 'Graduate / MDes'
    | 'Faculty / Staff'
    | 'Berkeley Community'
    | 'Visitor';
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

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

const CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.SUPABASE_DB_URL ||
  '';

export const isPersistent = Boolean(CONNECTION_STRING);

let sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!CONNECTION_STRING) return null;
  if (!sql) {
    sql = postgres(CONNECTION_STRING, {
      // Serverless-friendly: tiny pool, short idle life, no prepared statements
      // (pgbouncer/Supabase transaction pooling rejects those).
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: CONNECTION_STRING.includes('sslmode=disable') ? false : 'require',
    });
  }
  return sql;
}

let schemaReady: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  const db = getSql();
  if (!db) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      // "IF NOT EXISTS" is not race-proof: when several cold serverless
      // instances run the same DDL at once (a crowd scanning the QR code
      // together), Postgres can still raise a duplicate-object error. Those
      // mean the object now exists, which is all we wanted.
      const DUPLICATE = new Set([
        '23505', // unique_violation on a catalog index
        '42P07', // duplicate_table
        '42710', // duplicate_object
      ]);
      const ddl = async (run: () => Promise<unknown>) => {
        try {
          await run();
        } catch (err: any) {
          if (!DUPLICATE.has(err?.code)) throw err;
        }
      };

      await ddl(() => db`
        CREATE TABLE IF NOT EXISTS visits (
          id          TEXT PRIMARY KEY,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          source      TEXT NOT NULL DEFAULT 'direct',
          medium      TEXT NOT NULL DEFAULT 'direct',
          campaign    TEXT NOT NULL DEFAULT 'nmdp_berkeley_fall26',
          user_agent  TEXT DEFAULT '',
          device_type TEXT NOT NULL DEFAULT 'desktop',
          referrer    TEXT DEFAULT 'direct',
          session_id  TEXT NOT NULL
        )`);
      await ddl(() => db`
        CREATE TABLE IF NOT EXISTS events (
          id          TEXT PRIMARY KEY,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          session_id  TEXT NOT NULL,
          type        TEXT NOT NULL,
          metadata    JSONB NOT NULL DEFAULT '{}'::jsonb
        )`);
      await ddl(() => db`
        CREATE TABLE IF NOT EXISTS pledges (
          id              TEXT PRIMARY KEY,
          created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          name            TEXT NOT NULL,
          affiliation     TEXT NOT NULL,
          time_preference TEXT NOT NULL DEFAULT 'Flexible drop-in',
          reminder_type   TEXT NOT NULL DEFAULT 'calendar_only',
          contact_masked  TEXT,
          pledge_note     TEXT,
          source          TEXT NOT NULL DEFAULT 'campaign_page'
        )`);
      await ddl(() => db`CREATE INDEX IF NOT EXISTS visits_session_idx ON visits (session_id)`);
      await ddl(() => db`CREATE INDEX IF NOT EXISTS visits_created_idx ON visits (created_at DESC)`);
      await ddl(() => db`CREATE INDEX IF NOT EXISTS events_created_idx ON events (created_at DESC)`);
      await ddl(() => db`CREATE INDEX IF NOT EXISTS pledges_created_idx ON pledges (created_at DESC)`);
    })().catch((err) => {
      // Reset so a later request can retry rather than being stuck on a
      // transient cold-start connection failure.
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

// ---------------------------------------------------------------------------
// In-memory fallback (used only when DATABASE_URL is not configured)
// ---------------------------------------------------------------------------

const memory: CampaignDatabase = { visits: [], events: [], pledges: [] };

// ---------------------------------------------------------------------------
// Row mapping
// ---------------------------------------------------------------------------

const iso = (v: any): string =>
  v instanceof Date ? v.toISOString() : new Date(v).toISOString();

const toVisit = (r: any): CampaignVisit => ({
  id: r.id,
  timestamp: iso(r.created_at),
  source: r.source,
  medium: r.medium,
  campaign: r.campaign,
  userAgent: r.user_agent || '',
  deviceType: r.device_type,
  referrer: r.referrer || 'direct',
  sessionId: r.session_id,
});

const toEvent = (r: any): CampaignEvent => ({
  id: r.id,
  timestamp: iso(r.created_at),
  sessionId: r.session_id,
  type: r.type,
  metadata: r.metadata || {},
});

const toPledge = (r: any): PledgeRecord => ({
  id: r.id,
  timestamp: iso(r.created_at),
  name: r.name,
  affiliation: r.affiliation,
  timePreference: r.time_preference,
  reminderType: r.reminder_type,
  contactMasked: r.contact_masked || undefined,
  pledgeNote: r.pledge_note || undefined,
  source: r.source,
});

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function loadDatabase(): Promise<CampaignDatabase> {
  const db = getSql();
  if (!db) return memory;
  await ensureSchema();

  const [visits, events, pledges] = await Promise.all([
    db`SELECT * FROM visits ORDER BY created_at ASC`,
    db`SELECT * FROM events ORDER BY created_at ASC`,
    db`SELECT * FROM pledges ORDER BY created_at ASC`,
  ]);

  return {
    visits: visits.map(toVisit),
    events: events.map(toEvent),
    pledges: pledges.map(toPledge),
  };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function recordVisit(params: {
  source?: string;
  medium?: string;
  campaign?: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
}): Promise<{ visit: CampaignVisit; isNewSession: boolean }> {
  const sessionId =
    params.sessionId || `sess-${crypto.randomBytes(6).toString('hex')}`;

  const ua = params.userAgent || '';
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iPhone|iPod/i.test(ua)) {
    deviceType = 'mobile';
  }

  const visit: CampaignVisit = {
    id: newId('v'),
    timestamp: new Date().toISOString(),
    source: params.source || 'direct',
    medium:
      params.medium || (params.source?.startsWith('qr_') ? 'qr_code' : 'direct'),
    campaign: params.campaign || 'nmdp_berkeley_fall26',
    userAgent: ua.slice(0, 150),
    deviceType,
    referrer: (params.referrer || 'direct').slice(0, 150),
    sessionId,
  };

  const db = getSql();
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  if (!db) {
    const seen = memory.visits.some(
      (v) =>
        v.sessionId === sessionId &&
        new Date(v.timestamp).getTime() > thirtyMinAgo.getTime()
    );
    memory.visits.push(visit);
    return { visit, isNewSession: !seen };
  }

  await ensureSchema();
  const recent = await db`
    SELECT 1 FROM visits
    WHERE session_id = ${sessionId} AND created_at > ${thirtyMinAgo}
    LIMIT 1`;

  await db`
    INSERT INTO visits (id, created_at, source, medium, campaign, user_agent, device_type, referrer, session_id)
    VALUES (${visit.id}, ${visit.timestamp}, ${visit.source}, ${visit.medium}, ${visit.campaign},
            ${visit.userAgent}, ${visit.deviceType}, ${visit.referrer}, ${visit.sessionId})`;

  return { visit, isNewSession: recent.length === 0 };
}

export async function recordEvent(params: {
  sessionId: string;
  type: CampaignEvent['type'];
  metadata?: Record<string, any>;
}): Promise<CampaignEvent> {
  const event: CampaignEvent = {
    id: newId('e'),
    timestamp: new Date().toISOString(),
    sessionId: params.sessionId,
    type: params.type,
    metadata: params.metadata || {},
  };

  const db = getSql();
  if (!db) {
    memory.events.push(event);
    return event;
  }

  await ensureSchema();
  await db`
    INSERT INTO events (id, created_at, session_id, type, metadata)
    VALUES (${event.id}, ${event.timestamp}, ${event.sessionId}, ${event.type},
            ${db.json(event.metadata as any)})`;

  return event;
}

export async function addPledge(params: {
  name: string;
  affiliation: PledgeRecord['affiliation'];
  timePreference: string;
  reminderType: PledgeRecord['reminderType'];
  contact?: string;
  pledgeNote?: string;
  source?: string;
  sessionId?: string;
}): Promise<PledgeRecord> {
  // Mask contact for privacy -- the raw value is never stored.
  let contactMasked: string | undefined;
  if (params.contact) {
    if (params.contact.includes('@')) {
      const parts = params.contact.split('@');
      contactMasked = `${parts[0].slice(0, 2)}***@${parts[1]}`;
    } else {
      contactMasked = params.contact.replace(/\d(?=\d{3})/g, '*');
    }
  }

  const pledge: PledgeRecord = {
    id: newId('p'),
    timestamp: new Date().toISOString(),
    name: params.name.trim(),
    affiliation: params.affiliation,
    timePreference: params.timePreference,
    reminderType: params.reminderType,
    contactMasked,
    pledgeNote: params.pledgeNote?.trim(),
    source: params.source || 'campaign_page',
  };

  const db = getSql();
  if (!db) {
    memory.pledges.push(pledge);
  } else {
    await ensureSchema();
    await db`
      INSERT INTO pledges (id, created_at, name, affiliation, time_preference, reminder_type, contact_masked, pledge_note, source)
      VALUES (${pledge.id}, ${pledge.timestamp}, ${pledge.name}, ${pledge.affiliation},
              ${pledge.timePreference}, ${pledge.reminderType},
              ${pledge.contactMasked ?? null}, ${pledge.pledgeNote ?? null}, ${pledge.source})`;
  }

  if (params.sessionId) {
    await recordEvent({
      sessionId: params.sessionId,
      type: 'pledge_submitted',
      metadata: { affiliation: params.affiliation, pledgeId: pledge.id },
    });
  }

  return pledge;
}

export async function getPledges(): Promise<PledgeRecord[]> {
  const db = getSql();
  if (!db) return [...memory.pledges].reverse();
  await ensureSchema();
  const rows = await db`SELECT * FROM pledges ORDER BY created_at DESC`;
  return rows.map(toPledge);
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export async function getCampaignStats() {
  const db = await loadDatabase();
  const totalVisits = db.visits.length;

  const uniqueVisitors = new Set(db.visits.map((v) => v.sessionId)).size;

  const qrVisits = db.visits.filter(
    (v) =>
      v.medium === 'qr_code' ||
      v.source.includes('qr') ||
      v.source.includes('flyer') ||
      v.source.includes('poster')
  ).length;

  const totalPledges = db.pledges.length;

  const sourceMap: Record<string, number> = {};
  db.visits.forEach((v) => {
    const src = v.source || 'direct';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });

  const deviceMap: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
  db.visits.forEach((v) => {
    deviceMap[v.deviceType] = (deviceMap[v.deviceType] || 0) + 1;
  });

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
  db.events.forEach((e) => {
    eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
  });

  // Sessions that did anything beyond simply loading the page.
  const totalEngagedUsers = new Set(db.events.map((e) => e.sessionId)).size;

  const conversionRate =
    totalVisits > 0 ? Math.round((totalPledges / totalVisits) * 100) : 0;
  const qrOpenRate =
    totalVisits > 0 ? Math.round((qrVisits / totalVisits) * 100) : 0;

  const recentActivities = [
    ...db.visits.map((v) => ({
      id: v.id,
      time: v.timestamp,
      type: 'visit' as const,
      text: `Visit via ${formatSourceName(v.source)} (${v.deviceType})`,
      source: v.source,
    })),
    ...db.events.map((e) => ({
      id: e.id,
      time: e.timestamp,
      type: 'interaction' as const,
      text: formatEventName(e.type, e.metadata),
      source: 'site_interaction',
    })),
    ...db.pledges.map((p) => ({
      id: p.id,
      time: p.timestamp,
      type: 'pledge' as const,
      text: `Pledge from ${p.name} (${p.affiliation})`,
      source: p.source,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 15);

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
    storage: isPersistent ? 'postgres' : 'memory',
    lastUpdated: new Date().toISOString(),
  };
}

function formatSourceName(src: string): string {
  switch (src) {
    case 'instagram_story':
      return 'Instagram Story (Link Sticker)';
    case 'instagram_bio':
      return 'Instagram Profile Bio Link';
    case 'instagram_qr':
      return 'Instagram Post / QR Graphic';
    case 'student_group':
      return 'Student Group Chat & DM';
    case 'direct':
      return 'Direct Web Link';
    default:
      return src.replace(/_/g, ' ');
  }
}

function formatEventName(type: string, meta?: Record<string, any>): string {
  switch (type) {
    case 'calendar_add':
      return `Added tabling to calendar (${meta?.format || 'calendar'})`;
    case 'map_opened':
      return 'Opened map directions to 2495 Bancroft Way';
    case 'quiz_answered':
      return 'Completed Blood Stem Cell Myth-Buster quiz';
    case 'share_clicked':
      return 'Shared campaign invitation link';
    case 'invitation_downloaded':
      return 'Saved high-res invitation flyer';
    case 'flyer_printed':
      return 'Printed physical campaign invitation';
    case 'qr_scanned':
      return 'QR Code scanned on campus';
    case 'pledge_submitted':
      return 'Pledge committed to attend tabling';
    default:
      return type.replace(/_/g, ' ');
  }
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function clearToEmptyData(): Promise<CampaignDatabase> {
  const db = getSql();
  if (!db) {
    memory.visits = [];
    memory.events = [];
    memory.pledges = [];
    return memory;
  }
  await ensureSchema();
  await db`TRUNCATE visits, events, pledges`;
  return { visits: [], events: [], pledges: [] };
}

// Kept as an alias so the existing /api/reset-demo endpoint keeps working.
// There is no seed data: the campaign tracks real traffic only.
export const resetToSeedData = clearToEmptyData;

export async function healthCheck(): Promise<{ ok: boolean; detail: string }> {
  const db = getSql();
  if (!db) {
    return {
      ok: false,
      detail:
        'DATABASE_URL is not set - running in memory mode. Data will be lost between requests.',
    };
  }
  try {
    await ensureSchema();
    await db`SELECT 1`;
    return { ok: true, detail: 'Connected to Postgres.' };
  } catch (err: any) {
    return { ok: false, detail: `Postgres error: ${err?.message || err}` };
  }
}

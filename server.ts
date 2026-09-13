// Must come first: db.js reads DATABASE_URL at module load time.
// (No-op on Vercel, where env vars are injected by the platform.)
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  recordVisit,
  recordEvent,
  addPledge,
  getCampaignStats,
  getPledges,
  loadDatabase,
  resetToSeedData,
  clearToEmptyData,
  healthCheck,
  isPersistent,
} from './server/db.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for mobile devices, external browser previews, and in-app browsers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, X-Admin-Token'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- Path reconstruction for Vercel ---------------------------------------
// vercel.json rewrites /api/<rest> to /api?__path=<rest>. A rewrite can drop
// the sub-path before Express ever sees it (which is what made every API call
// return an HTML 404 and surface in the UI as "Connection error"), so the real
// route is carried through in a query parameter and restored here. This is a
// no-op locally, where the URL already arrives intact.
app.use((req, res, next) => {
  const parsed = new URL(req.url, 'http://localhost');
  const carried = parsed.searchParams.get('__path');
  if (carried !== null) {
    parsed.searchParams.delete('__path');
    const query = parsed.searchParams.toString();
    req.url = `/api/${carried.replace(/^\/+/, '')}${query ? `?${query}` : ''}`;
  }
  next();
});

app.use(express.json());

// Safety net: if a host rewrites /api/pledge down to /pledge, put the prefix back.
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/@') && !req.url.startsWith('/src')) {
    const apiEndpoints = [
      'health',
      'stats',
      'pledge',
      'pledges',
      'track',
      'clear-all',
      'reset-demo',
      'export-data',
      'generate-summary',
    ];
    const firstSegment = req.url.replace(/^\/+/, '').split(/[\/?]/)[0];
    if (apiEndpoints.includes(firstSegment)) {
      req.url = `/api${req.url}`;
    }
  }
  next();
});

// Any handler error must still return JSON -- the client calls res.json() on
// every response, and an HTML error page is what produced "Connection error".
const wrap =
  (fn: (req: express.Request, res: express.Response) => Promise<unknown>) =>
  (req: express.Request, res: express.Response) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      console.error(`Error handling ${req.method} ${req.url}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal error', detail: String(err?.message || err) });
      }
    });
  };

// ================= ADMIN AUTH =================
// Protects the pledge roster (real student names) and the destructive endpoints.
// Without this, anyone holding the campaign URL could wipe the data or download
// the full list of participants.

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

const requireAdmin: express.RequestHandler = (req, res, next) => {
  if (!ADMIN_TOKEN) {
    res.status(503).json({
      error: 'Admin access is not configured.',
      detail:
        'Set the ADMIN_TOKEN environment variable in your Vercel project settings, then redeploy.',
    });
    return;
  }
  const supplied =
    (req.headers['x-admin-token'] as string) ||
    (typeof req.query.token === 'string' ? req.query.token : '');

  if (supplied !== ADMIN_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

// Initialize Gemini lazily if API key exists
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize Gemini client:', err);
    }
  }
  return aiClient;
}

// ================= PUBLIC API ROUTES =================

// Health check -- also reports whether storage is actually persistent.
app.get(
  '/api/health',
  wrap(async (req, res) => {
    const health = await healthCheck();
    res.json({
      status: health.ok ? 'ok' : 'degraded',
      storage: isPersistent ? 'postgres' : 'memory',
      detail: health.detail,
      adminConfigured: Boolean(ADMIN_TOKEN),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      time: new Date().toISOString(),
    });
  })
);

// Track page / QR visit
app.post(
  '/api/track/visit',
  wrap(async (req, res) => {
    const { source, medium, campaign, sessionId, referrer } = req.body || {};
    const userAgent = req.headers['user-agent'] || '';

    const result = await recordVisit({
      source,
      medium,
      campaign,
      userAgent,
      referrer,
      sessionId,
    });

    res.json({
      success: true,
      visitId: result.visit.id,
      sessionId: result.visit.sessionId,
      isNewSession: result.isNewSession,
    });
  })
);

// Track micro-interaction event
app.post(
  '/api/track/event',
  wrap(async (req, res) => {
    const { sessionId, type, metadata } = req.body || {};
    if (!sessionId || !type) {
      return res.status(400).json({ error: 'sessionId and type are required' });
    }

    const event = await recordEvent({ sessionId, type, metadata });
    res.json({ success: true, event });
  })
);

// Submit a student pledge
app.post(
  '/api/pledge',
  wrap(async (req, res) => {
    const {
      name,
      affiliation,
      timePreference,
      reminderType,
      contact,
      pledgeNote,
      source,
      sessionId,
    } = req.body || {};

    if (!name || !affiliation) {
      return res.status(400).json({ error: 'Name and affiliation are required' });
    }

    const pledge = await addPledge({
      name: String(name).slice(0, 120),
      affiliation,
      timePreference: timePreference || 'Flexible drop-in',
      reminderType: reminderType || 'calendar_only',
      contact,
      pledgeNote: pledgeNote ? String(pledgeNote).slice(0, 500) : undefined,
      source,
      sessionId,
    });

    res.json({ success: true, pledge });
  })
);

// Aggregate campaign analytics (counts only -- no personal data)
app.get(
  '/api/stats',
  wrap(async (req, res) => {
    const stats = await getCampaignStats();
    res.json(stats);
  })
);

// ================= ADMIN-ONLY ROUTES =================

// Pledge roster contains real student names -- admin only.
app.get(
  '/api/pledges',
  requireAdmin,
  wrap(async (req, res) => {
    const pledges = await getPledges();
    res.json({ pledges });
  })
);

app.post(
  '/api/reset-demo',
  requireAdmin,
  wrap(async (req, res) => {
    await resetToSeedData();
    const stats = await getCampaignStats();
    res.json({ success: true, stats });
  })
);

app.post(
  '/api/clear-all',
  requireAdmin,
  wrap(async (req, res) => {
    await clearToEmptyData();
    const stats = await getCampaignStats();
    res.json({ success: true, stats });
  })
);

app.get(
  '/api/export-data',
  requireAdmin,
  wrap(async (req, res) => {
    const db = await loadDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="nmdp_campaign_data.json"');
    res.json(db);
  })
);

// Generate the 3-6 sentence assignment reflection write-up
app.post(
  '/api/generate-summary',
  requireAdmin,
  wrap(async (req, res) => {
    const stats = await getCampaignStats();
    const { style = 'standard' } = req.body || {};

    const gemini = getGeminiClient();
    if (gemini) {
      const prompt = `You are a UC Berkeley Master of Design (MDes) student reporting on an engagement campaign for the NMDP (National Marrow Donor Program) Tabling Session on UC Berkeley campus (Monday, Sept 21, 10am-12pm PT outside Amazon Hub Locker: 2495 Bancroft Way).
Write EXACTLY a 3 to 6 sentence reflection describing what you created and the engagement results for the assignment page and Google Slide deck submission.

Campaign Distribution: Shared across Instagram Stories, profile bio links, and digital student outreach.
Campaign Real-Time Interaction Metrics:
- Total Page / Campaign Views: ${stats.totalVisits}
- Unique Visitors: ${stats.uniqueVisitors}
- QR Code Opens / Scans: ${stats.qrVisits} (${stats.qrOpenRate}% of traffic)
- Student Pledges to Join Registry: ${stats.totalPledges}
- Interactive Micro-Interactions (Calendar adds, map navigations, myth buster quizzes): ${
        stats.events.calendar_add + stats.events.map_opened + stats.events.quiz_answered
      }
- Conversion Rate: ${stats.conversionRate}%
- Key Context: September is Blood & Pediatric Cancer Awareness Month, blood cancer diagnosed every 3-4 minutes, blood stem cells restore immune systems, volunteering with Berkeley MDes students.

Writing Style: ${style} (e.g. 'standard', 'impact_focused', or 'design_process').
Return ONLY the 3-6 sentence paragraph. No extra markdown headings or bullet points.`;

      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out')), 15000)
        );
        const response = await Promise.race([
          gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          }),
          timeoutPromise,
        ]);
        const text = response.text?.trim();
        if (text) {
          return res.json({ summary: text, isAiGenerated: true, stats });
        }
      } catch (genErr) {
        console.warn('Gemini generation skipped or timed out, using fallback:', genErr);
      }
    }

    const fallbackSummary =
      stats.totalVisits === 0
        ? `For the upcoming NMDP Tabling Session, I designed a multi-channel invitation campaign featuring a clean visual poster and an interactive mobile landing page to drive awareness for Blood Cancer and Pediatric Cancer Awareness Month. The invitation is prepared for launch across Instagram Stories, profile bio links, and direct digital messaging, directing students to event logistics outside the Amazon Hub Locker (2495 Bancroft Way) and educational facts regarding blood stem cell donation. This real-time analytics environment is connected to an active database to record authentic viewer traffic, direct QR code opens, and student registry commitments upon rollout. By pairing urgent medical facts—such as a blood cancer diagnosis occurring every 3-4 minutes—with approachable graphic design, the invitation is engineered to foster community interest in joining the NMDP Registry.`
        : `For the upcoming NMDP Tabling Session, I designed a multi-channel invitation campaign featuring a clean visual poster and an interactive mobile landing page to drive awareness for Blood Cancer and Pediatric Cancer Awareness Month. The invitation was shared across Instagram Stories, profile bio links, and direct digital outreach, directing students to event logistics outside the Amazon Hub Locker (2495 Bancroft Way) and educational facts regarding blood stem cell donation. Over the campaign tracking period, the invitation generated ${stats.totalVisits} verified views and ${stats.qrVisits} direct QR opens, with mobile devices accounting for the primary share of student engagement. The campaign achieved strong participation with ${stats.totalPledges} students submitting pledges to stop by and get swabbed, while ${stats.events.calendar_add || 0} students synced the tabling session to their calendars. By pairing urgent medical facts with approachable graphic design, the invitation successfully fostered community interest in joining the NMDP Registry.`;

    res.json({ summary: fallbackSummary, isAiGenerated: false, stats });
  })
);

// Unknown /api/* paths must return JSON, never an HTML 404 page.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// ================= VITE MIDDLEWARE & SERVER START =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Loaded through a variable so no bundler can statically resolve it.
    // `vite` is a ~40MB dev-only dependency; a literal import() would drag it
    // into the Vercel serverless bundle and wreck cold-start time.
    const vitePackage = 'vite';
    const { createServer: createViteServer } = (await import(
      /* @vite-ignore */ vitePackage
    )) as typeof import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    console.log(
      isPersistent
        ? 'Storage: Postgres (persistent)'
        : 'Storage: in-memory  ** DATABASE_URL not set - data will NOT be saved **'
    );
  });
}

// Only start a listener when run directly (not inside a Vercel function).
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };

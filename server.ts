import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  recordVisit,
  recordEvent,
  addPledge,
  getCampaignStats,
  loadDatabase,
  resetToSeedData,
  clearToEmptyData,
} from './server/db.js';

const app = express();
const PORT = 3000;

// Enable CORS for mobile devices, external browser previews, and in-app browsers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Normalize path if Vercel serverless function receives rewritten paths without /api
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/@') && !req.url.startsWith('/src')) {
    const apiEndpoints = ['health', 'stats', 'pledge', 'track', 'clear-all', 'reset-demo', 'export-data', 'generate-summary'];
    const firstSegment = req.url.replace(/^\/+/, '').split(/[\/?]/)[0];
    if (apiEndpoints.includes(firstSegment)) {
      req.url = `/api${req.url}`;
    }
  }
  next();
});

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

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Track page / QR visit
app.post('/api/track/visit', (req, res) => {
  try {
    const { source, medium, campaign, sessionId, referrer } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    
    const result = recordVisit({
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
  } catch (err) {
    console.error('Error tracking visit:', err);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// Track micro-interaction event
app.post('/api/track/event', (req, res) => {
  try {
    const { sessionId, type, metadata } = req.body;
    if (!sessionId || !type) {
      return res.status(400).json({ error: 'sessionId and type are required' });
    }

    const event = recordEvent({
      sessionId,
      type,
      metadata,
    });

    res.json({ success: true, event });
  } catch (err) {
    console.error('Error tracking event:', err);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Submit a student pledge
app.post('/api/pledge', (req, res) => {
  try {
    const { name, affiliation, timePreference, reminderType, contact, pledgeNote, source, sessionId } = req.body;
    if (!name || !affiliation) {
      return res.status(400).json({ error: 'Name and affiliation are required' });
    }

    const pledge = addPledge({
      name,
      affiliation,
      timePreference: timePreference || 'Flexible drop-in',
      reminderType: reminderType || 'calendar_only',
      contact,
      pledgeNote,
      source,
      sessionId,
    });

    res.json({ success: true, pledge });
  } catch (err) {
    console.error('Error saving pledge:', err);
    res.status(500).json({ error: 'Failed to record pledge' });
  }
});

// Get real-time campaign analytics
app.get('/api/stats', (req, res) => {
  try {
    const stats = getCampaignStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get pledges list
app.get('/api/pledges', (req, res) => {
  try {
    const db = loadDatabase();
    // Return sorted newest first
    const pledges = [...db.pledges].reverse();
    res.json({ pledges });
  } catch (err) {
    console.error('Error fetching pledges:', err);
    res.status(500).json({ error: 'Failed to fetch pledges' });
  }
});

// Reset or re-seed campaign data
app.post('/api/reset-demo', (req, res) => {
  try {
    const db = resetToSeedData();
    const stats = getCampaignStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error resetting database:', err);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Clear all data to 0 (for clean real-user tracking)
app.post('/api/clear-all', (req, res) => {
  try {
    const db = clearToEmptyData();
    const stats = getCampaignStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error clearing database:', err);
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

// Export full raw campaign data as JSON
app.get('/api/export-data', (req, res) => {
  try {
    const db = loadDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="nmdp_campaign_data.json"');
    res.json(db);
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Generate 3-6 sentence assignment reflection write-up for Google Slide / Assignment page
app.post('/api/generate-summary', async (req, res) => {
  try {
    const stats = getCampaignStats();
    const { style = 'standard' } = req.body;

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
- Interactive Micro-Interactions (Calendar adds, map navigations, myth buster quizzes): ${stats.events.calendar_add + stats.events.map_opened + stats.events.quiz_answered}
- Conversion Rate: ${stats.conversionRate}%
- Key Context: September is Blood & Pediatric Cancer Awareness Month, blood cancer diagnosed every 3-4 minutes, blood stem cells restore immune systems, volunteering with Berkeley MDes students.

Writing Style: ${style} (e.g. 'standard', 'impact_focused', or 'design_process').
Return ONLY the 3-6 sentence paragraph. No extra markdown headings or bullet points.`;

      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out')), 2000)
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
        console.warn('Gemini generation skipped or timed out, using fast fallback:', genErr);
      }
    }

    // High quality deterministic fallback matching the 3-6 sentence assignment requirement
    const fallbackSummary = stats.totalVisits === 0
      ? `For the upcoming NMDP Tabling Session, I designed a multi-channel invitation campaign featuring a clean visual poster and an interactive mobile landing page to drive awareness for Blood Cancer and Pediatric Cancer Awareness Month. The invitation is prepared for launch across Instagram Stories, profile bio links, and direct digital messaging, directing students to event logistics outside the Amazon Hub Locker (2495 Bancroft Way) and educational facts regarding blood stem cell donation. This real-time analytics environment is connected to an active database to record authentic viewer traffic, direct QR code opens, and student registry commitments upon rollout. By pairing urgent medical facts—such as a blood cancer diagnosis occurring every 3-4 minutes—with approachable graphic design, the invitation is engineered to foster community interest in joining the NMDP Registry.`
      : `For the upcoming NMDP Tabling Session, I designed a multi-channel invitation campaign featuring a clean visual poster and an interactive mobile landing page to drive awareness for Blood Cancer and Pediatric Cancer Awareness Month. The invitation was shared across Instagram Stories, profile bio links, and direct digital outreach, directing students to event logistics outside the Amazon Hub Locker (2495 Bancroft Way) and educational facts regarding blood stem cell donation. Over the campaign tracking period, the invitation generated ${stats.totalVisits} verified views and ${stats.qrVisits} direct QR opens, with mobile devices accounting for the primary share of student engagement. The campaign achieved strong participation with ${stats.totalPledges} students submitting pledges to stop by and get swabbed, while ${stats.events.calendar_add || 0} students synced the tabling session to their calendars. By pairing urgent medical facts with approachable graphic design, the invitation successfully fostered community interest in joining the NMDP Registry.`;

    res.json({ summary: fallbackSummary, isAiGenerated: false, stats });
  } catch (err) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// ================= VITE MIDDLEWARE & SERVER START =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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
  });
}

// Only start the server when run directly (not in Vercel serverless function environment)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UAParser = require('ua-parser-js');
const { initDB, queries } = require('./db');
const { resolveIP } = require('./geo');
const { deploy } = require('./deploy');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3002;
const CONFIG_DIR = path.join(__dirname, '..');
// In production on Railway, use /data volume for persistent storage
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..');
const IMAGES_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(DATA_DIR, 'images')
  : path.join(__dirname, '..', 'client', 'public', 'images');

// Ensure directories exist
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Initialize config files if they don't exist
const defaultConfig = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#FFFFFF',
    text: '#111827',
  },
  fonts: {
    heading: { family: 'Inter', size: '2.5rem', color: '#111827', weight: '700' },
    body: { family: 'Inter', size: '1rem', color: '#374151', weight: '400' },
  },
  sections: [
    {
      id: 'hero',
      type: 'hero',
      headline: 'Welcome to Our Site',
      subheadline: 'We build great things',
      cta_text: 'Get Started',
      cta_link: '/signup',
      background_image: '/images/hero.jpg',
      background_color: '#1E293B',
    },
    {
      id: 'about',
      type: 'about',
      headline: 'About Us',
      body: 'We are a team of passionate creators building beautiful digital experiences. Our mission is to make the web a more beautiful place.',
      background_color: '#FFFFFF',
    },
    {
      id: 'features',
      type: 'features',
      headline: 'Our Features',
      items: [
        { title: 'Fast', description: 'Lightning-fast performance' },
        { title: 'Secure', description: 'Enterprise-grade security' },
        { title: 'Scalable', description: 'Grows with your needs' },
      ],
      background_color: '#F8FAFC',
    },
    {
      id: 'footer',
      type: 'footer',
      text: '© 2026 Our Company. All rights reserved.',
      background_color: '#0F172A',
    },
  ],
  images: {
    logo: '/images/logo.png',
    hero_bg: '/images/hero.jpg',
  },
};

const configPath = path.join(DATA_DIR, 'site-config.json');
const draftPath = path.join(DATA_DIR, 'site-config-draft.json');
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
if (!fs.existsSync(draftPath)) fs.writeFileSync(draftPath, JSON.stringify(defaultConfig, null, 2));

// Middleware
app.use(express.json({ limit: '10mb' }));

// CORS: tracker endpoints open, editor/API restricted in prod
const isProduction = process.env.NODE_ENV === 'production';
app.use('/api/events', cors());
app.use('/tracker.js', cors());
if (isProduction) {
  // In production, everything is same-origin (Express serves the React build)
  app.use('/api', cors());
} else {
  app.use('/api', cors({ origin: ['http://localhost:5174', 'http://127.0.0.1:5174'] }));
}

// Serve static images
app.use('/images', express.static(IMAGES_DIR));

// ─── Tracker Script ──────────────────────────────────────────────
app.get('/tracker.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, '..', 'client', 'public', 'tracker.js'));
});

// ─── Analytics API ───────────────────────────────────────────────

// Receive page view events
app.post('/api/events', async (req, res) => {
  try {
    const { visitor_id, page_url, page_title, referrer, site_id } = req.body;
    if (!visitor_id || !page_url) return res.status(400).json({ error: 'Missing required fields' });

    // Parse UA
    const ua = new UAParser(req.headers['user-agent']);
    const device = ua.getDevice().type || 'desktop';
    const browser = `${ua.getBrowser().name || 'Unknown'} ${ua.getBrowser().version || ''}`.trim();
    const os = `${ua.getOS().name || 'Unknown'} ${ua.getOS().version || ''}`.trim();

    // Geo lookup
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const cleanIP = ip === '::1' || ip === '127.0.0.1' ? '8.8.8.8' : ip;
    const geo = await resolveIP(cleanIP);

    const event = {
      site_id: site_id || 'default',
      visitor_id,
      page_url,
      page_title: page_title || '',
      referrer: referrer || '',
      city: geo.city,
      region: geo.region,
      country: geo.country,
      lat: geo.lat,
      lon: geo.lon,
      device,
      browser,
      os,
    };

    queries.insertEvent(event);
    queries.upsertActiveVisitor({
      visitor_id,
      site_id: event.site_id,
      page_url,
      city: geo.city,
      country: geo.country,
      device,
    });

    broadcastActiveVisitors();
    res.json({ ok: true });
  } catch (err) {
    console.error('[Events] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Duration heartbeat
app.post('/api/events/duration', (req, res) => {
  const { visitor_id, page_url, duration } = req.body;
  if (!visitor_id || !page_url) return res.status(400).json({ error: 'Missing fields' });

  queries.updateDuration({ visitor_id, page_url, duration: Math.round(duration) });

  const existing = queries.getActiveVisitors().find((v) => v.visitor_id === visitor_id);
  if (existing) {
    queries.upsertActiveVisitor(existing);
  }

  res.json({ ok: true });
});

// Visitor left
app.post('/api/events/leave', (req, res) => {
  const { visitor_id } = req.body;
  if (visitor_id) {
    queries.removeActiveVisitor(visitor_id);
    broadcastActiveVisitors();
  }
  res.json({ ok: true });
});

// Get events (paginated + filterable)
app.get('/api/events', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
  const offset = (page - 1) * limit;

  const conditions = ['1=1'];
  const params = { $limit: limit, $offset: offset };

  if (req.query.country) {
    conditions.push('country = $country');
    params.$country = req.query.country;
  }
  if (req.query.page_url) {
    conditions.push('page_url LIKE $page_url');
    params.$page_url = `%${req.query.page_url}%`;
  }
  if (req.query.start) {
    conditions.push('created_at >= $start');
    params.$start = req.query.start;
  }
  if (req.query.end) {
    conditions.push('created_at <= $end');
    params.$end = req.query.end;
  }

  const where = conditions.join(' AND ');
  const events = queries.getEventsFiltered(where, params);
  const countResult = queries.getEventsCountFiltered(where, params);
  const count = countResult ? countResult.count : 0;

  res.json({
    events,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});

// Active visitors
app.get('/api/active-visitors', (req, res) => {
  queries.cleanStaleVisitors();
  res.json(queries.getActiveVisitors());
});

// Top pages
app.get('/api/analytics/top-pages', (req, res) => {
  const { start = '2000-01-01', end = '2099-12-31' } = req.query;
  res.json(queries.getTopPages({ start, end }));
});

// Traffic over time
app.get('/api/analytics/traffic', (req, res) => {
  const { start = '2000-01-01', end = '2099-12-31', group = 'hour' } = req.query;
  const groupFormats = {
    hour: '%Y-%m-%d %H:00',
    day: '%Y-%m-%d',
    week: '%Y-W%W',
    month: '%Y-%m',
  };
  res.json(queries.getTrafficOverTime({ start, end, groupBy: groupFormats[group] || groupFormats.day }));
});

// Geo breakdown
app.get('/api/analytics/geo', (req, res) => {
  const { start = '2000-01-01', end = '2099-12-31' } = req.query;
  res.json(queries.getGeoBreakdown({ start, end }));
});

// Visitor locations for map
app.get('/api/analytics/locations', (req, res) => {
  const { start = '2000-01-01', end = '2099-12-31' } = req.query;
  res.json(queries.getVisitorLocations({ start, end }));
});

// ─── Site Config API ─────────────────────────────────────────────

app.get('/api/config', (req, res) => {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  res.json(config);
});

app.get('/api/config/draft', (req, res) => {
  const draft = JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
  res.json(draft);
});

app.put('/api/config/draft', (req, res) => {
  try {
    fs.writeFileSync(draftPath, JSON.stringify(req.body, null, 2));
    res.json({ ok: true, message: 'Draft saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

app.post('/api/config/publish', async (req, res) => {
  try {
    const draft = JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
    fs.writeFileSync(configPath, JSON.stringify(draft, null, 2));

    let deployResult = null;
    if (process.env.DEPLOY_REPO_PATH) {
      const deployConfigPath = path.join(process.env.DEPLOY_REPO_PATH, 'site-config.json');
      fs.writeFileSync(deployConfigPath, JSON.stringify(draft, null, 2));

      try {
        deployResult = await deploy();
      } catch (err) {
        return res.json({ ok: true, message: 'Published locally, but deploy failed', deployError: err.message });
      }
    }

    res.json({ ok: true, message: 'Published successfully', deploy: deployResult ? 'success' : 'skipped' });
  } catch (err) {
    res.status(500).json({ error: 'Publish failed: ' + err.message });
  }
});

app.post('/api/config/revert', (req, res) => {
  try {
    const published = fs.readFileSync(configPath, 'utf-8');
    fs.writeFileSync(draftPath, published);
    res.json({ ok: true, config: JSON.parse(published) });
  } catch (err) {
    res.status(500).json({ error: 'Revert failed' });
  }
});

// ─── Image Upload ────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: IMAGES_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No valid image uploaded' });
  res.json({ ok: true, path: `/images/${req.file.filename}`, filename: req.file.filename });
});

// ─── WebSocket ───────────────────────────────────────────────────

const dashboardClients = new Set();
const trackerClients = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const type = url.searchParams.get('type');

  if (type === 'dashboard') {
    dashboardClients.add(ws);
    queries.cleanStaleVisitors();
    ws.send(JSON.stringify({ type: 'active_visitors', data: queries.getActiveVisitors() }));
    ws.on('close', () => dashboardClients.delete(ws));
  } else if (type === 'tracker') {
    const visitorId = url.searchParams.get('visitor_id');
    if (visitorId) {
      trackerClients.set(visitorId, ws);

      ws.on('message', (msg) => {
        try {
          const data = JSON.parse(msg);
          if (data.type === 'heartbeat') {
            const existing = queries.getActiveVisitors().find((v) => v.visitor_id === visitorId);
            if (existing) {
              queries.upsertActiveVisitor(existing);
              broadcastActiveVisitors();
            }
          }
        } catch {}
      });

      ws.on('close', () => {
        trackerClients.delete(visitorId);
        queries.removeActiveVisitor(visitorId);
        broadcastActiveVisitors();
      });
    }
  }
});

function broadcastActiveVisitors() {
  queries.cleanStaleVisitors();
  const visitors = queries.getActiveVisitors();
  const msg = JSON.stringify({ type: 'active_visitors', data: visitors });
  for (const client of dashboardClients) {
    if (client.readyState === 1) client.send(msg);
  }
}

// Clean stale visitors periodically
setInterval(() => {
  queries.cleanStaleVisitors();
  broadcastActiveVisitors();
}, 30000);

// ─── Serve client in production ──────────────────────────────────
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ─── Start ───────────────────────────────────────────────────────
async function start() {
  await initDB();
  server.listen(PORT, () => {
    console.log(`\n  Admin Dashboard server running on http://localhost:${PORT}`);
    console.log(`  Analytics API:  http://localhost:${PORT}/api/events`);
    console.log(`  Config API:     http://localhost:${PORT}/api/config`);
    console.log(`  WebSocket:      ws://localhost:${PORT}/ws`);
    console.log(`  Deploy repo:    ${process.env.DEPLOY_REPO_PATH || '(not configured)'}\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..');
const DB_PATH = path.join(DATA_DIR, 'analytics.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT,
      visitor_id TEXT,
      page_url TEXT,
      page_title TEXT,
      referrer TEXT,
      city TEXT,
      region TEXT,
      country TEXT,
      lat REAL,
      lon REAL,
      device TEXT,
      browser TEXT,
      os TEXT,
      duration_seconds INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS active_visitors (
      visitor_id TEXT PRIMARY KEY,
      site_id TEXT,
      page_url TEXT,
      city TEXT,
      country TEXT,
      device TEXT,
      last_seen DATETIME
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS geo_cache (
      ip TEXT PRIMARY KEY,
      city TEXT,
      region TEXT,
      country TEXT,
      lat REAL,
      lon REAL,
      cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes (IF NOT EXISTS not supported for indexes in all versions, so try/catch)
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_events_site_id ON events(site_id)',
    'CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON events(visitor_id)',
    'CREATE INDEX IF NOT EXISTS idx_events_page_url ON events(page_url)',
    'CREATE INDEX IF NOT EXISTS idx_events_country ON events(country)',
  ];
  for (const idx of indexes) {
    try { db.run(idx); } catch {}
  }

  saveDB();
  return db;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Auto-save every 10 seconds
setInterval(() => saveDB(), 10000);

// Helper to run a statement and return rows as objects
function queryAll(sql, params = {}) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = {}) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function runStmt(sql, params = {}) {
  db.run(sql, params);
  saveDB();
}

const queries = {
  insertEvent(data) {
    runStmt(
      `INSERT INTO events (site_id, visitor_id, page_url, page_title, referrer, city, region, country, lat, lon, device, browser, os)
       VALUES ($site_id, $visitor_id, $page_url, $page_title, $referrer, $city, $region, $country, $lat, $lon, $device, $browser, $os)`,
      {
        $site_id: data.site_id, $visitor_id: data.visitor_id, $page_url: data.page_url,
        $page_title: data.page_title, $referrer: data.referrer, $city: data.city,
        $region: data.region, $country: data.country, $lat: data.lat, $lon: data.lon,
        $device: data.device, $browser: data.browser, $os: data.os,
      }
    );
  },

  updateDuration(data) {
    runStmt(
      `UPDATE events SET duration_seconds = $duration
       WHERE id = (SELECT id FROM events WHERE visitor_id = $visitor_id AND page_url = $page_url ORDER BY created_at DESC LIMIT 1)`,
      { $visitor_id: data.visitor_id, $page_url: data.page_url, $duration: data.duration }
    );
  },

  upsertActiveVisitor(data) {
    runStmt(`DELETE FROM active_visitors WHERE visitor_id = $visitor_id`, { $visitor_id: data.visitor_id });
    runStmt(
      `INSERT INTO active_visitors (visitor_id, site_id, page_url, city, country, device, last_seen)
       VALUES ($visitor_id, $site_id, $page_url, $city, $country, $device, datetime('now'))`,
      {
        $visitor_id: data.visitor_id, $site_id: data.site_id, $page_url: data.page_url,
        $city: data.city, $country: data.country, $device: data.device,
      }
    );
  },

  removeActiveVisitor(visitorId) {
    runStmt(`DELETE FROM active_visitors WHERE visitor_id = $id`, { $id: visitorId });
  },

  cleanStaleVisitors() {
    runStmt(`DELETE FROM active_visitors WHERE last_seen < datetime('now', '-60 seconds')`);
  },

  getActiveVisitors() {
    return queryAll(`SELECT * FROM active_visitors ORDER BY last_seen DESC`);
  },

  getEventsFiltered(where, params) {
    return queryAll(`SELECT * FROM events WHERE ${where} ORDER BY created_at DESC LIMIT $limit OFFSET $offset`, params);
  },

  getEventsCountFiltered(where, params) {
    // Remove limit/offset params for count query
    const countParams = { ...params };
    delete countParams.$limit;
    delete countParams.$offset;
    return queryOne(`SELECT COUNT(*) as count FROM events WHERE ${where}`, countParams);
  },

  getTopPages(params) {
    return queryAll(
      `SELECT page_url, page_title, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_visitors
       FROM events WHERE created_at >= $start AND created_at <= $end
       GROUP BY page_url ORDER BY views DESC LIMIT 20`,
      { $start: params.start, $end: params.end }
    );
  },

  getTrafficOverTime(params) {
    return queryAll(
      `SELECT strftime($groupBy, created_at) as period, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors
       FROM events WHERE created_at >= $start AND created_at <= $end
       GROUP BY period ORDER BY period ASC`,
      { $groupBy: params.groupBy, $start: params.start, $end: params.end }
    );
  },

  getGeoBreakdown(params) {
    return queryAll(
      `SELECT country, city, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors
       FROM events WHERE created_at >= $start AND created_at <= $end
       GROUP BY country, city ORDER BY views DESC LIMIT 50`,
      { $start: params.start, $end: params.end }
    );
  },

  getVisitorLocations(params) {
    return queryAll(
      `SELECT lat, lon, city, country, COUNT(*) as count
       FROM events WHERE lat IS NOT NULL AND lon IS NOT NULL AND created_at >= $start AND created_at <= $end
       GROUP BY ROUND(lat, 2), ROUND(lon, 2)`,
      { $start: params.start, $end: params.end }
    );
  },

  getCachedGeo(ip) {
    return queryOne(`SELECT * FROM geo_cache WHERE ip = $ip`, { $ip: ip });
  },

  cacheGeo(data) {
    runStmt(`DELETE FROM geo_cache WHERE ip = $ip`, { $ip: data.ip });
    runStmt(
      `INSERT INTO geo_cache (ip, city, region, country, lat, lon)
       VALUES ($ip, $city, $region, $country, $lat, $lon)`,
      { $ip: data.ip, $city: data.city, $region: data.region, $country: data.country, $lat: data.lat, $lon: data.lon }
    );
  },
};

module.exports = { initDB, queries, saveDB };

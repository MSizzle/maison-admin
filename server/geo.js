const { queries } = require('./db');

const requestQueue = [];
let processing = false;

async function resolveIP(ip) {
  const cached = queries.getCachedGeo(ip);
  if (cached) {
    return {
      city: cached.city,
      region: cached.region,
      country: cached.country,
      lat: cached.lat,
      lon: cached.lon,
    };
  }

  return new Promise((resolve) => {
    requestQueue.push({ ip, resolve });
    processQueue();
  });
}

async function processQueue() {
  if (processing || requestQueue.length === 0) return;
  processing = true;

  const batch = requestQueue.splice(0, Math.min(requestQueue.length, 15));

  if (batch.length === 1) {
    const { ip, resolve } = batch[0];
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,lat,lon,status`);
      const data = await res.json();
      if (data.status === 'success') {
        const geo = {
          city: data.city || 'Unknown',
          region: data.regionName || 'Unknown',
          country: data.country || 'Unknown',
          lat: data.lat || 0,
          lon: data.lon || 0,
        };
        queries.cacheGeo({ ip, ...geo });
        resolve(geo);
      } else {
        resolve(defaultGeo());
      }
    } catch {
      resolve(defaultGeo());
    }
  } else {
    const ips = batch.map((b) => b.ip);
    try {
      const res = await fetch('http://ip-api.com/batch?fields=city,regionName,country,lat,lon,status,query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ips),
      });
      const results = await res.json();
      results.forEach((data, i) => {
        if (data.status === 'success') {
          const geo = {
            city: data.city || 'Unknown',
            region: data.regionName || 'Unknown',
            country: data.country || 'Unknown',
            lat: data.lat || 0,
            lon: data.lon || 0,
          };
          queries.cacheGeo({ ip: ips[i], ...geo });
          batch[i].resolve(geo);
        } else {
          batch[i].resolve(defaultGeo());
        }
      });
    } catch {
      batch.forEach((b) => b.resolve(defaultGeo()));
    }
  }

  processing = false;
  if (requestQueue.length > 0) {
    setTimeout(processQueue, 1500);
  }
}

function defaultGeo() {
  return { city: 'Unknown', region: 'Unknown', country: 'Unknown', lat: 0, lon: 0 };
}

module.exports = { resolveIP };

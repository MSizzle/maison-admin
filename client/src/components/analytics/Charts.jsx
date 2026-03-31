import { useState, useEffect, memo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function Charts({ filters }) {
  const [topPages, setTopPages] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [geo, setGeo] = useState([]);
  const [timeGroup, setTimeGroup] = useState('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ start: filters.start, end: filters.end });

    Promise.all([
      fetch(`/api/analytics/top-pages?${params}`).then((r) => r.json()),
      fetch(`/api/analytics/traffic?${params}&group=${timeGroup}`).then((r) => r.json()),
      fetch(`/api/analytics/geo?${params}`).then((r) => r.json()),
    ])
      .then(([pages, trafficData, geoData]) => {
        setTopPages(pages);
        setTraffic(trafficData);
        setGeo(geoData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters.start, filters.end, timeGroup]);

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-cream-300 rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-text-secondary mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Traffic Over Time */}
      <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-text-primary">Traffic Over Time</h2>
          <div className="flex gap-1 bg-cream-100 rounded-lg p-0.5 border border-cream-300">
            {['hour', 'day', 'week', 'month'].map((g) => (
              <button
                key={g}
                onClick={() => setTimeGroup(g)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors capitalize ${
                  timeGroup === g ? 'bg-blue-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="skeleton h-[250px] rounded-lg" />
        ) : traffic.length === 0 ? (
          <p className="text-text-light text-sm text-center py-16 italic">No traffic data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE0" />
              <XAxis
                dataKey="period"
                stroke="#9A9A9A"
                fontSize={11}
                tickFormatter={(v) => v.length > 10 ? v.slice(5) : v}
              />
              <YAxis stroke="#9A9A9A" fontSize={11} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#2E5A88" strokeWidth={2} dot={false} name="Views" />
              <Line type="monotone" dataKey="visitors" stroke="#6B7B5E" strokeWidth={2} dot={false} name="Visitors" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-text-primary mb-4">Top Pages</h2>
        {loading ? (
          <div className="skeleton h-[250px] rounded-lg" />
        ) : topPages.length === 0 ? (
          <p className="text-text-light text-sm text-center py-16 italic">No page data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPages.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE0" horizontal={false} />
              <XAxis type="number" stroke="#9A9A9A" fontSize={11} />
              <YAxis
                type="category"
                dataKey="page_url"
                stroke="#9A9A9A"
                fontSize={11}
                width={120}
                tickFormatter={(v) => v.length > 20 ? '...' + v.slice(-17) : v}
              />
              <Tooltip content={customTooltip} />
              <Bar dataKey="views" fill="#2E5A88" radius={[0, 4, 4, 0]} name="Views" />
              <Bar dataKey="unique_visitors" fill="#5B8DB8" radius={[0, 4, 4, 0]} name="Unique" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Geo Breakdown */}
      <div className="bg-white rounded-xl border border-cream-300 p-5 lg:col-span-2 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-text-primary mb-4">Geo Breakdown</h2>
        {loading ? (
          <div className="skeleton h-[200px] rounded-lg" />
        ) : geo.length === 0 ? (
          <p className="text-text-light text-sm text-center py-8 italic">No geo data</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {geo.map((g, i) => (
              <div key={i} className="bg-cream-100 rounded-lg p-3 border border-cream-200">
                <p className="font-medium text-sm text-text-primary">{g.country}</p>
                {g.city && g.city !== 'Unknown' && (
                  <p className="text-xs text-text-light">{g.city}</p>
                )}
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-display font-bold text-blue-primary">{g.views}</span>
                  <span className="text-xs text-text-light">views</span>
                  <span className="text-xs text-cream-400">·</span>
                  <span className="text-xs text-text-secondary">{g.visitors} unique</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Charts);

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
    ]).then(([pages, t, g]) => {
      setTopPages(pages); setTraffic(t); setGeo(g); setLoading(false);
    }).catch(() => setLoading(false));
  }, [filters.start, filters.end, timeGroup]);

  const tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-surface-border rounded-lg px-3 py-2 text-[12px] shadow-raised">
        <p className="text-text-muted mb-0.5 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Traffic Over Time */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-text-primary">Traffic</h2>
          <div className="flex gap-0.5 bg-surface-raised rounded-lg p-0.5 border border-surface-border">
            {['hour', 'day', 'week', 'month'].map((g) => (
              <button
                key={g}
                onClick={() => setTimeGroup(g)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all capitalize ${
                  timeGroup === g ? 'bg-blue-primary text-white shadow-card' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        {loading ? <div className="skeleton h-[240px] rounded-lg" /> : traffic.length === 0 ? (
          <Empty>No traffic data</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="period" stroke="#9CA3AF" fontSize={10} tickFormatter={(v) => v.length > 10 ? v.slice(5) : v} />
              <YAxis stroke="#9CA3AF" fontSize={10} />
              <Tooltip content={tip} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              <Line type="monotone" dataKey="views" stroke="#2E5A88" strokeWidth={2} dot={false} name="Views" />
              <Line type="monotone" dataKey="visitors" stroke="#6B7B5E" strokeWidth={2} dot={false} name="Visitors" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Top Pages */}
      <Card>
        <h2 className="font-display text-lg font-bold text-text-primary mb-5">Top Pages</h2>
        {loading ? <div className="skeleton h-[240px] rounded-lg" /> : topPages.length === 0 ? (
          <Empty>No page data</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topPages.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" stroke="#9CA3AF" fontSize={10} />
              <YAxis type="category" dataKey="page_url" stroke="#9CA3AF" fontSize={10} width={110} tickFormatter={(v) => v.length > 18 ? '…' + v.slice(-15) : v} />
              <Tooltip content={tip} />
              <Bar dataKey="views" fill="#2E5A88" radius={[0, 3, 3, 0]} name="Views" />
              <Bar dataKey="unique_visitors" fill="#5B8DB8" radius={[0, 3, 3, 0]} name="Unique" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Geo Breakdown */}
      <div className="lg:col-span-2">
        <Card>
          <h2 className="font-display text-lg font-bold text-text-primary mb-4">Geo Breakdown</h2>
          {loading ? <div className="skeleton h-[180px] rounded-lg" /> : geo.length === 0 ? (
            <Empty>No geo data</Empty>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
              {geo.map((g, i) => (
                <div key={i} className="bg-surface-raised rounded-lg px-3 py-2.5 border border-surface-border">
                  <p className="font-semibold text-[13px] text-text-primary">{g.country}</p>
                  {g.city && g.city !== 'Unknown' && <p className="text-[11px] text-text-muted">{g.city}</p>}
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-display font-bold text-blue-primary tabular-nums">{g.views}</span>
                    <span className="text-[10px] text-text-muted font-medium">views</span>
                    <span className="text-[10px] text-surface-muted">·</span>
                    <span className="text-[11px] text-text-secondary tabular-nums">{g.visitors}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ children }) {
  return <div className="bg-white rounded-xl border border-surface-border p-5 shadow-card">{children}</div>;
}

function Empty({ children }) {
  return <p className="text-text-muted text-sm text-center py-14">{children}</p>;
}

export default memo(Charts);

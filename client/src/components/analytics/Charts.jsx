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
      <div className="bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Traffic Over Time */}
      <div className="bg-dark-850 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Traffic Over Time</h2>
          <div className="flex gap-1 bg-dark-800 rounded-lg p-0.5">
            {['hour', 'day', 'week', 'month'].map((g) => (
              <button
                key={g}
                onClick={() => setTimeGroup(g)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors capitalize ${
                  timeGroup === g ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
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
          <p className="text-gray-500 text-sm text-center py-16">No traffic data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="period"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(v) => v.length > 10 ? v.slice(5) : v}
              />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} dot={false} name="Views" />
              <Line type="monotone" dataKey="visitors" stroke="#10B981" strokeWidth={2} dot={false} name="Visitors" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Pages */}
      <div className="bg-dark-850 rounded-xl border border-gray-800 p-5">
        <h2 className="text-lg font-semibold mb-4">Top Pages</h2>
        {loading ? (
          <div className="skeleton h-[250px] rounded-lg" />
        ) : topPages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-16">No page data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPages.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis
                type="category"
                dataKey="page_url"
                stroke="#64748b"
                fontSize={11}
                width={120}
                tickFormatter={(v) => v.length > 20 ? '...' + v.slice(-17) : v}
              />
              <Tooltip content={customTooltip} />
              <Bar dataKey="views" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Views" />
              <Bar dataKey="unique_visitors" fill="#10B981" radius={[0, 4, 4, 0]} name="Unique" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Geo Breakdown */}
      <div className="bg-dark-850 rounded-xl border border-gray-800 p-5 lg:col-span-2">
        <h2 className="text-lg font-semibold mb-4">Geo Breakdown</h2>
        {loading ? (
          <div className="skeleton h-[200px] rounded-lg" />
        ) : geo.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No geo data</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {geo.map((g, i) => (
              <div key={i} className="bg-dark-800 rounded-lg p-3">
                <p className="font-medium text-sm">{g.country}</p>
                {g.city && g.city !== 'Unknown' && (
                  <p className="text-xs text-gray-500">{g.city}</p>
                )}
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-semibold text-accent">{g.views}</span>
                  <span className="text-xs text-gray-500">views</span>
                  <span className="text-xs text-gray-600">·</span>
                  <span className="text-xs text-gray-400">{g.visitors} unique</span>
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

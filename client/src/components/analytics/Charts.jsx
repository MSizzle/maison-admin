import { useState, useEffect, memo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Charts({ filters }) {
  const [topPages, setTopPages] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [geo, setGeo] = useState([]);
  const [timeGroup, setTimeGroup] = useState('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ start: filters.start, end: filters.end });
    Promise.all([
      fetch(`/api/analytics/top-pages?${p}`).then(r => r.json()),
      fetch(`/api/analytics/traffic?${p}&group=${timeGroup}`).then(r => r.json()),
      fetch(`/api/analytics/geo?${p}`).then(r => r.json()),
    ]).then(([a, b, c]) => { setTopPages(a); setTraffic(b); setGeo(c); setLoading(false); }).catch(() => setLoading(false));
  }, [filters.start, filters.end, timeGroup]);

  const tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-panel border border-border rounded px-2.5 py-1.5 text-[11px] font-mono">
        <p className="text-t4 mb-0.5">{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Traffic">
        <div className="flex gap-0.5 mb-4">
          {['hour', 'day', 'week', 'month'].map(g => (
            <button key={g} onClick={() => setTimeGroup(g)}
              className={`px-2 py-0.5 font-mono text-[10px] rounded transition-colors ${
                timeGroup === g ? 'bg-accent text-white' : 'text-t4 hover:text-t2 bg-panel'
              }`}>{g}</button>
          ))}
        </div>
        {loading ? <div className="skeleton h-[220px] rounded" /> : traffic.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
              <XAxis dataKey="period" stroke="#475569" fontSize={9} fontFamily="JetBrains Mono" tickFormatter={v => v.length > 10 ? v.slice(5) : v} />
              <YAxis stroke="#475569" fontSize={9} fontFamily="JetBrains Mono" />
              <Tooltip content={tip} />
              <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="views" />
              <Line type="monotone" dataKey="visitors" stroke="#22C55E" strokeWidth={1.5} dot={false} name="visitors" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="Top Pages">
        {loading ? <div className="skeleton h-[220px] rounded" /> : topPages.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPages.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" horizontal={false} />
              <XAxis type="number" stroke="#475569" fontSize={9} fontFamily="JetBrains Mono" />
              <YAxis type="category" dataKey="page_url" stroke="#475569" fontSize={9} fontFamily="JetBrains Mono" width={100} tickFormatter={v => v.length > 16 ? '…' + v.slice(-14) : v} />
              <Tooltip content={tip} />
              <Bar dataKey="views" fill="#3B82F6" radius={[0, 2, 2, 0]} name="views" />
              <Bar dataKey="unique_visitors" fill="#3B82F6" fillOpacity={0.4} radius={[0, 2, 2, 0]} name="unique" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="lg:col-span-2">
        <Card title="Geo">
          {loading ? <div className="skeleton h-[160px] rounded" /> : geo.length === 0 ? <Empty /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {geo.map((g, i) => (
                <div key={i} className="bg-panel rounded px-2.5 py-2 border border-border">
                  <p className="text-xs font-semibold text-t1 truncate">{g.country}</p>
                  {g.city !== 'Unknown' && <p className="text-[10px] text-t4 truncate">{g.city}</p>}
                  <p className="font-mono text-sm font-bold text-accent tabular-nums mt-0.5">{g.views}<span className="text-[10px] text-t4 font-normal ml-1">/ {g.visitors}u</span></p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-t1 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Empty() { return <p className="text-t4 text-xs font-mono py-10 text-center">No data</p>; }

export default memo(Charts);

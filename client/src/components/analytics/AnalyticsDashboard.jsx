import { useState, useEffect, useRef } from 'react';
import LiveVisitors from './LiveVisitors';
import VisitorLog from './VisitorLog';
import MapView from './MapView';
import Charts from './Charts';

export default function AnalyticsDashboard() {
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [dateRange, setDateRange] = useState({ start: getDefaultStart(), end: getDefaultEnd() });
  const [countryFilter, setCountryFilter] = useState('');
  const [pageFilter, setPageFilter] = useState('');
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/ws?type=dashboard`);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'active_visitors') setActiveVisitors(msg.data);
      };
      ws.onclose = () => setTimeout(connect, 3000);
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  const filters = { ...dateRange, country: countryFilter, page_url: pageFilter };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary tracking-tight">Analytics</h1>
          <p className="text-[13px] text-text-muted mt-1">Visitor insights for Moulin à Rêves</p>
        </div>
        <div className="flex items-center gap-2">
          <FilterInput type="date" value={dateRange.start.split('T')[0]} onChange={(v) => setDateRange((r) => ({ ...r, start: v + 'T00:00:00' }))} />
          <span className="text-text-muted text-xs">—</span>
          <FilterInput type="date" value={dateRange.end.split('T')[0]} onChange={(v) => setDateRange((r) => ({ ...r, end: v + 'T23:59:59' }))} />
          <div className="w-px h-6 bg-surface-border mx-1" />
          <FilterInput type="text" placeholder="Country" value={countryFilter} onChange={setCountryFilter} className="w-28" />
          <FilterInput type="text" placeholder="Page" value={pageFilter} onChange={setPageFilter} className="w-28" />
        </div>
      </div>

      <LiveVisitors visitors={activeVisitors} />
      <Charts filters={filters} />
      <MapView filters={filters} />
      <VisitorLog filters={filters} />
    </div>
  );
}

function FilterInput({ type, value, onChange, placeholder, className = '' }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-white border border-surface-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary placeholder-text-muted focus:border-blue-primary focus:ring-1 focus:ring-blue-primary/20 focus:outline-none shadow-card transition-shadow hover:shadow-raised ${className}`}
    />
  );
}

function getDefaultStart() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0] + 'T00:00:00';
}
function getDefaultEnd() {
  return new Date().toISOString().split('T')[0] + 'T23:59:59';
}

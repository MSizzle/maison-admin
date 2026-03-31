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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-light mt-0.5">Visitor insights for Moulin à Rêves</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateRange.start.split('T')[0]}
            onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value + 'T00:00:00' }))}
            className="bg-white border border-cream-300 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-blue-primary focus:outline-none shadow-sm"
          />
          <span className="text-text-light">to</span>
          <input
            type="date"
            value={dateRange.end.split('T')[0]}
            onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value + 'T23:59:59' }))}
            className="bg-white border border-cream-300 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-blue-primary focus:outline-none shadow-sm"
          />
          <input
            type="text"
            placeholder="Filter country..."
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-white border border-cream-300 rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder-cream-500 focus:border-blue-primary focus:outline-none w-36 shadow-sm"
          />
          <input
            type="text"
            placeholder="Filter page..."
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="bg-white border border-cream-300 rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder-cream-500 focus:border-blue-primary focus:outline-none w-36 shadow-sm"
          />
        </div>
      </div>

      <LiveVisitors visitors={activeVisitors} />
      <Charts filters={filters} />
      <MapView filters={filters} />
      <VisitorLog filters={filters} />
    </div>
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

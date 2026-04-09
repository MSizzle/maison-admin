import { useState, useEffect, useRef } from 'react';
import LiveVisitors from './LiveVisitors';
import VisitorLog from './VisitorLog';
import MapView from './MapView';
import Charts from './Charts';
import { getWSUrl } from '../../config';

export default function AnalyticsDashboard() {
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [dateRange, setDateRange] = useState({ start: getDefaultStart(), end: getDefaultEnd() });
  const [countryFilter, setCountryFilter] = useState('');
  const [pageFilter, setPageFilter] = useState('');
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(getWSUrl('type=dashboard'));
      wsRef.current = ws;
      ws.onmessage = (e) => { const msg = JSON.parse(e.data); if (msg.type === 'active_visitors') setActiveVisitors(msg.data); };
      ws.onclose = () => setTimeout(connect, 3000);
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  const filters = { ...dateRange, country: countryFilter, page_url: pageFilter };

  return (
    <div className="p-6 space-y-4 max-w-[1600px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-t1">Analytics</h1>
        <div className="flex items-center gap-2">
          <Input type="date" value={dateRange.start.split('T')[0]} onChange={(v) => setDateRange(r => ({ ...r, start: v + 'T00:00:00' }))} />
          <span className="text-t4 text-xs">to</span>
          <Input type="date" value={dateRange.end.split('T')[0]} onChange={(v) => setDateRange(r => ({ ...r, end: v + 'T23:59:59' }))} />
          <span className="text-border mx-1">|</span>
          <Input type="text" placeholder="country" value={countryFilter} onChange={setCountryFilter} w="w-24" />
          <Input type="text" placeholder="page" value={pageFilter} onChange={setPageFilter} w="w-24" />
        </div>
      </div>
      <LiveVisitors visitors={activeVisitors} />
      <Charts filters={filters} />
      <MapView filters={filters} />
      <VisitorLog filters={filters} />
    </div>
  );
}

function Input({ type, value, onChange, placeholder, w = '' }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
    className={`bg-card border border-border rounded px-2.5 py-1 text-xs text-t1 placeholder-t4 focus:border-accent focus:outline-none font-mono ${w}`} />;
}

function getDefaultStart() { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] + 'T00:00:00'; }
function getDefaultEnd() { return new Date().toISOString().split('T')[0] + 'T23:59:59'; }

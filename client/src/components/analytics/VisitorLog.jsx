import { useState, useEffect } from 'react';

export default function VisitorLog({ filters }) {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => { fetchEvents(1); }, [filters]);

  async function fetchEvents(page) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: '25',
      ...(filters.start && { start: filters.start }), ...(filters.end && { end: filters.end }),
      ...(filters.country && { country: filters.country }), ...(filters.page_url && { page_url: filters.page_url }),
    });
    try { const r = await fetch(`/api/events?${params}`); const d = await r.json(); setEvents(d.events || []); setPagination(d.pagination || { page: 1, pages: 1, total: 0 }); }
    catch { setEvents([]); }
    setLoading(false);
  }

  const sorted = [...events].sort((a, b) => {
    const va = a[sortField] ?? '', vb = b[sortField] ?? '';
    return typeof va === 'number' ? (sortDir === 'asc' ? va - vb : vb - va) : (sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va)));
  });

  function toggleSort(f) { sortField === f ? setSortDir(d => d === 'asc' ? 'desc' : 'asc') : (setSortField(f), setSortDir('desc')); }

  const cols = [
    { key: 'visitor_id', label: 'VISITOR', w: '' },
    { key: 'page_url', label: 'PAGE', w: 'max-w-[200px]' },
    { key: 'city', label: 'LOCATION', w: '' },
    { key: 'device', label: 'DEVICE', w: '' },
    { key: 'browser', label: 'BROWSER', w: '' },
    { key: 'duration_seconds', label: 'DUR', w: '' },
    { key: 'created_at', label: 'TIME', w: '' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <span className="text-sm font-semibold text-t1">Visitor Log</span>
        <span className="font-mono text-[11px] text-t4">{pagination.total} rows</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-panel">
              {cols.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  className="text-left px-4 py-2 font-mono font-semibold text-[10px] text-accent tracking-widest cursor-pointer hover:text-accent-hover select-none whitespace-nowrap border-b border-border">
                  {col.label}
                  {sortField === col.key && <span className="ml-1 text-t4">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>{cols.map(c => <td key={c.key} className="px-4 py-2.5"><div className="skeleton h-3 rounded w-16" /></td>)}</tr>
            )) : sorted.length === 0 ? (
              <tr><td colSpan={cols.length} className="px-4 py-12 text-center text-t4 font-mono">No data</td></tr>
            ) : sorted.map(evt => (
              <tr key={evt.id} className="hover:bg-hover transition-colors">
                <td className="px-4 py-2 font-mono text-[11px] text-t3">{evt.visitor_id?.slice(0, 8)}</td>
                <td className="px-4 py-2 text-t1 font-medium truncate max-w-[200px]">{evt.page_url}</td>
                <td className="px-4 py-2 text-t2">{evt.city && evt.country ? `${evt.city}, ${evt.country}` : '—'}</td>
                <td className="px-4 py-2 text-t3 capitalize">{evt.device}</td>
                <td className="px-4 py-2 text-t3">{evt.browser}</td>
                <td className="px-4 py-2 font-mono text-t3 tabular-nums">{fmtDur(evt.duration_seconds)}</td>
                <td className="px-4 py-2 font-mono text-t4 text-[10px] whitespace-nowrap tabular-nums">{fmtTime(evt.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
          <span className="font-mono text-[10px] text-t4">{pagination.page}/{pagination.pages}</span>
          <div className="flex gap-1">
            <Btn disabled={pagination.page <= 1} onClick={() => fetchEvents(pagination.page - 1)}>← prev</Btn>
            <Btn disabled={pagination.page >= pagination.pages} onClick={() => fetchEvents(pagination.page + 1)}>next →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function Btn({ children, disabled, onClick }) {
  return <button disabled={disabled} onClick={onClick}
    className="px-2.5 py-1 font-mono text-[10px] text-t3 bg-panel border border-border rounded disabled:opacity-30 hover:bg-hover hover:text-t2 transition-colors">{children}</button>;
}

function fmtDur(s) { if (!s) return '—'; if (s < 60) return `${s}s`; return `${Math.floor(s/60)}m${s%60}s`; }
function fmtTime(t) { if (!t) return '—'; const d = new Date(t + (t.includes('Z') || t.includes('+') ? '' : 'Z')); return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

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
      ...(filters.start && { start: filters.start }),
      ...(filters.end && { end: filters.end }),
      ...(filters.country && { country: filters.country }),
      ...(filters.page_url && { page_url: filters.page_url }),
    });
    try {
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch { setEvents([]); }
    setLoading(false);
  }

  const sorted = [...events].sort((a, b) => {
    const va = a[sortField] ?? '', vb = b[sortField] ?? '';
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  function toggleSort(field) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  }

  const columns = [
    { key: 'visitor_id', label: 'Visitor' },
    { key: 'page_url', label: 'Page' },
    { key: 'city', label: 'Location' },
    { key: 'device', label: 'Device' },
    { key: 'browser', label: 'Browser' },
    { key: 'duration_seconds', label: 'Duration' },
    { key: 'created_at', label: 'Time' },
  ];

  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden shadow-card">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-xl font-bold text-text-primary">Visitor Log</h2>
          <span className="text-[12px] text-text-muted font-medium tabular-nums">{pagination.total} visits</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-primary/[0.04] border-y border-surface-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left px-4 py-2.5 text-[11px] font-bold text-blue-primary uppercase tracking-wider cursor-pointer hover:text-blue-dark select-none whitespace-nowrap font-display"
                >
                  {col.label}
                  {sortField === col.key && (
                    <span className="ml-1 text-blue-light">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3"><div className="skeleton h-3.5 rounded w-16" /></td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-text-muted text-sm">
                  No events found
                </td>
              </tr>
            ) : (
              sorted.map((evt) => (
                <tr key={evt.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-text-muted">{evt.visitor_id?.slice(0, 8)}</td>
                  <td className="px-4 py-2.5 text-[13px] text-text-primary font-medium max-w-[200px] truncate">{evt.page_url}</td>
                  <td className="px-4 py-2.5 text-[13px] text-text-secondary">{evt.city && evt.country ? `${evt.city}, ${evt.country}` : '—'}</td>
                  <td className="px-4 py-2.5 text-[13px] text-text-secondary capitalize">{evt.device}</td>
                  <td className="px-4 py-2.5 text-[13px] text-text-secondary">{evt.browser}</td>
                  <td className="px-4 py-2.5 text-[13px] text-text-muted tabular-nums">{formatDuration(evt.duration_seconds)}</td>
                  <td className="px-4 py-2.5 text-[12px] text-text-muted whitespace-nowrap tabular-nums">{formatTime(evt.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-5 py-3 border-t border-surface-border flex items-center justify-between">
          <span className="text-[12px] text-text-muted font-medium">
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex gap-1.5">
            <PagBtn disabled={pagination.page <= 1} onClick={() => fetchEvents(pagination.page - 1)}>Prev</PagBtn>
            <PagBtn disabled={pagination.page >= pagination.pages} onClick={() => fetchEvents(pagination.page + 1)}>Next</PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PagBtn({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="px-3 py-1 text-[12px] font-medium bg-surface-raised rounded-md border border-surface-border disabled:opacity-30 hover:bg-surface-bg hover:shadow-card transition-all text-text-secondary"
    >
      {children}
    </button>
  );
}

function formatDuration(s) {
  if (!s) return '—';
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatTime(t) {
  if (!t) return '—';
  const d = new Date(t + (t.includes('Z') || t.includes('+') ? '' : 'Z'));
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

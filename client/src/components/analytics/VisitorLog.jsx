import { useState, useEffect } from 'react';

export default function VisitorLog({ filters }) {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetchEvents(1);
  }, [filters]);

  async function fetchEvents(page) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '25',
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
    } catch {
      setEvents([]);
    }
    setLoading(false);
  }

  const sorted = [...events].sort((a, b) => {
    const va = a[sortField] ?? '';
    const vb = b[sortField] ?? '';
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
    <div className="bg-white rounded-xl border border-cream-300 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-cream-200 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-text-primary">Visitor Log</h2>
        <span className="text-sm text-text-light">{pagination.total} total visits</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream-200 bg-cream-100/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left px-4 py-3 text-text-secondary font-medium cursor-pointer hover:text-text-primary select-none whitespace-nowrap text-xs uppercase tracking-wider"
                >
                  {col.label}
                  {sortField === col.key && (
                    <span className="ml-1 text-blue-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-cream-200/50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="skeleton h-4 rounded w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-light italic">
                  No events found
                </td>
              </tr>
            ) : (
              sorted.map((evt) => (
                <tr key={evt.id} className="border-b border-cream-200/50 hover:bg-cream-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text-light">{evt.visitor_id?.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-text-primary max-w-[200px] truncate">{evt.page_url}</td>
                  <td className="px-4 py-3 text-text-secondary">{evt.city && evt.country ? `${evt.city}, ${evt.country}` : 'Unknown'}</td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{evt.device}</td>
                  <td className="px-4 py-3 text-text-secondary">{evt.browser}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDuration(evt.duration_seconds)}</td>
                  <td className="px-4 py-3 text-text-light whitespace-nowrap">{formatTime(evt.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="p-4 border-t border-cream-200 flex items-center justify-between">
          <span className="text-sm text-text-light">
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchEvents(pagination.page - 1)}
              className="px-3 py-1.5 text-sm bg-cream-100 rounded-lg border border-cream-300 disabled:opacity-40 hover:bg-cream-200 transition-colors text-text-secondary"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchEvents(pagination.page + 1)}
              className="px-3 py-1.5 text-sm bg-cream-100 rounded-lg border border-cream-300 disabled:opacity-40 hover:bg-cream-200 transition-colors text-text-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
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

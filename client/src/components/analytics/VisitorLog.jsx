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
    <div className="bg-dark-850 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Visitor Log</h2>
        <span className="text-sm text-gray-500">{pagination.total} total visits</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-gray-200 select-none whitespace-nowrap"
                >
                  {col.label}
                  {sortField === col.key && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="skeleton h-4 rounded w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  No events found
                </td>
              </tr>
            ) : (
              sorted.map((evt) => (
                <tr key={evt.id} className="border-b border-gray-800/50 hover:bg-dark-800 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{evt.visitor_id?.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-200 max-w-[200px] truncate">{evt.page_url}</td>
                  <td className="px-4 py-3 text-gray-300">{evt.city && evt.country ? `${evt.city}, ${evt.country}` : 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{evt.device}</td>
                  <td className="px-4 py-3 text-gray-400">{evt.browser}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDuration(evt.duration_seconds)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatTime(evt.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchEvents(pagination.page - 1)}
              className="px-3 py-1.5 text-sm bg-dark-800 rounded-lg border border-gray-700 disabled:opacity-40 hover:bg-dark-700 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchEvents(pagination.page + 1)}
              className="px-3 py-1.5 text-sm bg-dark-800 rounded-lg border border-gray-700 disabled:opacity-40 hover:bg-dark-700 transition-colors"
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

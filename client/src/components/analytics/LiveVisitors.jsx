import { useState, useEffect, useRef } from 'react';

export default function LiveVisitors({ visitors }) {
  const [newIds, setNewIds] = useState(new Set());
  const prevIds = useRef(new Set());

  useEffect(() => {
    const cur = new Set(visitors.map(v => v.visitor_id));
    const arriving = new Set([...cur].filter(id => !prevIds.current.has(id)));
    if (arriving.size > 0) { setNewIds(arriving); setTimeout(() => setNewIds(new Set()), 2000); }
    prevIds.current = cur;
  }, [visitors]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 bg-green/10 px-2 py-0.5 rounded font-mono text-[11px] text-green font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />
          LIVE
        </div>
        <span className="text-sm font-semibold text-t1">Active Visitors</span>
        <span className="ml-auto text-2xl font-bold font-mono text-accent tabular-nums">{visitors.length}</span>
      </div>

      {visitors.length === 0 ? (
        <p className="text-t4 text-xs font-mono py-3">No active sessions</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {visitors.map(v => (
            <div key={v.visitor_id} className={`bg-panel rounded px-3 py-2 border transition-all ${
              newIds.has(v.visitor_id) ? 'border-green/40 animate-fade-in' : 'border-border'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-t4">{v.visitor_id.slice(0, 8)}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green" />
              </div>
              <p className="text-xs text-t1 truncate font-medium mt-0.5">{v.page_url}</p>
              <p className="text-[10px] text-t4 font-mono mt-0.5">
                {v.city && v.country ? `${v.city}, ${v.country}` : '—'} · {v.device || 'desktop'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

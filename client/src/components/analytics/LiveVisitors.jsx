import { useState, useEffect, useRef } from 'react';

export default function LiveVisitors({ visitors }) {
  const [newIds, setNewIds] = useState(new Set());
  const prevIds = useRef(new Set());

  useEffect(() => {
    const currentIds = new Set(visitors.map((v) => v.visitor_id));
    const arriving = new Set();
    for (const id of currentIds) {
      if (!prevIds.current.has(id)) arriving.add(id);
    }
    if (arriving.size > 0) {
      setNewIds(arriving);
      setTimeout(() => setNewIds(new Set()), 2000);
    }
    prevIds.current = currentIds;
  }, [visitors]);

  return (
    <div className="bg-white rounded-xl border border-surface-border p-5 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-garden/10 px-3 py-1 rounded-full">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-garden" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-garden animate-ping opacity-75" />
          </div>
          <span className="text-[13px] font-semibold text-garden">Live</span>
        </div>
        <h2 className="font-display text-xl font-bold text-text-primary">Visitors</h2>
        <span className="ml-auto text-4xl font-display font-bold text-blue-primary tabular-nums">{visitors.length}</span>
      </div>

      {visitors.length === 0 ? (
        <p className="text-text-muted text-sm py-4">No active visitors right now</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {visitors.map((v) => (
            <div
              key={v.visitor_id}
              className={`bg-surface-raised rounded-lg px-3 py-2.5 border transition-all ${
                newIds.has(v.visitor_id) ? 'border-garden/40 animate-fade-in shadow-raised' : 'border-surface-border'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-mono text-text-muted">{v.visitor_id.slice(0, 8)}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-garden animate-pulse-dot" />
              </div>
              <p className="text-[13px] text-text-primary truncate font-semibold">{v.page_url}</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {v.city && v.country ? `${v.city}, ${v.country}` : 'Unknown'}
                <span className="mx-1">·</span>
                <span className="capitalize">{v.device || 'desktop'}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

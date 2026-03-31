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
    <div className="bg-dark-850 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </div>
        <h2 className="text-lg font-semibold">Live Visitors</h2>
        <span className="ml-auto text-3xl font-bold text-emerald-400">{visitors.length}</span>
      </div>

      {visitors.length === 0 ? (
        <p className="text-gray-500 text-sm">No active visitors right now</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {visitors.map((v) => (
            <div
              key={v.visitor_id}
              className={`bg-dark-800 rounded-lg p-3 border transition-all ${
                newIds.has(v.visitor_id) ? 'border-emerald-500/50 animate-fade-in' : 'border-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                <span className="text-xs font-mono text-gray-400">{v.visitor_id.slice(0, 8)}</span>
              </div>
              <p className="text-sm text-gray-200 truncate">{v.page_url}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{v.city && v.country ? `${v.city}, ${v.country}` : 'Unknown'}</span>
                <span>·</span>
                <span className="capitalize">{v.device || 'desktop'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

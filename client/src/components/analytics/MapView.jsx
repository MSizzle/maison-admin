import { useState, useEffect, memo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function MapView({ filters }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ start: filters.start, end: filters.end });
    fetch(`/api/analytics/locations?${p}`).then(r => r.json())
      .then(d => { setLocations(d.filter(x => x.lat && x.lon)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters.start, filters.end]);

  const max = Math.max(1, ...locations.map(l => l.count));

  return (
    <div className="bg-card border border-border rounded-lg p-4 relative">
      <h3 className="text-sm font-semibold text-t1 mb-3">Map</h3>
      {loading ? <div className="skeleton h-[350px] rounded" /> : (
        <div className="relative rounded overflow-hidden bg-panel border border-border">
          <ComposableMap projectionConfig={{ scale: 147, center: [0, 20] }} style={{ width: '100%', height: 'auto' }}>
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) => geographies.map(geo => (
                  <Geography key={geo.rsmKey} geography={geo} fill="#1C1F2B" stroke="#2A2D3A" strokeWidth={0.5}
                    style={{ default: { outline: 'none' }, hover: { fill: '#252836', outline: 'none' }, pressed: { outline: 'none' } }} />
                ))}
              </Geographies>
              {locations.map((loc, i) => (
                <Marker key={i} coordinates={[loc.lon, loc.lat]} onMouseEnter={() => setTooltip(loc)} onMouseLeave={() => setTooltip(null)}>
                  <circle r={3 + (loc.count / max) * 12} fill="#3B82F6" fillOpacity={0.5} stroke="#3B82F6" strokeWidth={1} strokeOpacity={0.8} style={{ cursor: 'pointer' }} />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
          {tooltip && (
            <div className="absolute top-3 right-3 bg-card border border-border rounded px-2.5 py-1.5 font-mono text-[11px] pointer-events-none">
              <p className="text-t1 font-medium">{tooltip.city}, {tooltip.country}</p>
              <p className="text-t4">{tooltip.count} hit{tooltip.count !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}
      {!loading && locations.length === 0 && <p className="text-t4 text-xs font-mono text-center py-8">No location data</p>}
    </div>
  );
}

export default memo(MapView);
